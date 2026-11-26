---
name: foundry-expo-mobile
description: Hướng dẫn dựng và phát triển app React Native + Expo của Foundry trong thư mục Mobile/, dùng chung API Go với web, để đưa lên Google Play.
---

# App mobile trong `Mobile/`

## Khởi tạo (làm một lần)
```bash
cd Mobile
npx create-expo-app@latest . --template default   # Expo Router + TypeScript
npx expo install expo-secure-store
```
Chạy thử: `npx expo start`, quét QR bằng app Expo Go trên điện thoại.

## Gọi API
- Tạo `Mobile/lib/api.ts` giống `FE/src/api.ts`, nhưng:
  - Dùng URL đầy đủ: `const BASE = process.env.EXPO_PUBLIC_API_URL` (ví dụ `https://foundry-xxxx.onrender.com/api`).
  - Lưu token bằng `expo-secure-store` (`SecureStore.getItemAsync('token')`), không dùng localStorage.
- Copy các `type` (`User`, `Product`, `Feedback`) từ `FE/src/api.ts` để hai bên khớp nhau.
- Server đang chạy trên Render free nên lần gọi đầu có thể chậm 30–50 giây: hiện trạng thái đang tải, đặt timeout dài.

## Màn hình MVP (theo thứ tự)
1. Đăng nhập / Đăng ký
2. Danh sách sản phẩm (tìm kiếm, lọc thẻ)
3. Chi tiết sản phẩm + gửi góp ý
4. Dashboard tác giả

## Quy tắc
- TypeScript, không `any`. Chữ hiển thị tiếng Việt.
- Không đổi API backend chỉ để tiện cho mobile; nếu cần API mới thì làm theo skill `foundry-go-api`.

## Đưa lên Google Play
- Build: `npx eas build -p android --profile production` (cần tài khoản Expo, file `eas.json`).
- `app.json`: đặt `android.package` cố định (ví dụ `com.foundry.app`), không đổi sau khi đã upload.
- Tài khoản cá nhân mới: cần 12 người test kín liên tục 14 ngày trước khi phát hành.
