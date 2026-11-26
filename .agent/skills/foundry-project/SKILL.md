---
name: foundry-project
description: Tổng quan kiến trúc, mô hình dữ liệu và quy ước của dự án Foundry (EXE2). Đọc đầu tiên trước khi làm bất kỳ việc gì trong repo này.
---

# Foundry – tổng quan dự án

## Kiến trúc
- Một server Go (`BE/`) làm 2 việc: trả API JSON ở `/api/*` và trả web React đã build (thư mục `BE/web/` khi chạy trong Docker) cho mọi đường dẫn khác (`BE/static.go`).
- Web React (`FE/`) gọi API bằng đường dẫn tương đối `/api/...` qua hàm `api()` trong `FE/src/api.ts`. Local dùng proxy của Vite, production cùng domain nên không cần CORS.
- App Expo (`Mobile/`, sau này) gọi cùng API bằng URL đầy đủ.
- Deploy: một Docker service trên Render (free) + PostgreSQL trên Neon (free).

## Dữ liệu (`BE/schema.sql`)
- `users`: email, password_hash (bcrypt), name, role (`user` | `admin`).
- `products`: author_id → users, title, description, link, image_url, tags (chuỗi `"web,ai"`), views, hidden.
- `feedbacks`: product_id, user_id, section (`chung`, `giao diện`, `tính năng`, `hiệu năng`, `lỗi`), rating 1–5, content.
- `reports`: reporter_id, product_id hoặc feedback_id, reason, status (`open` | `resolved`).

Schema chạy lại mỗi lần server khởi động, nên mọi lệnh phải idempotent.

## Đăng nhập & phân quyền
- `POST /api/auth/register|login` trả `{ token, user }`. Token JWT HS256, hạn 7 ngày, claims `sub` (user id) và `role`.
- Client gửi `Authorization: Bearer <token>`. FE lưu token ở `localStorage`.
- Middleware: `requireLogin` (đặt `userID`, `role` vào gin context), `requireAdmin`.
- Ai đăng ký bằng email trùng biến môi trường `ADMIN_EMAIL` thì thành admin.
- Sửa/xoá sản phẩm: chỉ tác giả hoặc admin (`canEdit` trong `products.go`).

## Danh sách API
Xem `setupRoutes` trong `BE/main.go`, đó là nguồn sự thật duy nhất. Thêm API mới phải khai báo ở đây.

## Quy ước chung
- Code đơn giản, ít tầng. Handler gọi thẳng `db` (pgxpool) bằng SQL viết tay.
- JSON trả về dùng snake_case (`author_name`, `avg_rating`).
- Lỗi trả dạng `{"error": "câu tiếng Việt"}` với mã HTTP đúng (400 dữ liệu sai, 401 chưa đăng nhập, 403 không có quyền, 404 không thấy, 409 trùng, 429 spam, 500 lỗi server qua `serverError`).
- Danh sách rỗng trả `[]`, không trả `null`.

## Tính năng dự kiến (chưa làm)
Thanh toán gói 29.000đ, thông báo, upload ảnh (hiện chỉ dán link ảnh), app mobile.
