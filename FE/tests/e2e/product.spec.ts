import { expect, test } from '@playwright/test'
import { createProduct, register, uniqueEmail } from './helpers'

test('author posts a product and sees it on dashboard', async ({ page }) => {
  const title = `San pham ${Date.now()}`
  await register(page, 'Author', uniqueEmail('author'))
  await createProduct(page, title, 'Mo ta san pham', 'web,e2e')

  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Dashboard tác giả' })).toBeVisible()
  await expect(page.getByRole('link', { name: title })).toBeVisible()
})

test('another user sends feedback on a product', async ({ browser }) => {
  const title = `Feedback target ${Date.now()}`

  const authorPage = await browser.newPage()
  await register(authorPage, 'Author', uniqueEmail('author'))
  await createProduct(authorPage, title, 'Hay lam')
  const productUrl = authorPage.url()
  await authorPage.close()

  const page = await browser.newPage()
  await register(page, 'Tester', uniqueEmail('tester'))
  await page.goto(productUrl)
  await page.getByLabel('Mục').selectOption('giao diện')
  await page.getByPlaceholder('Bạn thấy sản phẩm thế nào?').fill('Giao dien dep, de dung')
  await page.getByRole('button', { name: 'Gửi góp ý' }).click()

  await expect(page.getByText('Cảm ơn bạn đã góp ý!')).toBeVisible()
  await expect(page.getByText('Giao dien dep, de dung')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Góp ý (1)' })).toBeVisible()
  await page.close()
})

test('search filters products by title', async ({ page }) => {
  const unique = `Zeta${Date.now()}`
  await register(page, 'Searcher', uniqueEmail('search'))
  await createProduct(page, unique, 'Tim kiem')

  await page.goto('/')
  await page.getByPlaceholder('Tìm sản phẩm...').fill(unique)
  await expect(page.getByRole('heading', { name: unique })).toBeVisible()
})
