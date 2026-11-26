package main

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// idParam đọc tham số :id trên URL và đổi sang số.
func idParam(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(400, gin.H{"error": "id không hợp lệ"})
		return 0, false
	}
	return id, true
}

// serverError trả lỗi 500 và ghi lỗi thật vào log.
func serverError(c *gin.Context, err error) {
	c.Error(err)
	c.JSON(500, gin.H{"error": "lỗi máy chủ"})
}
