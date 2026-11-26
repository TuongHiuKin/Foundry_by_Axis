# Testing

Chiến lược test của Foundry. Lệnh chi tiết xem mục **Tests** trong `AGENTS.md`.

## Chuẩn bị một lần trên máy
1. `docker compose up -d` (tạo database `foundry`, `foundry_test`, `foundry_e2e`).
   Nếu volume `pgdata` đã có từ trước thì tạo tay 2 database test:
   `docker compose exec db psql -U foundry -c "CREATE DATABASE foundry_test"` và tương tự cho `foundry_e2e`.
2. `cd FE` → `npm ci` → `npx playwright install chromium`.
3. Đặt biến `TEST_DATABASE_URL` khi chạy `go test` (xem `BE/.env.example`).

## Các mức test
| Mức | Kiểm tra gì | Ở đâu |
|---|---|---|
| BE | API: mã HTTP, JSON, phân quyền, chống spam, ẩn sản phẩm | `BE/*_test.go` |
| FE unit | Hàm thuần: `api()`/`post()` | `FE/src/**/*.test.ts` |
| E2E | Luồng người dùng trên trình duyệt: đăng ký/đăng nhập, đăng sản phẩm, góp ý, tìm kiếm | `FE/tests/e2e/` |

## Luồng E2E hiện có
- `auth.spec.ts`: trang chủ; đăng ký → đăng xuất → đăng nhập; sai mật khẩu; dashboard bắt đăng nhập.
- `product.spec.ts`: đăng sản phẩm → thấy trên dashboard; người khác gửi góp ý; tìm theo tên.
- `screenshot.spec.ts` (`@screenshot`): chụp màn hình theo yêu cầu, không chạy trong lượt test thường.
