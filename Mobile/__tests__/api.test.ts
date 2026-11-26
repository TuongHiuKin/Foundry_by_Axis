import * as SecureStore from 'expo-secure-store'
import { API_URL, api, post, productsPath, splitTags } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/token'

const mockFetch = jest.fn()
globalThis.fetch = mockFetch as unknown as typeof fetch

function reply(status: number, body: unknown) {
  return Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) })
}

beforeEach(() => {
  mockFetch.mockReset()
  ;(SecureStore as unknown as { __reset: () => void }).__reset()
})

describe('api', () => {
  it('calls the full API URL without a token when logged out', async () => {
    mockFetch.mockReturnValue(reply(200, [{ id: 1 }]))
    const data = await api('/products')
    expect(data).toEqual([{ id: 1 }])
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe(API_URL + '/products')
    expect(opts.headers.Authorization).toBeUndefined()
  })

  it('defaults to the Render server', () => {
    expect(API_URL).toBe('https://foundry-md04.onrender.com/api')
  })

  it('sends Bearer token stored in SecureStore', async () => {
    await setToken('abc')
    mockFetch.mockReturnValue(reply(200, {}))
    await api('/auth/me')
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
  })

  it('throws the Vietnamese error message from the server', async () => {
    mockFetch.mockReturnValue(reply(401, { error: 'Email hoặc mật khẩu không đúng' }))
    await expect(post('/auth/login', { email: 'a', password: 'b' })).rejects.toThrow('Email hoặc mật khẩu không đúng')
  })

  it('falls back to a generic error when body is not JSON', async () => {
    mockFetch.mockReturnValue(Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error('x')) }))
    await expect(api('/products')).rejects.toThrow('Có lỗi xảy ra')
  })

  it('reports a network error in Vietnamese', async () => {
    mockFetch.mockReturnValue(Promise.reject(new TypeError('Network request failed')))
    await expect(api('/products')).rejects.toThrow('Không kết nối được máy chủ')
  })

  it('post sends JSON body with POST method', async () => {
    mockFetch.mockReturnValue(reply(201, { ok: true }))
    await post('/reports', { product_id: 3, reason: 'spam' })
    const opts = mockFetch.mock.calls[0][1]
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ product_id: 3, reason: 'spam' })
    expect(opts.headers['Content-Type']).toBe('application/json')
  })
})

describe('token', () => {
  it('saves, reads and clears the token', async () => {
    expect(await getToken()).toBeNull()
    await setToken('t1')
    expect(await getToken()).toBe('t1')
    await clearToken()
    expect(await getToken()).toBeNull()
  })
})

describe('helpers', () => {
  it('productsPath encodes search and tag', () => {
    expect(productsPath(' giao diện ', 'ai')).toBe('/products?q=giao%20di%E1%BB%87n&tag=ai')
  })

  it('splitTags drops blanks and spaces', () => {
    expect(splitTags('web, ai,,game ')).toEqual(['web', 'ai', 'game'])
    expect(splitTags('')).toEqual([])
  })
})
