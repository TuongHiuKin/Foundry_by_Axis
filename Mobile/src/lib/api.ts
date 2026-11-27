// Hàm gọi API dùng chung cho app mobile.
// Giống FE/src/api.ts nhưng gọi URL đầy đủ (server trên Render) và lấy token từ SecureStore.
import { getToken } from './token'

// Kiểu dữ liệu: chép từ FE/src/api.ts, phải giữ giống JSON của BE.
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

export type DashboardData = {
  products: Product[]
  total_products: number
  total_views: number
  total_feedbacks: number
}

export type AuthResponse = { token: string; user: User }

// Giống web: tag gợi ý ở trang chủ và các mục góp ý.
export const TAGS = ['web', 'app', 'game', 'ai', 'tool']
export const SECTIONS = ['chung', 'giao diện', 'tính năng', 'hiệu năng', 'lỗi']

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://foundry-md04.onrender.com/api').replace(/\/+$/, '')

// Render bản miễn phí ngủ khi không ai dùng: lần gọi đầu có thể mất 30–50 giây.
export const TIMEOUT_MS = 60_000

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(API_URL + path, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(options.headers as Record<string, string> | undefined),
      },
    })
  } catch {
    throw new Error('Không kết nối được máy chủ, kiểm tra mạng rồi thử lại')
  } finally {
    clearTimeout(timer)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
  return data as T
}

export const post = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) })

// Tạo đường dẫn danh sách sản phẩm có tìm kiếm theo tên và lọc theo tag.
export function productsPath(q: string, tag: string) {
  return `/products?q=${encodeURIComponent(q.trim())}&tag=${encodeURIComponent(tag)}`
}

// "web, ai,,game" -> ["web", "ai", "game"]
export function splitTags(tags: string) {
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}
