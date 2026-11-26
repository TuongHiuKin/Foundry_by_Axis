---
name: foundry-react-page
description: Add or change pages, components and API calls in the Foundry React + Vite + TypeScript web app (FE/). Use for any web UI task; combine with frontend-design for look and feel.
---
# Foundry React page

## Layout
- `src/api.ts`: shared types (`User`, `Product`, `Feedback`) + `api<T>(path, options)` and `post<T>(path, body)`. Adds the bearer token, throws `Error` with the server's Vietnamese message.
- `src/auth.ts` (`useAuth()` → `{user, loading, saveLogin, logout}`), `src/AuthProvider.tsx`.
- `src/App.tsx`: nav + `<Routes>`. Login-only pages wrapped in `<NeedLogin>`, admin pages in `<NeedLogin admin>`.
- `src/pages/*.tsx`: one page per file, default export.
- `src/index.css`: all styles, CSS variables in `:root`. Existing classes: `btn btn-ghost box card grid row between muted small error tag stats stat`.

## Steps
1. New data → add a `type` in `src/api.ts` matching BE JSON exactly (snake_case).
2. Create `src/pages/Name.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { api, type Product } from '../api'

export default function Name() {
  const [items, setItems] = useState<Product[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    api<Product[]>('/products').then(setItems).catch((e) => setError(e.message))
  }, [])
  if (error) return <p className="error">{error}</p>
  return <div className="grid">{/* ... */}</div>
}
```
3. Add `<Route>` in `App.tsx` (+ nav link if needed). Update the Screens list in `AGENTS.md`.

## Rules
- Strict TS, no `any`. Never call `fetch` directly.
- UI text in Vietnamese. Handle loading, error and empty states.
- Accessible labels/roles on inputs and buttons (needed for Playwright locators).
- No UI/state libraries (Redux, MUI, Tailwind, …) without owner approval.

## Tests
- Unit (Vitest): `src/**/*.test.ts(x)`, node environment (stub `fetch`/`localStorage` with `vi.stubGlobal`, see `src/api.test.ts`).
- E2E (Playwright): `tests/e2e/*.spec.ts`; reuse `register`, `createProduct`, `uniqueEmail` from `tests/e2e/helpers.ts`. Locate by role/label/placeholder/text.

## Verify
`npm run build`, `npm run lint`, `npm test`, `npm run test:e2e` in `FE/` must be clean.
