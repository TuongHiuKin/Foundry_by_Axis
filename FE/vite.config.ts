/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Khi chạy local (npm run dev), mọi request /api sẽ được chuyển sang server Go ở cổng 8080.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8080' },
  },
  // Vitest chỉ chạy unit test trong src/, test E2E (tests/e2e) do Playwright chạy.
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
