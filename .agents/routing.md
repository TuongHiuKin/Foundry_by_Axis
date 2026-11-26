# Project routing overrides (Foundry)

Project rules take precedence over global defaults in route-task. Always include the matching project skill path in the handoff prompt.

| signal | agent | skill |
|---|---|---|
| Backend / API / database / `BE/` | test-writer → coder | tdd-red → tdd-green + `.agents/skills/foundry-go-api/SKILL.md` |
| Web UI / page / `FE/` | test-writer → coder | tdd-red → tdd-green + `.agents/skills/foundry-react-page/SKILL.md` + frontend-design |
| Mobile / Expo / `Mobile/` | test-writer → coder | tdd-red → tdd-green + `.agents/skills/foundry-expo-mobile/SKILL.md` |
| Deploy / Docker / Render / Neon | coder (no TDD, owner approval) | `.agents/skills/foundry-deploy/SKILL.md` |
| Ready for PR | pr-opener | open-pr (run `.agents/skills/foundry-before-review/SKILL.md` first) |

Hot files (one task at a time): `BE/main.go`, `BE/schema.sql`, `FE/src/App.tsx`, `FE/src/api.ts`, `FE/package.json`, `FE/package-lock.json`, `BE/go.mod`, `BE/go.sum`, `Dockerfile`, `render.yaml`.
