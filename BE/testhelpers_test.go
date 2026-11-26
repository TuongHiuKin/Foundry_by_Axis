package main

// Các hàm dùng chung cho test.
// Test cần một database PostgreSQL RIÊNG cho test (dữ liệu sẽ bị xoá sạch mỗi test).
// Đặt biến TEST_DATABASE_URL, ví dụ:
//   postgres://foundry:foundry@localhost:5432/foundry_test?sslmode=disable
// Nếu không đặt, các test cần database sẽ được bỏ qua (skip).

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"sync"
	"testing"

	"github.com/gin-gonic/gin"
)

var connectOnce sync.Once

// newTestServer kết nối DB test, xoá sạch dữ liệu và trả về router đã gắn đủ API.
func newTestServer(t *testing.T) *gin.Engine {
	t.Helper()
	url := os.Getenv("TEST_DATABASE_URL")
	if url == "" {
		t.Skip("TEST_DATABASE_URL chưa đặt, bỏ qua test cần database")
	}
	connectOnce.Do(func() { connectDB(url) })

	_, err := db.Exec(context.Background(),
		`TRUNCATE reports, feedbacks, products, users RESTART IDENTITY CASCADE`)
	if err != nil {
		t.Fatalf("không xoá được dữ liệu test: %v", err)
	}

	jwtSecret = []byte("test-secret")
	adminEmail = "admin@test.com"
	gin.SetMode(gin.TestMode)
	r := gin.New()
	setupRoutes(r)
	return r
}

// doJSON gửi request JSON (token có thể rỗng) và trả về mã HTTP + body đã parse.
func doJSON(t *testing.T, r *gin.Engine, method, path, token string, body any) (int, map[string]any) {
	t.Helper()
	code, raw := doRaw(t, r, method, path, token, body)
	var out map[string]any
	_ = json.Unmarshal(raw, &out)
	return code, out
}

// doList giống doJSON nhưng cho API trả về mảng.
func doList(t *testing.T, r *gin.Engine, method, path, token string) (int, []map[string]any) {
	t.Helper()
	code, raw := doRaw(t, r, method, path, token, nil)
	var out []map[string]any
	if err := json.Unmarshal(raw, &out); err != nil {
		t.Fatalf("%s %s không trả về mảng JSON: %s", method, path, raw)
	}
	return code, out
}

func doRaw(t *testing.T, r *gin.Engine, method, path, token string, body any) (int, []byte) {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		if err := json.NewEncoder(&buf).Encode(body); err != nil {
			t.Fatal(err)
		}
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w.Code, w.Body.Bytes()
}

// registerUser tạo tài khoản và trả về token.
func registerUser(t *testing.T, r *gin.Engine, email, name string) string {
	t.Helper()
	code, res := doJSON(t, r, "POST", "/api/auth/register", "",
		map[string]string{"email": email, "password": "123456", "name": name})
	if code != 200 {
		t.Fatalf("đăng ký %s thất bại: %d %v", email, code, res)
	}
	return res["token"].(string)
}

// newProduct đăng một sản phẩm và trả về id.
func newProduct(t *testing.T, r *gin.Engine, token, title, tags string) int {
	t.Helper()
	code, res := doJSON(t, r, "POST", "/api/products", token,
		map[string]string{"title": title, "tags": tags})
	if code != 201 {
		t.Fatalf("tạo sản phẩm thất bại: %d %v", code, res)
	}
	return int(res["id"].(float64))
}
