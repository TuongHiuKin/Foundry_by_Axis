package main

import (
	"fmt"
	"testing"
)

func TestAdminRoutesRequireAdmin(t *testing.T) {
	r := newTestServer(t)
	user := registerUser(t, r, "a@test.com", "A")
	for _, path := range []string{"/api/admin/stats", "/api/admin/users", "/api/admin/reports", "/api/admin/products"} {
		if code, _ := doJSON(t, r, "GET", path, user, nil); code != 403 {
			t.Errorf("%s với user thường phải 403, nhận %d", path, code)
		}
	}
}

func TestReportAndResolveFlow(t *testing.T) {
	r := newTestServer(t)
	author := registerUser(t, r, "author@test.com", "Author")
	admin := registerUser(t, r, "admin@test.com", "Admin")
	id := newProduct(t, r, author, "Spam", "")

	if code, _ := doJSON(t, r, "POST", "/api/reports", author, map[string]any{"reason": "x"}); code != 400 {
		t.Errorf("báo cáo không có đối tượng phải 400, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "POST", "/api/reports", author, map[string]any{"product_id": id, "reason": "spam"}); code != 201 {
		t.Fatalf("gửi báo cáo phải 201, nhận %d", code)
	}

	_, stats := doJSON(t, r, "GET", "/api/admin/stats", admin, nil)
	if stats["open_reports"] != float64(1) {
		t.Fatalf("phải có 1 báo cáo chờ xử lý: %v", stats)
	}
	_, reports := doList(t, r, "GET", "/api/admin/reports", admin)
	reportID := int(reports[0]["id"].(float64))
	doJSON(t, r, "POST", fmt.Sprintf("/api/admin/reports/%d/resolve", reportID), admin, nil)

	_, stats = doJSON(t, r, "GET", "/api/admin/stats", admin, nil)
	if stats["open_reports"] != float64(0) {
		t.Fatalf("sau khi xử lý phải còn 0 báo cáo mở: %v", stats)
	}
}

func TestAdminHideAndUnhideProduct(t *testing.T) {
	r := newTestServer(t)
	author := registerUser(t, r, "author@test.com", "Author")
	admin := registerUser(t, r, "admin@test.com", "Admin")
	id := newProduct(t, r, author, "P", "")

	doJSON(t, r, "POST", fmt.Sprintf("/api/admin/products/%d/hide", id), admin, nil)
	if _, list := doList(t, r, "GET", "/api/products", ""); len(list) != 0 {
		t.Errorf("sản phẩm bị ẩn không được hiện công khai: %v", list)
	}
	if code, _ := doJSON(t, r, "GET", fmt.Sprintf("/api/products/%d", id), "", nil); code != 404 {
		t.Errorf("xem sản phẩm bị ẩn phải 404, nhận %d", code)
	}
	if _, list := doList(t, r, "GET", "/api/admin/products", admin); len(list) != 1 || list[0]["hidden"] != true {
		t.Errorf("admin vẫn phải thấy sản phẩm bị ẩn: %v", list)
	}

	doJSON(t, r, "POST", fmt.Sprintf("/api/admin/products/%d/unhide", id), admin, nil)
	if _, list := doList(t, r, "GET", "/api/products", ""); len(list) != 1 {
		t.Errorf("hiện lại thì phải thấy công khai: %v", list)
	}
}
