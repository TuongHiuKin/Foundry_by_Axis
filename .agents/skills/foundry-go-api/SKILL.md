---
name: foundry-go-api
description: Add or change a Go (Gin + pgx) API endpoint in BE/ following Foundry conventions. Use for any backend task.
---
# Foundry Go API

## Layout
Single package `main`, one file per feature area: `auth.go`, `products.go`, `feedback.go`, `reports.go`, `admin.go`. New area → new file (e.g. `payments.go`). Shared helpers in `helpers.go` (`idParam`, `serverError`). DB pool: global `db` (`*pgxpool.Pool`). Current user: `currentUserID(c)`, `c.GetString("role")`.

## Steps
1. Schema (if needed): edit `BE/schema.sql` idempotently.
2. Response struct: snake_case JSON tags, `time.Time` for timestamps, pointers for nullable columns.
3. Input struct: Gin `binding` tags for validation (`binding:"required,min=1,max=5"`).
4. Handler pattern:
```go
// POST /api/products/:id/likes
func likeProduct(c *gin.Context) {
	id, ok := idParam(c) // writes 400 on bad id
	if !ok {
		return
	}
	_, err := db.Exec(c,
		`INSERT INTO likes (product_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		id, currentUserID(c))
	if err != nil {
		serverError(c, err) // logs + 500
		return
	}
	c.JSON(201, gin.H{"ok": true})
}
```
5. Register the route in `setupRoutes` (`BE/main.go`) with `requireLogin` or inside the `admin` group as needed.

## Rules
- Parameterized SQL only. No `fmt.Sprintf` into SQL.
- Single row: `QueryRow(...).Scan(...)`; `errors.Is(err, pgx.ErrNoRows)` → 404.
- Many rows: `defer rows.Close()`, start with `list := []T{}`.
- Check ownership before update/delete (see `canEdit`).
- Never return `password_hash` or secrets.
- Error messages to users in Vietnamese.
- No ORM, no repository/service layer, no new dependency unless stdlib/gin/pgx cannot do it (explain in PR).

## Tests
- Put tests next to code: `<area>_test.go` (package `main`).
- Start each test with `r := newTestServer(t)` (fresh DB, skips without `TEST_DATABASE_URL`).
- Helpers in `testhelpers_test.go`: `doJSON`, `doList`, `doRaw`, `registerUser`, `newProduct`. Email `admin@test.com` is admin.
- One behavior per test; assert status code and key JSON fields; error messages are Vietnamese.

## Verify
`gofmt -l .` (empty) → `go vet ./...` → `go build ./...` → `go test ./...` (in `BE/`). Manual check with curl against local DB (`docker compose up -d`).
