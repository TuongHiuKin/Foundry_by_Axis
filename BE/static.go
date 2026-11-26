package main

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// serveFrontend trả các file của web React.
// Đường dẫn nào không phải file có thật (ví dụ /products/5) thì trả index.html
// để React Router tự xử lý ở phía trình duyệt.
func serveFrontend(r *gin.Engine, dir string) {
	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "không tìm thấy API"})
			return
		}
		path := filepath.Join(dir, filepath.Clean(c.Request.URL.Path))
		if info, err := os.Stat(path); err == nil && !info.IsDir() {
			c.File(path)
			return
		}
		c.File(filepath.Join(dir, "index.html"))
	})
}
