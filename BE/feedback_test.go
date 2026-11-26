package main

import (
	"fmt"
	"testing"
)

func TestCreateFeedbackAndList(t *testing.T) {
	r := newTestServer(t)
	author := registerUser(t, r, "author@test.com", "Author")
	tester := registerUser(t, r, "tester@test.com", "Tester")
	id := newProduct(t, r, author, "P", "")
	path := fmt.Sprintf("/api/products/%d/feedbacks", id)

	code, _ := doJSON(t, r, "POST", path, tester,
		map[string]any{"section": "giao diện", "rating": 4, "content": "Đẹp nhưng hơi chậm"})
	if code != 201 {
		t.Fatalf("gửi góp ý phải 201, nhận %d", code)
	}
	_, list := doList(t, r, "GET", path, "")
	if len(list) != 1 || list[0]["user_name"] != "Tester" || list[0]["section"] != "giao diện" {
		t.Fatalf("danh sách góp ý sai: %v", list)
	}
	_, p := doJSON(t, r, "GET", fmt.Sprintf("/api/products/%d", id), "", nil)
	if p["avg_rating"] != float64(4) || p["feedback_count"] != float64(1) {
		t.Fatalf("điểm trung bình/số góp ý sai: %v", p)
	}
}

func TestFeedbackDefaultSection(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "a@test.com", "A")
	id := newProduct(t, r, token, "P", "")
	path := fmt.Sprintf("/api/products/%d/feedbacks", id)
	doJSON(t, r, "POST", path, token, map[string]any{"rating": 3, "content": "Bình thường"})
	_, list := doList(t, r, "GET", path, "")
	if len(list) != 1 || list[0]["section"] != "chung" {
		t.Fatalf("mục mặc định phải là chung: %v", list)
	}
}

func TestFeedbackValidation(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "a@test.com", "A")
	id := newProduct(t, r, token, "P", "")
	path := fmt.Sprintf("/api/products/%d/feedbacks", id)

	if code, _ := doJSON(t, r, "POST", path, token, map[string]any{"rating": 6, "content": "Quá tốt"}); code != 400 {
		t.Errorf("rating 6 phải 400, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "POST", path, token, map[string]any{"rating": 5, "content": "ok"}); code != 400 {
		t.Errorf("nội dung quá ngắn phải 400, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "POST", path, "", map[string]any{"rating": 5, "content": "Rất tốt"}); code != 401 {
		t.Errorf("chưa đăng nhập phải 401, nhận %d", code)
	}
}

func TestFeedbackAntiSpamOnePerMinute(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "a@test.com", "A")
	id := newProduct(t, r, token, "P", "")
	path := fmt.Sprintf("/api/products/%d/feedbacks", id)
	body := map[string]any{"rating": 5, "content": "Rất tốt"}

	doJSON(t, r, "POST", path, token, body)
	if code, _ := doJSON(t, r, "POST", path, token, body); code != 429 {
		t.Fatalf("góp ý lần 2 trong 1 phút phải 429, nhận %d", code)
	}
}
