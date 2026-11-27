import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// Gọi GET một đường dẫn và giữ trạng thái tải / lỗi / dữ liệu. path = null thì chưa gọi.
// Gọi reload() để tải lại (kéo xuống để làm mới, bấm "Thử lại"...).
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(path !== null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (path === null) return
    let cancelled = false // màn hình đã đổi đường dẫn / bị đóng thì bỏ kết quả cũ
    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setLoading(true)
        setError('')
        return api<T>(path).then((d) => {
          if (!cancelled) setData(d)
        })
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [path, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { data, error, loading, reload }
}
