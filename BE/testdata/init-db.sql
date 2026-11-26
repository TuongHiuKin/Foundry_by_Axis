-- Chạy 1 lần khi docker compose tạo volume mới: tạo thêm database cho test.
CREATE DATABASE foundry_test; -- go test (dữ liệu bị xoá mỗi test)
CREATE DATABASE foundry_e2e;  -- Playwright E2E
