# 0001 – Một service Go trả cả API và web, deploy Render + Neon

- Trạng thái: chấp nhận (2026-11-26)
- Bối cảnh: cần đưa web lên mạng nhanh, miễn phí; Oracle Cloud đăng ký lỗi.
- Quyết định: server Go phục vụ `/api/*` và file build của React; deploy 1 Docker service trên Render free (Singapore); PostgreSQL trên Neon free.
- Hệ quả: không cần CORS, chỉ một nơi deploy. Render free ngủ sau 15 phút, lần đầu mở chậm 30–50 giây. Có thể tách FE sang Vercel/Cloudflare sau.
