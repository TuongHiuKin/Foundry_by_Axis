import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, post } from './api'

// localStorage giả lập (Vitest chạy trong Node, không có trình duyệt).
function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => { data[k] = v },
    removeItem: (k: string) => { delete data[k] },
  }
}

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({ ok: status < 400, status, json: () => Promise.resolve(body) })
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('api', () => {
  beforeEach(() => vi.stubGlobal('localStorage', fakeStorage()))
  afterEach(() => vi.unstubAllGlobals())

  it('prefixes path with /api and returns JSON', async () => {
    const fetchFn = mockFetch(200, [{ id: 1 }])
    const data = await api<{ id: number }[]>('/products')
    expect(fetchFn).toHaveBeenCalledWith('/api/products', expect.anything())
    expect(data).toEqual([{ id: 1 }])
  })

  it('adds bearer token when logged in', async () => {
    vi.stubGlobal('localStorage', fakeStorage({ token: 'abc' }))
    const fetchFn = mockFetch(200, {})
    await api('/auth/me')
    const headers = fetchFn.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Bearer abc')
  })

  it('sends no Authorization header when logged out', async () => {
    const fetchFn = mockFetch(200, {})
    await api('/products')
    expect(fetchFn.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('throws the server error message', async () => {
    mockFetch(401, { error: 'Bạn cần đăng nhập' })
    await expect(api('/me/dashboard')).rejects.toThrow('Bạn cần đăng nhập')
  })

  it('throws a default message when server sends no error text', async () => {
    mockFetch(500, {})
    await expect(api('/products')).rejects.toThrow('Có lỗi xảy ra')
  })

  it('post sends JSON body with POST method', async () => {
    const fetchFn = mockFetch(201, { id: 7 })
    const res = await post<{ id: number }>('/products', { title: 'X' })
    const options = fetchFn.mock.calls[0][1]
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ title: 'X' })
    expect(res.id).toBe(7)
  })
})
