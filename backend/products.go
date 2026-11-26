package main

import (
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type Product struct {
	ID          int64     `json:"id"`
	AuthorID    int64     `json:"author_id"`
	AuthorName  string    `json:"author_name"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Link        string    `json:"link"`
	ImageURL    string    `json:"image_url"`
	Tags        string    `json:"tags"`
	Views       int       `json:"views"`
	Hidden      bool      `json:"hidden"`
	AvgRating   float64   `json:"avg_rating"`
	Feedbacks   int       `json:"feedback_count"`
	CreatedAt   time.Time `json:"created_at"`
}

// Câu SELECT dùng chung: lấy sản phẩm kèm tên tác giả, điểm trung bình và số góp ý.
const productSelect = `
SELECT p.id, p.author_id, u.name, p.title, p.description, p.link, p.image_url,
       p.tags, p.views, p.hidden,
       COALESCE((SELECT AVG(rating) FROM feedbacks f WHERE f.product_id = p.id), 0),
       (SELECT COUNT(*) FROM feedbacks f WHERE f.product_id = p.id),
       p.created_at
FROM products p
JOIN users u ON u.id = p.author_id
`

func scanProduct(row pgx.Row) (Product, error) {
	var p Product
	err := row.Scan(&p.ID, &p.AuthorID, &p.AuthorName, &p.Title, &p.Description, &p.Link,
		&p.ImageURL, &p.Tags, &p.Views, &p.Hidden, &p.AvgRating, &p.Feedbacks, &p.CreatedAt)
	return p, err
}

func queryProducts(c *gin.Context, sql string, args ...any) ([]Product, error) {
	rows, err := db.Query(c, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := []Product{} // để JSON trả [] thay vì null khi rỗng
	for rows.Next() {
		p, err := scanProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

// GET /api/products?q=tên&tag=game
func listProducts(c *gin.Context) {
	q := "%" + c.Query("q") + "%"
	tag := "%" + c.Query("tag") + "%"
	products, err := queryProducts(c,
		productSelect+` WHERE p.hidden = false AND p.title ILIKE $1 AND p.tags ILIKE $2
		 ORDER BY p.created_at DESC LIMIT 100`, q, tag)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, products)
}

// GET /api/products/:id (mỗi lần xem thì tăng lượt xem lên 1)
func getProduct(c *gin.Context) {
	id, ok := idParam(c)
	if !ok {
		return
	}
	db.Exec(c, `UPDATE products SET views = views + 1 WHERE id = $1`, id)

	p, err := scanProduct(db.QueryRow(c, productSelect+` WHERE p.id = $1`, id))
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && p.Hidden) {
		c.JSON(404, gin.H{"error": "Không tìm thấy sản phẩm"})
		return
	}
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, p)
}

type productInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Link        string `json:"link"`
	ImageURL    string `json:"image_url"`
	Tags        string `json:"tags"`
}

// POST /api/products
func createProduct(c *gin.Context) {
	var in productInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "Tên sản phẩm là bắt buộc"})
		return
	}
	var id int64
	err := db.QueryRow(c,
		`INSERT INTO products (author_id, title, description, link, image_url, tags)
		 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
		currentUserID(c), in.Title, in.Description, in.Link, in.ImageURL, in.Tags,
	).Scan(&id)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(201, gin.H{"id": id})
}

// canEdit: chỉ tác giả của sản phẩm hoặc admin mới được sửa/xoá.
func canEdit(c *gin.Context, productID int64) bool {
	var authorID int64
	err := db.QueryRow(c, `SELECT author_id FROM products WHERE id = $1`, productID).Scan(&authorID)
	if err != nil {
		c.JSON(404, gin.H{"error": "Không tìm thấy sản phẩm"})
		return false
	}
	if authorID != currentUserID(c) && c.GetString("role") != "admin" {
		c.JSON(403, gin.H{"error": "Bạn không phải tác giả của sản phẩm này"})
		return false
	}
	return true
}

// PUT /api/products/:id
func updateProduct(c *gin.Context) {
	id, ok := idParam(c)
	if !ok || !canEdit(c, id) {
		return
	}
	var in productInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "Tên sản phẩm là bắt buộc"})
		return
	}
	_, err := db.Exec(c,
		`UPDATE products SET title=$1, description=$2, link=$3, image_url=$4, tags=$5 WHERE id=$6`,
		in.Title, in.Description, in.Link, in.ImageURL, in.Tags, id)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, gin.H{"ok": true})
}

// DELETE /api/products/:id
func deleteProduct(c *gin.Context) {
	id, ok := idParam(c)
	if !ok || !canEdit(c, id) {
		return
	}
	if _, err := db.Exec(c, `DELETE FROM products WHERE id = $1`, id); err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, gin.H{"ok": true})
}

// GET /api/me/dashboard: sản phẩm của tôi kèm lượt xem, điểm và số góp ý.
func authorDashboard(c *gin.Context) {
	products, err := queryProducts(c,
		productSelect+` WHERE p.author_id = $1 ORDER BY p.created_at DESC`, currentUserID(c))
	if err != nil {
		serverError(c, err)
		return
	}
	totalViews, totalFeedbacks := 0, 0
	for _, p := range products {
		totalViews += p.Views
		totalFeedbacks += p.Feedbacks
	}
	c.JSON(200, gin.H{
		"products":        products,
		"total_products":  len(products),
		"total_views":     totalViews,
		"total_feedbacks": totalFeedbacks,
	})
}
