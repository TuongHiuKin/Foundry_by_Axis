package main

import (
	"time"

	"github.com/gin-gonic/gin"
)

type Feedback struct {
	ID        int64     `json:"id"`
	ProductID int64     `json:"product_id"`
	UserID    int64     `json:"user_id"`
	UserName  string    `json:"user_name"`
	Section   string    `json:"section"`
	Rating    int       `json:"rating"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// GET /api/products/:id/feedbacks
func listFeedbacks(c *gin.Context) {
	id, ok := idParam(c)
	if !ok {
		return
	}
	rows, err := db.Query(c,
		`SELECT f.id, f.product_id, f.user_id, u.name, f.section, f.rating, f.content, f.created_at
		 FROM feedbacks f JOIN users u ON u.id = f.user_id
		 WHERE f.product_id = $1 ORDER BY f.created_at DESC`, id)
	if err != nil {
		serverError(c, err)
		return
	}
	defer rows.Close()

	list := []Feedback{}
	for rows.Next() {
		var f Feedback
		if err := rows.Scan(&f.ID, &f.ProductID, &f.UserID, &f.UserName, &f.Section,
			&f.Rating, &f.Content, &f.CreatedAt); err != nil {
			serverError(c, err)
			return
		}
		list = append(list, f)
	}
	c.JSON(200, list)
}

type feedbackInput struct {
	Section string `json:"section"`
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Content string `json:"content" binding:"required,min=5"`
}

// POST /api/products/:id/feedbacks
func createFeedback(c *gin.Context) {
	id, ok := idParam(c)
	if !ok {
		return
	}
	var in feedbackInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(400, gin.H{"error": "Chọn số sao (1-5) và viết góp ý ít nhất 5 ký tự"})
		return
	}
	if in.Section == "" {
		in.Section = "chung"
	}

	// Chống spam đơn giản: mỗi người chỉ góp ý 1 lần mỗi phút cho cùng một sản phẩm.
	var recent int
	db.QueryRow(c,
		`SELECT COUNT(*) FROM feedbacks
		 WHERE user_id = $1 AND product_id = $2 AND created_at > now() - interval '1 minute'`,
		currentUserID(c), id).Scan(&recent)
	if recent > 0 {
		c.JSON(429, gin.H{"error": "Bạn vừa góp ý rồi, đợi 1 phút nhé"})
		return
	}

	_, err := db.Exec(c,
		`INSERT INTO feedbacks (product_id, user_id, section, rating, content)
		 VALUES ($1, $2, $3, $4, $5)`,
		id, currentUserID(c), in.Section, in.Rating, in.Content)
	if err != nil {
		c.JSON(400, gin.H{"error": "Không gửi được góp ý (sản phẩm có thể không tồn tại)"})
		return
	}
	c.JSON(201, gin.H{"ok": true})
}
