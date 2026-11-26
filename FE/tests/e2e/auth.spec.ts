import { expect, test } from '@playwright/test'
import { register, uniqueEmail } from './helpers'

test('home page shows hero and call to action', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Nơi sản phẩm của bạn nhận góp ý thật' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Bắt đầu miễn phí' })).toBeVisible()
})

test('user can register, log out and log in again', async ({ page }) => {
  const email = uniqueEmail('auth')
  await register(page, 'Kien E2E', email)

  await page.getByRole('button', { name: 'Đăng xuất' }).click()
  await expect(page.getByRole('link', { name: 'Đăng nhập' })).toBeVisible()

  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Mật khẩu (ít nhất 6 ký tự)').fill('123456')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByText('Chào, Kien E2E')).toBeVisible()
})

test('login with wrong password shows error', async ({ page }) => {
  const email = uniqueEmail('wrong')
  await register(page, 'Wrong Pass', email)
  await page.getByRole('button', { name: 'Đăng xuất' }).click()

  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Mật khẩu (ít nhất 6 ký tự)').fill('sai-mat-khau')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByText('Email hoặc mật khẩu không đúng')).toBeVisible()
})

test('dashboard requires login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})
