# Foundry – EXE2

Nền tảng để tác giả đăng sản phẩm, cộng đồng dùng thử và góp ý.

- **Backend:** Go + Gin, PostgreSQL (thư mục `BE/`)
- **Web:** React + Vite + TypeScript (thư mục `FE/`)
- **Mobile:** React Native + Expo (thư mục `Mobile/`, làm sau)
- Khi deploy, server Go trả cả API (`/api/...`) lẫn trang web React, nên chỉ cần **một** service.

## Cấu trúc

```
BE/
  main.go        khởi động server, khai báo toàn bộ API
  db.go          kết nối PostgreSQL, tự tạo bảng từ schema.sql
  schema.sql     cấu trúc các bảng
  auth.go        đăng ký, đăng nhập, JWT, middleware kiểm tra đăng nhập/admin
  products.go    sản phẩm + dashboard tác giả
  feedback.go    góp ý (có chống spam 1 phút/lần)
  reports.go     báo cáo vi phạm
  admin.go       API cho trang admin
  static.go      trả file web React
FE/src/
  api.ts         hàm gọi API dùng chung
  auth.ts        useAuth(): ai đang đăng nhập
  AuthProvider.tsx lưu trạng thái đăng nhập
  App.tsx        menu + định tuyến các trang
  pages/         các trang: Home, ProductDetail, Login/Register, ProductForm, Dashboard, Admin
Dockerfile       build web + Go thành một image để deploy
render.yaml      cấu hình deploy trên Render
Mobile/          app Expo (chưa làm)
.agents/         skill (portable + foundry-*) và routing cho agent
.claude/skills/  bản sao skill cho Claude Code
AGENTS.md        hướng dẫn chung cho mọi agent (CLAUDE.md import file này)
docs/            tài liệu: product, architecture, adr, api, testing
```

## Chạy trên máy

Cần cài: Go, Node.js 22, Docker Desktop.

```bash
# 1. Bật PostgreSQL
docker compose up -d

# 2. Chạy backend (cửa sổ terminal 1)
cd BE
cp .env.example .env      # sửa ADMIN_EMAIL thành email của bạn
# Windows PowerShell: đặt biến môi trường bằng $env:DATABASE_URL="..." v.v. hoặc dùng Git Bash:
export $(cat .env | xargs)
go run .

# 3. Chạy web (cửa sổ terminal 2)
cd FE
npm install
npm run dev               # mở http://localhost:5173
```

Đăng ký bằng email trùng `ADMIN_EMAIL` thì tài khoản đó là admin.

## API chính

| Method | Đường dẫn | Cần đăng nhập |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | |
| GET | /api/auth/me | ✔ |
| GET | /api/products?q=&tag= , /api/products/:id | |
| POST/PUT/DELETE | /api/products, /api/products/:id | ✔ (tác giả hoặc admin) |
| GET/POST | /api/products/:id/feedbacks | POST ✔ |
| POST | /api/reports | ✔ |
| GET | /api/me/dashboard | ✔ |
| GET/POST | /api/admin/... | ✔ admin |

## Deploy miễn phí (Neon + Render)

1. **Neon** (database): đăng nhập https://neon.tech bằng GitHub → tạo project, region **Singapore** → copy *Connection string*.
2. **Render** (server + web): đăng nhập https://render.com bằng GitHub → **New → Blueprint** → chọn repo này → dán `DATABASE_URL` (chuỗi Neon) và `ADMIN_EMAIL` → **Apply**.
3. Đợi build xong (~5 phút), mở link `https://foundry-xxxx.onrender.com`.

Mỗi lần `git push` lên nhánh `main`, Render tự deploy lại.
Gói free của Render ngủ sau 15 phút không có truy cập; lần mở đầu tiên mất 30–50 giây.
