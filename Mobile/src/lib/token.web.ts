// Bản web (chỉ để xem thử bằng `npm run web`): SecureStore không chạy trên web nên dùng localStorage.
const KEY = 'foundry_token'

export async function getToken() {
  return globalThis.localStorage?.getItem(KEY) ?? null
}

export async function setToken(token: string) {
  globalThis.localStorage?.setItem(KEY, token)
}

export async function clearToken() {
  globalThis.localStorage?.removeItem(KEY)
}
