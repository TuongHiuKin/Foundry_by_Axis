# AGENTS.md — Foundry (EXE2)

Single source of truth for every coding agent. `CLAUDE.md` imports this file.

## Language rule
- This file and skill files: concise English.
- ALL user-facing output (replies, reports, questions) MUST be in Vietnamese.
- Code, test names, commit messages, branch names: English.
- UI text shown to end users and API error messages (`{"error": "..."}`): Vietnamese.

## Overview
Foundry: authors post products, the community tries them and leaves feedback per section, users report abuse, authors have a dashboard, admins moderate.
Monorepo, single owner, work tracked with GitHub issues + PRs.

| Folder | Stack | Project skill |
|---|---|---|
| `BE/` | Go 1.26, Gin, pgx v5 (PostgreSQL), JWT HS256, bcrypt | `.agents/skills/foundry-go-api/SKILL.md` |
| `FE/` | React 19, Vite, TypeScript, react-router-dom | `.agents/skills/foundry-react-page/SKILL.md` |
| `Mobile/` | React Native + Expo (not started) | `.agents/skills/foundry-expo-mobile/SKILL.md` |
| root | `Dockerfile`, `render.yaml`, `docker-compose.yml` | `.agents/skills/foundry-deploy/SKILL.md` |

Architecture, data model, auth: `.agents/skills/foundry-project/SKILL.md` (read first).

## Architecture tree
```
BE/            Go server: /api/* JSON + serves built FE from ./web
  main.go      env config + ALL routes (setupRoutes) — hot file
  db.go        pgxpool + runs schema.sql at startup
  schema.sql   idempotent DDL — hot file
  auth.go products.go feedback.go reports.go admin.go helpers.go static.go
FE/src/        api.ts (types + fetch helper), auth.ts, AuthProvider.tsx, App.tsx (routes — hot file), pages/, index.css
Mobile/        README only
docs/          product, architecture, adr, api, testing
.agents/       skills/ (portable + foundry-*), routing.md
.claude/skills mirror of .agents/skills for Claude Code
.local/        local-only, gitignored (queue, reports, screenshots)
```

## Commands (run each as a separate step, no chaining)
| Purpose | Command | Dir |
|---|---|---|
| Start PostgreSQL | `docker compose up -d` | root |
| Restore FE deps | `npm ci` | FE |
| Build BE | `go build ./...` | BE |
| Vet BE | `go vet ./...` | BE |
| Format check BE | `gofmt -l .` (must print nothing) | BE |
| Unit tests BE | `go test ./...` | BE |
| Build FE (tsc + vite) | `npm run build` | FE |
| Lint FE | `npm run lint` | FE |
| Run BE | `go run .` (needs env, see `BE/.env.example`) | BE |
| Run FE dev | `npm run dev` → http://localhost:5173, proxies `/api` to :8080 | FE |
| Docker image | `docker build -t foundry .` | root |

Env vars for BE: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` (registering with this email → admin), `PORT` (default 8080).

## Tests
- NOT set up yet: no Go test files, no Vitest, no Playwright. Before the first TDD task run skill `init-project` (`.agents/skills/init-project/SKILL.md`); it reuses this file and only adds missing sections.
- Planned: BE unit tests with `go test` + `net/http/httptest` against a test database (`TEST_DATABASE_URL`, skip when unset); FE unit with Vitest; E2E with Playwright in `FE/tests/e2e/`, webServer starting BE + FE dev.
- LOCAL_DIR = <main repo>/.local, resolved via `git rev-parse --path-format=absolute --git-common-dir` (works from worktrees).

## Screens (FE routes)
`/` home + search/tag filter · `/products/:id` detail + feedback + report · `/login` · `/register` · `/products/new` · `/products/:id/edit` · `/dashboard` (login) · `/admin` (admin)

## Conventions
1. Keep code simple and readable: the owner is learning Go. No ORM, no repository/service layers, no DI, no new frameworks without approval.
2. SQL always parameterized (`$1, $2`). Never build SQL from user input.
3. Schema changes only in `BE/schema.sql`, idempotent (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`). Never drop tables/columns holding data.
4. JSON fields snake_case. Errors: `{"error": "<Vietnamese>"}` with correct status (400/401/403/404/409/429/500 via `serverError`). Empty lists → `[]`.
5. FE calls the server only through `api()` / `post()` in `FE/src/api.ts`; keep TS types in sync with BE JSON.
6. Comments in code: Vietnamese, only where logic is not obvious.
7. Before handing off for review: `.agents/skills/foundry-before-review/SKILL.md`.

## Git
- Branch per task: `feat/<issue-id>-<slug>` or `fix/<issue-id>-<slug>`; PR into `main`; the owner merges. Never push to `main`, never force push, never merge.
- Commit format: see `.agents/skills/run-tests/SKILL.md`.

## Do not touch
- Secrets: `.env`, Neon connection string, `JWT_SECRET` — never commit or print.
- `render.yaml` service name/region, `Dockerfile` stage layout — only via `foundry-deploy` skill.
- `.local/` — never commit.
