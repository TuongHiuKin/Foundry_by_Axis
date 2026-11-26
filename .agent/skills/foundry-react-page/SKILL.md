---
name: foundry-react-page
description: Cách thêm hoặc sửa trang, component và lời gọi API trong web React + Vite + TypeScript của Foundry. Dùng khi làm việc trong thư mục FE/.
---

# Thêm/sửa trang web trong `FE/`

## Bố cục
- `src/api.ts`: kiểu dữ liệu (`User`, `Product`, `Feedback`...) và hàm `api<T>(path, options)`, `post<T>(path, body)`. Mọi lời gọi server đi qua đây (tự gắn token, tự ném `Error` với câu lỗi tiếng Việt từ server).
- `src/auth.ts` + `src/AuthProvider.tsx`: `useAuth()` trả `{ user, loading, saveLogin, logout }`.
- `src/App.tsx`: thanh menu + khai báo `<Route>`. Trang cần đăng nhập bọc trong `<NeedLogin>`, trang admin `<NeedLogin admin>`.
- `src/pages/*.tsx`: mỗi trang một file, `export default function TenTrang()`.
- `src/index.css`: toàn bộ CSS, dùng biến màu ở `:root`. Class có sẵn: `btn`, `btn-ghost`, `box`, `card`, `grid`, `row`, `between`, `muted`, `small`, `error`, `tag`, `stats`, `stat`.

## Các bước thêm một trang
1. Nếu có dữ liệu mới, thêm `type` vào `src/api.ts` khớp đúng JSON backend trả về (snake_case).
2. Tạo `src/pages/TenTrang.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { api, type Product } from '../api'

export default function TenTrang() {
  const [items, setItems] = useState<Product[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<Product[]>('/products').then(setItems).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="error">{error}</p>
  return <div className="grid">{/* ... */}</div>
}
```

3. Thêm `<Route>` trong `App.tsx`, thêm link menu nếu cần.

## Quy tắc
- TypeScript strict, không dùng `any`.
- Không thêm thư viện UI/state (Redux, MUI, Tailwind...) khi chưa được chủ dự án đồng ý. Dùng CSS trong `index.css`.
- Chữ hiển thị bằng tiếng Việt.
- Luôn xử lý 3 trạng thái: đang tải, lỗi, rỗng.
- Không gọi `fetch` trực tiếp, dùng `api()`.

## Kiểm tra
```bash
cd FE
npm run build   # chạy tsc + vite build, phải không lỗi
npm run lint
```
