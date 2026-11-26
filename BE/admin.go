package main

import (
	"github.com/gin-gonic/gin"
)

// GET /api/admin/stats: số liệu tổng quan cho trang admin.
func adminStats(c *gin.Context) {
	var users, products, feedbacks, openReports int
	err := db.QueryRow(c, `SELECT
		(SELECT COUNT(*) FROM users),
		(SELECT COUNT(*) FROM products),
		(SELECT COUNT(*) FROM feedbacks),
		(SELECT COUNT(*) FROM reports WHERE status = 'open')`,
	).Scan(&users, &products, &feedbacks, &openReports)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, gin.H{
		"users": users, "products": products,
		"feedbacks": feedbacks, "open_reports": openReports,
	})
}

// GET /api/admin/users
func adminListUsers(c *gin.Context) {
	rows, err := db.Query(c,
		`SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC`)
	if err != nil {
		serverError(c, err)
		return
	}
	defer rows.Close()

	list := []User{}
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt); err != nil {
			serverError(c, err)
			return
		}
		list = append(list, u)
	}
	c.JSON(200, list)
}

// adminSetHidden trả về handler để ẩn (true) hoặc hiện lại (false) một sản phẩm.
func adminSetHidden(hidden bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, ok := idParam(c)
		if !ok {
			return
		}
		if _, err := db.Exec(c, `UPDATE products SET hidden = $1 WHERE id = $2`, hidden, id); err != nil {
			serverError(c, err)
			return
		}
		c.JSON(200, gin.H{"ok": true})
	}
}

// GET /api/admin/products: tất cả sản phẩm, kể cả sản phẩm đang bị ẩn.
func adminListProducts(c *gin.Context) {
	products, err := queryProducts(c, productSelect+` ORDER BY p.created_at DESC`)
	if err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, products)
}
