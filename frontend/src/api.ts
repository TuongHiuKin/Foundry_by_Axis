// Hàm gọi API dùng chung cho cả web.
// Tự gắn token đăng nhập (nếu có) và báo lỗi bằng câu tiếng Việt từ server.

export type User = { id: number; email: string; name: string; role: 'user' | 'admin' }

export type Product = {
  id: number
  author_id: number
  author_name: string
  title: string
  description: string
  link: string
  image_url: string
  tags: string
  views: number
  hidden: boolean
  avg_rating: number
  feedback_count: number
  created_at: string
}

export type Feedback = {
  id: number
  user_name: string
  section: string
  rating: number
  content: string
  created_at: string
}

export function getToken() {
  return localStorage.getItem('token')
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch('/api' + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
  return data as T
}

export const post = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) })
