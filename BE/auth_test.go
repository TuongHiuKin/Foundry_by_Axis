package main

import "testing"

func TestHealth(t *testing.T) {
	r := newTestServer(t)
	code, res := doJSON(t, r, "GET", "/api/health", "", nil)
	if code != 200 || res["status"] != "ok" {
		t.Fatalf("health: %d %v", code, res)
	}
}

func TestRegisterReturnsTokenAndUser(t *testing.T) {
	r := newTestServer(t)
	code, res := doJSON(t, r, "POST", "/api/auth/register", "",
		map[string]string{"email": "  Kien@Test.com ", "password": "123456", "name": "Kien"})
	if code != 200 {
		t.Fatalf("muốn 200, nhận %d %v", code, res)
	}
	user := res["user"].(map[string]any)
	if user["email"] != "kien@test.com" {
		t.Errorf("email phải được chuẩn hoá, nhận %v", user["email"])
	}
	if user["role"] != "user" {
		t.Errorf("role mặc định phải là user, nhận %v", user["role"])
	}
	if _, leaked := user["password_hash"]; leaked {
		t.Error("không được trả password_hash")
	}
	if res["token"] == "" {
		t.Error("thiếu token")
	}
}

func TestRegisterAdminEmailBecomesAdmin(t *testing.T) {
	r := newTestServer(t)
	token := registerUser(t, r, "admin@test.com", "Admin")
	_, me := doJSON(t, r, "GET", "/api/auth/me", token, nil)
	if me["role"] != "admin" {
		t.Fatalf("email ADMIN_EMAIL phải là admin, nhận %v", me["role"])
	}
}

func TestRegisterDuplicateEmail(t *testing.T) {
	r := newTestServer(t)
	registerUser(t, r, "a@test.com", "A")
	code, _ := doJSON(t, r, "POST", "/api/auth/register", "",
		map[string]string{"email": "a@test.com", "password": "123456", "name": "A2"})
	if code != 409 {
		t.Fatalf("email trùng phải 409, nhận %d", code)
	}
}

func TestRegisterValidation(t *testing.T) {
	r := newTestServer(t)
	code, _ := doJSON(t, r, "POST", "/api/auth/register", "",
		map[string]string{"email": "a@test.com", "password": "123", "name": "A"})
	if code != 400 {
		t.Fatalf("mật khẩu ngắn phải 400, nhận %d", code)
	}
}

func TestLogin(t *testing.T) {
	r := newTestServer(t)
	registerUser(t, r, "a@test.com", "A")

	code, res := doJSON(t, r, "POST", "/api/auth/login", "",
		map[string]string{"email": "a@test.com", "password": "123456"})
	if code != 200 || res["token"] == nil {
		t.Fatalf("đăng nhập đúng phải 200 + token, nhận %d %v", code, res)
	}

	code, _ = doJSON(t, r, "POST", "/api/auth/login", "",
		map[string]string{"email": "a@test.com", "password": "sai-mat-khau"})
	if code != 401 {
		t.Fatalf("sai mật khẩu phải 401, nhận %d", code)
	}
}

func TestMeRequiresValidToken(t *testing.T) {
	r := newTestServer(t)
	if code, _ := doJSON(t, r, "GET", "/api/auth/me", "", nil); code != 401 {
		t.Errorf("không token phải 401, nhận %d", code)
	}
	if code, _ := doJSON(t, r, "GET", "/api/auth/me", "token-gia", nil); code != 401 {
		t.Errorf("token sai phải 401, nhận %d", code)
	}
}

func TestRegisterInvalidEmail(t *testing.T) {
	r := newTestServer(t)
	code, _ := doJSON(t, r, "POST", "/api/auth/register", "",
		map[string]string{"email": "khong-phai-email", "password": "123456", "name": "A"})
	if code != 400 {
		t.Fatalf("email sai định dạng phải 400, nhận %d", code)
	}
}
