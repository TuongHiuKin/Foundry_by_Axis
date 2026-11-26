# Hướng dẫn cho agent viết code – Foundry (EXE2)

Đọc file này trước khi sửa code. Chi tiết từng việc nằm trong `.agent/skills/`.

## Dự án
Foundry: tác giả đăng sản phẩm, cộng đồng dùng thử và góp ý theo mục, báo cáo vi phạm, có dashboard tác giả và trang admin.

| Thư mục | Công nghệ | Skill |
|---|---|---|
| `BE/` | Go 1.26 + Gin + pgx (PostgreSQL), JWT | `foundry-go-api` |
| `FE/` | React 19 + Vite + TypeScript + react-router-dom | `foundry-react-page` |
| `Mobile/` | React Native + Expo (chưa làm) | `foundry-expo-mobile` |
| gốc | Dockerfile, render.yaml | `foundry-deploy` |

Tổng quan kiến trúc và quy ước chung: `.agent/skills/foundry-project/SKILL.md`.

## Quy tắc bắt buộc
1. **Giữ code đơn giản, dễ đọc.** Chủ dự án đang học Go. Không thêm framework, ORM, DI container, hay lớp trừu tượng (repository/service/interface) khi chưa thật cần.
2. **Câu báo lỗi cho người dùng viết bằng tiếng Việt.** Chú thích code bằng tiếng Việt cho phần logic không hiển nhiên.
3. **Mọi câu SQL dùng tham số `$1, $2...`**, không bao giờ nối chuỗi từ dữ liệu người dùng.
4. **Đổi database thì sửa `BE/schema.sql`** theo kiểu chạy lại được nhiều lần (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Không xoá bảng/cột đang có dữ liệu.
5. **Không commit bí mật**: `.env`, chuỗi kết nối Neon, JWT_SECRET.
6. Mỗi thay đổi nhỏ, một mục đích. Trước khi xin review, chạy checklist trong `foundry-before-review`.

## Lệnh hay dùng
```bash
docker compose up -d                 # PostgreSQL local
cd BE && go run .                    # API ở :8080 (cần biến môi trường, xem BE/.env.example)
cd BE && go vet ./... && go build .  # kiểm tra Go
cd FE && npm run dev                 # web ở :5173, /api tự chuyển sang :8080
cd FE && npm run build               # kiểm tra TypeScript + build
```
