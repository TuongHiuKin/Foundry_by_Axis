---
name: foundry-before-review
description: Self-check every agent must run before handing a Foundry change to review or opening a PR.
---
# Before review

## 1. Automated (each command separately)
`BE/`: `gofmt -l .` (empty), `go vet ./...`, `go build ./...`, `go test ./...`
`FE/`: `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e`
All clean. Never disable lint rules or TS checks to pass.

## 2. Checklist
- [ ] Only files needed for the task changed; no unrelated renames/moves.
- [ ] SQL parameterized.
- [ ] Protected endpoints use `requireLogin`; admin endpoints in `admin` group; ownership checked on update/delete.
- [ ] No `password_hash`, token or secret in JSON, logs or code.
- [ ] `schema.sql` change is idempotent and keeps existing data.
- [ ] User-facing errors in Vietnamese, correct HTTP status.
- [ ] `FE/src/api.ts` types match BE JSON.
- [ ] New pages handle loading, error, empty; inputs have labels.
- [ ] No new dependency (or reason stated in PR).
- [ ] Readable for a Go learner: clear names, short functions, Vietnamese comments where logic is tricky.
- [ ] `AGENTS.md` updated if commands, routes or screens changed.

## 3. Handoff note (Vietnamese, in PR body or `<LOCAL_DIR>/reports/<id>.md`)
What and why · files changed · how it was tested (commands, curl, UI steps) · open questions. Link the issue (`Closes #<id>`).
