import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Product } from '../api'
import { useAuth } from '../auth'
import ProductCard from './ProductCard'

const TAGS = ['web', 'app', 'game', 'ai', 'tool']

export default function Home() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Đợi người dùng gõ xong 300ms rồi mới tìm, đỡ gọi API liên tục.
    const timer = setTimeout(() => {
      setLoading(true)
      api<Product[]>(`/products?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`)
        .then(setProducts)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [q, tag])

  return (
    <>
      <section className="hero">
        <h1>Nơi sản phẩm của bạn nhận góp ý thật</h1>
        <p className="muted">Đăng sản phẩm, để cộng đồng dùng thử và góp ý theo từng mục.</p>
        <Link to={user ? '/products/new' : '/register'} className="btn">
          {user ? '+ Đăng sản phẩm' : 'Bắt đầu miễn phí'}
        </Link>
      </section>

      <div className="toolbar">
        <input placeholder="Tìm sản phẩm..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tags">
          <button className={tag === '' ? 'tag active' : 'tag'} onClick={() => setTag('')}>Tất cả</button>
          {TAGS.map((t) => (
            <button key={t} className={tag === t ? 'tag active' : 'tag'} onClick={() => setTag(t)}>#{t}</button>
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : products.length === 0 ? (
        <p className="muted">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </>
  )
}
