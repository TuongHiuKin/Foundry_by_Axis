# Mobile – app Foundry (React Native + Expo)

App Android cho Foundry, dùng chung API Go với web (`https://foundry-md04.onrender.com/api`).
Expo SDK 58, Expo Router, TypeScript strict. Token đăng nhập lưu trong `expo-secure-store`.

## Màn hình

| Đường dẫn | File | Nội dung |
|---|---|---|
| `/` | `src/app/index.tsx` | Danh sách sản phẩm, tìm theo tên, lọc tag, kéo để làm mới |
| `/products/:id` | `src/app/products/[id]/index.tsx` | Chi tiết, dùng thử, góp ý theo mục + số sao, báo cáo, sửa/xoá (tác giả) |
| `/login`, `/register` | `src/components/auth-form.tsx` | Đăng nhập / đăng ký |
| `/products/new`, `/products/:id/edit` | `src/components/product-form.tsx` | Đăng / sửa sản phẩm (cần đăng nhập) |
| `/dashboard` | `src/app/dashboard.tsx` | Thống kê của tác giả, sản phẩm của tôi, đăng xuất |

Code dùng chung: `src/lib/api.ts` (kiểu dữ liệu + `api()`/`post()`, chép từ `FE/src/api.ts`, phải giữ giống JSON của BE), `src/lib/auth.tsx`, `src/lib/token.ts`.

## Chạy thử trên điện thoại

```bash
cd Mobile
npm ci
npx expo start
```

Cài app **Expo Go** trên Android, quét mã QR. Máy tính và điện thoại cần cùng mạng Wi-Fi (hoặc chạy `npx expo start --tunnel`).

Đổi server API: tạo file `Mobile/.env.local` với `EXPO_PUBLIC_API_URL=http://<IP máy tính>:8080/api` để gọi BE chạy ở máy. Mặc định gọi server trên Render (lần đầu có thể chờ 30–50 giây vì Render bản miễn phí ngủ).

> `npm run web` chỉ để xem giao diện: trình duyệt sẽ bị chặn CORS khi gọi Render vì BE không bật CORS. App Android không bị ảnh hưởng.

## Kiểm tra

```bash
npm run typecheck
npm run lint
npm test
```

Test nằm trong `Mobile/__tests__/` (Jest + `jest-expo` + React Native Testing Library), giả lập `fetch` và SecureStore nên không cần server.

## Build và đưa lên CH Play

Cần tài khoản Expo (miễn phí) và tài khoản Google Play Console.

```bash
npm install -g eas-cli
eas login
eas init                      # lần đầu: tạo project trên expo.dev, ghi projectId vào app.json
eas build -p android --profile preview      # file APK để cài thử trực tiếp
eas build -p android --profile production   # file AAB để tải lên CH Play
```

- `android.package` = `com.foundrybyaxis.app` (trong `app.json`). **Không được đổi sau lần tải lên CH Play đầu tiên.**
- `versionCode` do EAS tự tăng mỗi lần build production (`appVersionSource: remote`, `autoIncrement`).
- Lần đầu: tải file AAB lên Play Console bằng tay (tab **Testing → Closed testing**). Các lần sau có thể dùng `eas submit -p android --profile production` với file khoá dịch vụ `play-service-account.json` (đã nằm trong `.gitignore`, không commit), mặc định đẩy lên kênh closed testing (`alpha`) ở trạng thái nháp.
- Tài khoản nhà phát triển cá nhân mới: phải chạy closed test với ít nhất 12 người thử trong 14 ngày liên tục trước khi xin lên production.
