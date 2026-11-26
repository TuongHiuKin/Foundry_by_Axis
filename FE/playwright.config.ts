import { defineConfig, devices } from '@playwright/test'
import { execSync } from 'node:child_process'
import path from 'node:path'

// LOCAL_DIR = <repo chính>/.local (tìm qua git common dir nên chạy trong worktree vẫn đúng).
const LOCAL_DIR = path.join(
  path.dirname(execSync('git rev-parse --path-format=absolute --git-common-dir').toString().trim()),
  '.local',
)

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'

// Database riêng cho E2E (tạo sẵn bởi docker-compose: foundry_e2e).
const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? 'postgres://foundry:foundry@localhost:5433/foundry_e2e?sslmode=disable'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: 0,
  outputDir: LOCAL_DIR + '/playwright/test-results',
  reporter: [['line'], ['html', { outputFolder: LOCAL_DIR + '/playwright/report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // PW_CHANNEL=chrome: dùng Chrome đã cài trên máy thay cho trình duyệt của Playwright.
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Tự bật backend Go và web Vite trước khi test. Cần PostgreSQL đang chạy (docker compose up -d).
  webServer: [
    {
      command: 'go run .',
      cwd: '../BE',
      url: 'http://localhost:8080/api/health',
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        DATABASE_URL: E2E_DATABASE_URL,
        JWT_SECRET: 'e2e-secret',
        ADMIN_EMAIL: 'admin@e2e.test',
        PORT: '8080',
      },
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
