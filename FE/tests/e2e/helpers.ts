import { expect, type Page } from '@playwright/test'

// Email khác nhau mỗi lần chạy để các test không đụng nhau (database E2E không bị xoá).
export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`
}

export async function register(page: Page, name: string, email: string, password = '123456') {
  await page.goto('/register')
  await page.getByPlaceholder('Tên hiển thị').fill(name)
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Mật khẩu (ít nhất 6 ký tự)').fill(password)
  await page.getByRole('button', { name: 'Đăng ký' }).click()
  await expect(page.getByText(`Chào, ${name}`)).toBeVisible()
}

export async function createProduct(page: Page, title: string, description: string, tags = '') {
  await page.goto('/products/new')
  await page.getByLabel('Tên sản phẩm').fill(title)
  await page.getByLabel('Mô tả').fill(description)
  await page.getByLabel('Thẻ (cách nhau bằng dấu phẩy)').fill(tags)
  await page.getByRole('button', { name: 'Đăng', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
}
