---
name: foundry-project
description: Architecture, data model, auth and API conventions of the Foundry (EXE2) monorepo. Read first before any task in this repo.
---
# Foundry project overview

## Architecture
- One Go server (`BE/`): JSON API under `/api/*`; every other path serves the built React app from `./web` (`BE/static.go`, SPA fallback to `index.html`).
- Web (`FE/`) calls relative `/api/...` through `api()` in `FE/src/api.ts`. Local: Vite proxy to :8080. Production: same origin, no CORS.
- Mobile (`Mobile/`, later) calls the same API with a full URL.
- Deploy: one Docker web service on Render (free) + Neon PostgreSQL (free). See `foundry-deploy`.

## Data model (`BE/schema.sql`, runs on every startup → must be idempotent)
- `users`: email (unique, lowercased), password_hash (bcrypt), name, role `user|admin`.
- `products`: author_id→users, title, description, link, image_url, tags (comma string `web,ai`), views, hidden.
- `feedbacks`: product_id, user_id, section (`chung|giao diện|tính năng|hiệu năng|lỗi`), rating 1–5, content.
- `reports`: reporter_id, product_id OR feedback_id, reason, status `open|resolved`.

## Auth
- `POST /api/auth/register|login` → `{token, user}`. JWT HS256, 7 days, claims `sub` (user id), `role`.
- Client sends `Authorization: Bearer <token>`; FE stores token in `localStorage`.
- Middleware `requireLogin` sets `userID`, `role` in gin context; `requireAdmin` checks role.
- Email equal to env `ADMIN_EMAIL` becomes admin at registration.
- Edit/delete product: author or admin only (`canEdit` in `products.go`).
- Hidden products: excluded from public list and detail; visible in author dashboard and `/api/admin/products`.

## API
`setupRoutes` in `BE/main.go` is the only route table. New endpoints must be registered there.

## Behavior rules already implemented
- `GET /api/products/:id` increments `views`.
- Feedback anti-spam: same user + product max 1 per minute → 429.
- Duplicate email → 409. Wrong login → 401 with one generic message.

## Not built yet
Payment (29.000đ plan), notifications, image upload (currently image URL only), mobile app, tests.
