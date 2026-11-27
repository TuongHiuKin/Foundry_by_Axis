import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import AuthForm from '@/components/auth-form'
import FeedbackForm from '@/components/feedback-form'
import ProductCard from '@/components/product-card'
import { AuthContext, type AuthState } from '@/lib/auth'
import type { Product } from '@/lib/api'

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) }
jest.mock('expo-router', () => ({
  // getter: jest.mock được đưa lên đầu file, lúc đó mockRouter chưa khởi tạo
  get router() {
    return mockRouter
  },
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

const mockFetch = jest.fn()
globalThis.fetch = mockFetch as unknown as typeof fetch
const reply = (status: number, body: unknown) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })

beforeEach(() => {
  mockFetch.mockReset()
  Object.values(mockRouter).forEach((f) => f.mockClear())
})

const product: Product = {
  id: 7,
  author_id: 2,
  author_name: 'Lan',
  title: 'Sổ tay từ vựng',
  description: 'Học tiếng Anh mỗi ngày',
  link: 'https://a.vn',
  image_url: '',
  tags: 'app,ai',
  views: 10,
  hidden: false,
  avg_rating: 4.5,
  feedback_count: 3,
  created_at: '2026-11-01T00:00:00Z',
}

async function withAuth(ui: React.ReactElement, overrides: Partial<AuthState> = {}) {
  const value: AuthState = { user: null, loading: false, saveLogin: jest.fn(async () => {}), logout: jest.fn(async () => {}), ...overrides }
  await render(<AuthContext.Provider value={value}>{ui}</AuthContext.Provider>)
  return { value }
}

describe('ProductCard', () => {
  it('shows product info and opens detail on press', async () => {
    await render(<ProductCard p={product} />)
    expect(screen.getByText('Sổ tay từ vựng')).toBeTruthy()
    expect(screen.getByText(/bởi Lan · ★ 4.5 · 3 góp ý/)).toBeTruthy()
    expect(screen.getByText('#ai')).toBeTruthy()
    await fireEvent.press(screen.getByLabelText('Xem Sổ tay từ vựng'))
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/products/[id]', params: { id: '7' } })
  })
})

describe('AuthForm', () => {
  it('logs in, saves the token and goes back', async () => {
    const user = { id: 1, email: 'a@b.vn', name: 'An', role: 'user' }
    mockFetch.mockReturnValue(reply(200, { token: 'jwt', user }))
    const { value } = await withAuth(<AuthForm mode="login" />)

    await fireEvent.changeText(screen.getByLabelText('Email'), 'a@b.vn')
    await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), 'secret1')
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))

    await waitFor(() => expect(value.saveLogin).toHaveBeenCalledWith('jwt', user))
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/auth\/login$/)
    expect(JSON.parse(opts.body)).toEqual({ email: 'a@b.vn', password: 'secret1' })
    await waitFor(() => expect(mockRouter.back).toHaveBeenCalled())
  })

  it('shows the server error when login fails', async () => {
    mockFetch.mockReturnValue(reply(401, { error: 'Email hoặc mật khẩu không đúng' }))
    await withAuth(<AuthForm mode="login" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng nhập' }))
    expect(await screen.findByText('Email hoặc mật khẩu không đúng')).toBeTruthy()
  })

  it('register form sends name too', async () => {
    mockFetch.mockReturnValue(reply(201, { token: 't', user: { id: 2, email: 'c@d.vn', name: 'Chi', role: 'user' } }))
    await withAuth(<AuthForm mode="register" />)
    await fireEvent.changeText(screen.getByLabelText('Tên'), 'Chi')
    await fireEvent.changeText(screen.getByLabelText('Email'), 'c@d.vn')
    await fireEvent.changeText(screen.getByLabelText('Mật khẩu'), '123456')
    await fireEvent.press(screen.getByRole('button', { name: 'Đăng ký' }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/auth\/register$/)
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ name: 'Chi', email: 'c@d.vn', password: '123456' })
  })
})

describe('FeedbackForm', () => {
  it('blocks feedback shorter than 5 characters', async () => {
    await render(<FeedbackForm productId={7} onSent={jest.fn()} />)
    await fireEvent.changeText(screen.getByLabelText('Nội dung góp ý'), 'ok')
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi góp ý' }))
    expect(await screen.findByText('Góp ý cần ít nhất 5 ký tự')).toBeTruthy()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sends section, rating and content then calls onSent', async () => {
    mockFetch.mockReturnValue(reply(201, { ok: true }))
    const onSent = jest.fn()
    await render(<FeedbackForm productId={7} onSent={onSent} />)
    await fireEvent.press(screen.getByRole('button', { name: 'giao diện' }))
    await fireEvent.press(screen.getByRole('button', { name: '3★' }))
    await fireEvent.changeText(screen.getByLabelText('Nội dung góp ý'), 'Nút bấm hơi nhỏ')
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi góp ý' }))

    expect(await screen.findByText('Cảm ơn bạn đã góp ý!')).toBeTruthy()
    expect(onSent).toHaveBeenCalled()
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/products\/7\/feedbacks$/)
    expect(JSON.parse(opts.body)).toEqual({ section: 'giao diện', rating: 3, content: 'Nút bấm hơi nhỏ' })
  })

  it('shows the 429 anti-spam message from the server', async () => {
    mockFetch.mockReturnValue(reply(429, { error: 'Bạn vừa góp ý rồi, đợi 1 phút nhé' }))
    await render(<FeedbackForm productId={7} onSent={jest.fn()} />)
    await fireEvent.changeText(screen.getByLabelText('Nội dung góp ý'), 'Góp ý thêm lần nữa')
    await fireEvent.press(screen.getByRole('button', { name: 'Gửi góp ý' }))
    expect(await screen.findByText('Bạn vừa góp ý rồi, đợi 1 phút nhé')).toBeTruthy()
  })
})
