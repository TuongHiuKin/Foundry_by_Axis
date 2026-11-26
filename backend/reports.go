package main

import (
	"time"

	"github.com/gin-gonic/gin"
)

type reportInput struct {
	ProductID  *int64 `json:"product_id"`
	FeedbackID *int64 `json:"feedback_id"`
	Reason     string `json:"reason" binding:"required"`
}

// POST /api/reports: báo cáo một sản phẩm hoặc một góp ý vi phạm.
func createReport(c *gin.Context) {
	var in reportInput
	if err := c.ShouldBindJSON(&in); err != nil || (in.ProductID == nil && in.FeedbackID == nil) {
		c.JSON(400, gin.H{"error": "Cần lý do và sản phẩm hoặc góp ý bị báo cáo"})
		return
	}
	_, err := db.Exec(c,
		`INSERT INTO reports (reporter_id, product_id, feedback_id, reason) VALUES ($1, $2, $3, $4)`,
		currentUserID(c), in.ProductID, in.FeedbackID, in.Reason)
	if err != nil {
		c.JSON(400, gin.H{"error": "Không gửi được báo cáo"})
		return
	}
	c.JSON(201, gin.H{"ok": true})
}

type Report struct {
	ID           int64     `json:"id"`
	ReporterName string    `json:"reporter_name"`
	ProductID    *int64    `json:"product_id"`
	ProductTitle *string   `json:"product_title"`
	FeedbackID   *int64    `json:"feedback_id"`
	Reason       string    `json:"reason"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

// GET /api/admin/reports
func adminListReports(c *gin.Context) {
	rows, err := db.Query(c,
		`SELECT r.id, u.name, r.product_id, p.title, r.feedback_id, r.reason, r.status, r.created_at
		 FROM reports r
		 JOIN users u ON u.id = r.reporter_id
		 LEFT JOIN products p ON p.id = r.product_id
		 ORDER BY r.status = 'resolved', r.created_at DESC`)
	if err != nil {
		serverError(c, err)
		return
	}
	defer rows.Close()

	list := []Report{}
	for rows.Next() {
		var r Report
		if err := rows.Scan(&r.ID, &r.ReporterName, &r.ProductID, &r.ProductTitle,
			&r.FeedbackID, &r.Reason, &r.Status, &r.CreatedAt); err != nil {
			serverError(c, err)
			return
		}
		list = append(list, r)
	}
	c.JSON(200, list)
}

// POST /api/admin/reports/:id/resolve
func adminResolveReport(c *gin.Context) {
	id, ok := idParam(c)
	if !ok {
		return
	}
	if _, err := db.Exec(c, `UPDATE reports SET status = 'resolved' WHERE id = $1`, id); err != nil {
		serverError(c, err)
		return
	}
	c.JSON(200, gin.H{"ok": true})
}
