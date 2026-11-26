package main

import (
	"fmt"
	"testing"
)

func TestCreateProductRequiresLogin(t *testing.T) {
	r := newTestServer(t)
	code, _ := doJSON(t, r, "POST", "/api/products", "", map[string]string{"title": "X"})
	if code != 401 {
		t.Fatalf("chưa đăng nhập phải 401, nhận %d", code)
	}
}

func TestListProductsSearchAndTag(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "a@test.com", "A")
	newProduct(t, r, token, "Game Thanh Giong", "game,web")
	newProduct(t, r, token, "AI Notes", "ai")

	_, all := doList(t, r, "GET", "/api/products", "")
	if len(all) != 2 {
		t.Fatalf("muốn 2 sản phẩm, nhận %d", len(all))
	}
	_, byTag := doList(t, r, "GET", "/api/products?tag=game", "")
	if len(byTag) != 1 || byTag[0]["title"] != "Game Thanh Giong" {
		t.Fatalf("lọc theo tag sai: %v", byTag)
	}
	_, byQuery := doList(t, r, "GET", "/api/products?q=notes", "")
	if len(byQuery) != 1 || byQuery[0]["title"] != "AI Notes" {
		t.Fatalf("tìm theo tên (không phân biệt hoa thường) sai: %v", byQuery)
	}
}

func TestListProductsEmptyIsArray(t *testing.T) {
	r := newTestServer(t)
	code, raw := doRaw(t, r, "GET", "/api/products", "", nil)
	if code != 200 || string(raw) != "[]" {
		t.Fatalf("danh sách rỗng phải là [], nhận %d %s", code, raw)
	}
}

func TestGetProductIncrementsViews(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "a@test.com", "A")
	id := newProduct(t, r, token, "P", "")
	path := fmt.Sprintf("/api/products/%d", id)

	doJSON(t, r, "GET", path, "", nil)
	_, res := doJSON(t, r, "GET", path, "", nil)
	if res["views"] != float64(2) {
		t.Fatalf("xem 2 lần phải views=2, nhận %v", res["views"])
	}
	if code, _ := doJSON(t, r, "GET", "/api/products/9999", "", nil); code != 404 {
		t.Fatalf("sản phẩm không tồn tại phải 404, nhận %d", code)
	}
}

func TestOnlyAuthorOrAdminCanEditOrDelete(t *testing.T) {
	r := newTestServer(t)
	author := registerUser(t, r, "author@test.com", "Author")
	other := registerUser(t, r, "other@test.com", "Other")
	admin := registerUser(t, r, "admin@test.com", "Admin")
	id := newProduct(t, r, author, "P", "")
	path := fmt.Sprintf("/api/products/%d", id)

	if code, _ := doJSON(t, r, "PUT", path, other, map[string]string{"title": "Hack"}); code != 403 {
		t.Errorf("người khác sửa phải 403, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "DELETE", path, other, nil); code != 403 {
		t.Errorf("người khác xoá phải 403, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "PUT", path, author, map[string]string{"title": "P2"}); code != 200 {
		t.Errorf("tác giả sửa phải 200, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "DELETE", path, admin, nil); code != 200 {
		t.Errorf("admin xoá phải 200, nhận %d", code)
	}
}

func TestAuthorDashboardTotals(t *testing.T) {
	r := newTestServer(t)
	author := registerUser(t, r, "author@test.com", "Author")
	tester := registerUser(t, r, "tester@test.com", "Tester")
	id := newProduct(t, r, author, "P", "")
	doJSON(t, r, "GET", fmt.Sprintf("/api/products/%d", id), "", nil)
	doJSON(t, r, "POST", fmt.Sprintf("/api/products/%d/feedbacks", id), tester,
		map[string]any{"rating": 5, "content": "Rất tốt"})

	_, res := doJSON(t, r, "GET", "/api/me/dashboard", author, nil)
	if res["total_products"] != float64(1) || res["total_views"] != float64(1) || res["total_feedbacks"] != float64(1) {
		t.Fatalf("số liệu dashboard sai: %v", res)
	}
}
