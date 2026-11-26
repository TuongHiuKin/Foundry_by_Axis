---
name: foundry-before-review
description: Checklist agent phải tự chạy trước khi bàn giao thay đổi để Claude review. Dùng mỗi khi hoàn thành một tính năng hoặc sửa lỗi trong Foundry.
---

# Trước khi xin review

## 1. Build và kiểm tra tự động
```bash
cd BE && gofmt -l . && go vet ./... && go build .
cd FE && npm run build && npm run lint
```
Tất cả phải sạch. Không tắt lint hay bỏ qua lỗi TypeScript để qua được.

## 2. Tự soát
- [ ] Chỉ sửa những gì tính năng cần, không đổi tên/di chuyển file không liên quan.
- [ ] SQL dùng tham số `$n`; không nối chuỗi dữ liệu người dùng.
- [ ] API cần đăng nhập đã gắn `requireLogin`; API admin nằm trong nhóm `admin`; sửa/xoá có kiểm tra chủ sở hữu.
- [ ] Không lộ `password_hash`, token, secret trong JSON, log hay code.
- [ ] Thay đổi `schema.sql` chạy lại nhiều lần không lỗi và không mất dữ liệu.
- [ ] Câu lỗi hiển thị cho người dùng bằng tiếng Việt, mã HTTP đúng.
- [ ] Kiểu dữ liệu trong `FE/src/api.ts` khớp JSON backend.
- [ ] Trang mới xử lý đủ: đang tải, lỗi, rỗng.
- [ ] Không thêm thư viện mới (hoặc đã ghi lý do).
- [ ] Code đọc được với người mới học Go: tên rõ, hàm ngắn, có chú thích tiếng Việt chỗ khó.

## 3. Ghi chú bàn giao
Viết ngắn gọn cho người review:
- Làm gì và vì sao
- File đã sửa
- Cách đã thử (lệnh curl, các bước bấm trên web)
- Điều còn băn khoăn
