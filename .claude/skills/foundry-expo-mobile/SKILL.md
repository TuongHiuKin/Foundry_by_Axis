---
name: foundry-expo-mobile
description: Set up and build the Foundry React Native + Expo app in Mobile/, reusing the Go API, and ship it to Google Play. Use for any mobile task.
---
# Foundry Expo mobile

## Init (once, needs owner approval: package install)
In `Mobile/`: `npx create-expo-app@latest . --template default` (Expo Router + TS), then `npx expo install expo-secure-store`. Run: `npx expo start`, scan QR with Expo Go.

## API
- `Mobile/lib/api.ts` mirrors `FE/src/api.ts` but:
  - base URL from `process.env.EXPO_PUBLIC_API_URL` (e.g. `https://<service>.onrender.com/api`);
  - token in `expo-secure-store`, not localStorage.
- Copy types from `FE/src/api.ts`; keep them in sync.
- Render free sleeps: first call can take 30–50 s → show loading, long timeout.

## MVP screens (order)
Login/Register → product list (search, tag) → product detail + feedback → author dashboard.

## Rules
- Strict TS, Vietnamese UI text.
- Do not change BE just for mobile convenience; new endpoints follow `foundry-go-api`.

## Release (Google Play)
- `eas build -p android --profile production` (Expo account, `eas.json`).
- Fix `android.package` in `app.json` (e.g. `com.foundry.app`) before first upload; never change it after.
- New personal developer account: closed test with 12 testers for 14 consecutive days before production.
