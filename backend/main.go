// Điểm bắt đầu của server Foundry.
// Server làm 2 việc:
//  1. Trả API JSON ở các đường dẫn bắt đầu bằng /api
//  2. Trả trang web React (đã build sẵn) cho mọi đường dẫn còn lại
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Đọc cấu hình từ biến môi trường (environment variables).
	databaseURL := mustEnv("DATABASE_URL")
	jwtSecret = []byte(mustEnv("JWT_SECRET"))
	adminEmail = os.Getenv("ADMIN_EMAIL") // ai đăng ký bằng email này sẽ là admin
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Kết nối database và tạo bảng nếu chưa có.
	connectDB(databaseURL)
	defer db.Close()

	r := gin.Default()
	setupRoutes(r)
	serveFrontend(r, "./web") // thư mục chứa web React sau khi build

	log.Printf("Server đang chạy ở http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

// setupRoutes khai báo tất cả API của Foundry.
func setupRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Tài khoản
	api.POST("/auth/register", register)
	api.POST("/auth/login", login)
	api.GET("/auth/me", requireLogin, me)

	// Sản phẩm: ai cũng xem được, phải đăng nhập mới đăng/sửa/xoá
	api.GET("/products", listProducts)
	api.GET("/products/:id", getProduct)
	api.POST("/products", requireLogin, createProduct)
	api.PUT("/products/:id", requireLogin, updateProduct)
	api.DELETE("/products/:id", requireLogin, deleteProduct)

	// Góp ý
	api.GET("/products/:id/feedbacks", listFeedbacks)
	api.POST("/products/:id/feedbacks", requireLogin, createFeedback)

	// Báo cáo vi phạm
	api.POST("/reports", requireLogin, createReport)

	// Dashboard của tác giả
	api.GET("/me/dashboard", requireLogin, authorDashboard)

	// Trang admin: phải đăng nhập và có role = admin
	admin := api.Group("/admin", requireLogin, requireAdmin)
	admin.GET("/stats", adminStats)
	admin.GET("/users", adminListUsers)
	admin.GET("/products", adminListProducts)
	admin.GET("/reports", adminListReports)
	admin.POST("/reports/:id/resolve", adminResolveReport)
	admin.POST("/products/:id/hide", adminSetHidden(true))
	admin.POST("/products/:id/unhide", adminSetHidden(false))
}

func mustEnv(name string) string {
	v := os.Getenv(name)
	if v == "" {
		log.Fatalf("Thiếu biến môi trường %s", name)
	}
	return v
}
