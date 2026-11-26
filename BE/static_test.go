package main

import (
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
)

// Test này không cần database.
func TestServeFrontendSPAFallback(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "index.html"), []byte("INDEX"), 0o644)
	os.WriteFile(filepath.Join(dir, "app.js"), []byte("JS"), 0o644)

	gin.SetMode(gin.TestMode)
	r := gin.New()
	serveFrontend(r, dir)

	cases := []struct{ path, want string }{
		{"/", "INDEX"},
		{"/app.js", "JS"},
		{"/products/5", "INDEX"}, // đường dẫn của React Router
	}
	for _, c := range cases {
		w := httptest.NewRecorder()
		r.ServeHTTP(w, httptest.NewRequest("GET", c.path, nil))
		if w.Body.String() != c.want {
			t.Errorf("GET %s: muốn %q, nhận %q", c.path, c.want, w.Body.String())
		}
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest("GET", "/api/khong-co", nil))
	if w.Code != 404 {
		t.Errorf("API không tồn tại phải 404, nhận %d", w.Code)
	}
}
