---
name: foundry-deploy
description: Cách build Docker và deploy Foundry lên Render (server Go + web React) với database Neon PostgreSQL miễn phí. Dùng khi sửa Dockerfile, render.yaml, biến môi trường hoặc gặp lỗi deploy.
---

# Deploy Foundry

## Cách hoạt động
- `Dockerfile` 3 bước: build `FE/` bằng Node 22 → build `BE/` bằng Go 1.26 → image Alpine chứa `./server` và `./web`.
- `render.yaml` (Blueprint): 1 web service Docker, gói free, region Singapore, health check `/api/health`.
- Render tự deploy lại mỗi lần push lên nhánh `main`.

## Biến môi trường
| Tên | Ở đâu | Ghi chú |
|---|---|---|
| `DATABASE_URL` | Render → Environment | Chuỗi kết nối Neon, có `sslmode=require` |
| `JWT_SECRET` | Render tự tạo | Không đổi, đổi thì mọi người bị đăng xuất |
| `ADMIN_EMAIL` | Render → Environment | Email sẽ thành admin khi đăng ký |
| `PORT` | Render tự đặt | Server đọc biến này |

## Lần đầu
1. Neon: tạo project (region Singapore), copy connection string.
2. Render: New → Blueprint → chọn repo → điền `DATABASE_URL`, `ADMIN_EMAIL` → Apply.

## Kiểm tra build trước khi push
```bash
docker build -t foundry .
docker run --rm -p 8080:8080 -e DATABASE_URL=... -e JWT_SECRET=x foundry
```

## Lỗi hay gặp
- `Thiếu biến môi trường ...`: chưa điền biến trên Render.
- `Không kết nối được database`: sai chuỗi Neon hoặc thiếu `sslmode=require`.
- Trang trắng khi tải lại ở đường dẫn con: kiểm tra `BE/static.go` vẫn trả `index.html` cho đường dẫn không phải file.
- Web chậm lần đầu: Render free ngủ sau 15 phút, bình thường.

## Không được làm
- Không đưa chuỗi kết nối hoặc secret vào code hay `render.yaml`.
- Không đổi `region` hay tên service khi đã có người dùng.
