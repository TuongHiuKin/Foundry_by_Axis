---
name: foundry-go-api
description: Cách thêm hoặc sửa API trong backend Go (Gin + pgx) của Foundry theo đúng quy ước. Dùng khi làm việc trong thư mục BE/.
---

# Thêm/sửa API Go trong `BE/`

## Bố cục file
Package `main` duy nhất, mỗi nhóm chức năng một file: `auth.go`, `products.go`, `feedback.go`, `reports.go`, `admin.go`. Nhóm mới thì tạo file mới (ví dụ `payments.go`). Hàm dùng chung nằm ở `helpers.go`.

## Các bước thêm một API
1. **Database** (nếu cần): thêm vào `BE/schema.sql`, dùng `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
2. **Struct trả về** có tag JSON snake_case, thời gian dùng `time.Time`, cột có thể NULL dùng con trỏ (`*int64`, `*string`).
3. **Struct input** dùng tag `binding` của Gin để kiểm tra (`binding:"required,min=1,max=5"`).
4. **Handler** theo mẫu:

```go
// POST /api/products/:id/likes
func likeProduct(c *gin.Context) {
	id, ok := idParam(c) // tự trả 400 nếu id sai
	if !ok {
		return
	}
	_, err := db.Exec(c,
		`INSERT INTO likes (product_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		id, currentUserID(c))
	if err != nil {
		serverError(c, err) // ghi log + trả 500
		return
	}
	c.JSON(201, gin.H{"ok": true})
}
```

5. **Khai báo route** trong `setupRoutes` (`BE/main.go`), gắn `requireLogin` / nhóm `admin` nếu cần.

## Quy tắc
- SQL luôn dùng `$1, $2...`. Không `fmt.Sprintf` dữ liệu người dùng vào SQL.
- Đọc một dòng: `db.QueryRow(c, ...).Scan(...)`, kiểm tra `errors.Is(err, pgx.ErrNoRows)` để trả 404.
- Đọc nhiều dòng: `rows, err := db.Query(...)`, `defer rows.Close()`, khởi tạo slice `list := []T{}` để JSON ra `[]`.
- Kiểm tra quyền sở hữu trước khi sửa/xoá (xem `canEdit`).
- Không trả `password_hash` hay dữ liệu nhạy cảm.
- Không thêm thư viện mới khi thư viện chuẩn hoặc gin/pgx làm được. Nếu bắt buộc, giải thích lý do trong mô tả thay đổi.
- Không dùng ORM, không thêm tầng repository/service.

## Kiểm tra
```bash
cd BE
gofmt -l .            # phải không in ra gì
go vet ./...
go build .
```
Chạy thử bằng curl với PostgreSQL local (`docker compose up -d` ở thư mục gốc), ví dụ:
```bash
curl -s -XPOST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"a@b.c","password":"123456"}'
```
