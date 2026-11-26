import { test } from '@playwright/test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Bộ chụp màn hình cho skill ui-screenshot. Không chạy trong lượt test thường (--grep-invert @screenshot).
// Đọc <LOCAL_DIR>/screenshots/request.json: { "id": "5", "pages": ["/", "/login"] }. Không có file thì bỏ qua.
const LOCAL_DIR = path.join(
  path.dirname(execSync('git rev-parse --path-format=absolute --git-common-dir').toString().trim()),
  '.local',
)
const requestFile = path.join(LOCAL_DIR, 'screenshots', 'request.json')

const viewports = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
}

function slug(route: string) {
  return route.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-') || 'home'
}

test('capture requested pages @screenshot', async ({ browser }) => {
  test.skip(!fs.existsSync(requestFile), 'no screenshots/request.json')
  const { id, pages } = JSON.parse(fs.readFileSync(requestFile, 'utf8')) as { id: string; pages: string[] }
  const outDir = path.join(LOCAL_DIR, 'screenshots', String(id))
  fs.mkdirSync(outDir, { recursive: true })

  for (const [name, viewport] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport })
    for (const route of pages) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: path.join(outDir, `${slug(route)}-${name}.png`), fullPage: true })
    }
    await page.close()
  }
})
