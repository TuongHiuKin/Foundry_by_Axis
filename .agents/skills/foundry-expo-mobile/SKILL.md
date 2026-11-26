---
name: foundry-expo-mobile
description: Set up and build the Foundry React Native + Expo app in Mobile/, reusing the Go API, and ship it to Google Play. Use for any mobile task.
---
# Foundry Expo mobile

## Setup (done: Expo SDK 58, Expo Router, routes in `Mobile/src/app/`)
In `Mobile/`: `npm ci`, then `npx expo start`, scan QR with Expo Go.
Add packages only with `npx expo install <pkg>` (SDK-compatible versions); new deps need owner approval.
Checks: `npm run typecheck`, `npm run lint`, `npm test` (Jest + jest-expo + RNTL v14: `await render`, `await fireEvent`).

## API
- `Mobile/src/lib/api.ts` mirrors `FE/src/api.ts` but:
  - base URL from `process.env.EXPO_PUBLIC_API_URL` (default `https://foundry-md04.onrender.com/api`, set per profile in `eas.json`);
  - token in `expo-secure-store` (`src/lib/token.ts`; `token.web.ts` = localStorage for web preview only).
- Screens fetch with `useApi()` (`src/lib/use-api.ts`) and show `Loading` / `ErrorView` / `Empty` from `src/components/ui.tsx`.
- Copy types from `FE/src/api.ts`; keep them in sync.
- Render free sleeps: first call can take 30–50 s → show loading, long timeout.

## MVP screens (order)
Login/Register → product list (search, tag) → product detail + feedback → author dashboard.

## Rules
- Strict TS, Vietnamese UI text.
- Do not change BE just for mobile convenience; new endpoints follow `foundry-go-api`.

## Release (Google Play)
- `eas build -p android --profile production` (Expo account, `eas.json`).
- `android.package` in `app.json` is `com.foundrybyaxis.app`; never change it after the first upload.
- `eas.json`: `preview` = APK for direct install, `production` = AAB, versionCode auto-incremented remotely; `eas submit` targets the closed track (`alpha`).
- New personal developer account: closed test with 12 testers for 14 consecutive days before production.
