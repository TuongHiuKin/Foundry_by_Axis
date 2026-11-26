import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, post, type Feedback, type Product } from '../api'
import { useAuth } from '../auth'

const SECTIONS = ['chung', 'giao diện', 'tính năng', 'hiệu năng', 'lỗi']

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [error, setError] = useState('')

  // Form góp ý
  const [section, setSection] = useState('chung')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState('')

  function loadFeedbacks() {
    api<Feedback[]>(`/products/${id}/feedbacks`).then(setFeedbacks)
  }

  useEffect(() => {
    api<Product>(`/products/${id}`).then(setProduct).catch((e) => setError(e.message))
    api<Feedback[]>(`/products/${id}/feedbacks`).then(setFeedbacks)
  }, [id])

  async function sendFeedback(e: FormEvent) {
    e.preventDefault()
    try {
      await post(`/products/${id}/feedbacks`, { section, rating, content })
      setContent('')
      setMsg('Cảm ơn bạn đã góp ý!')
      loadFeedbacks()
    } catch (err) {
      setMsg((err as Error).message)
    }
  }

  async function report(body: { product_id?: number; feedback_id?: number }) {
    const reason = prompt('Lý do báo cáo?')
    if (!reason) return
    try {
      await post('/reports', { ...body, reason })
      alert('Đã gửi báo cáo cho admin.')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  async function remove() {
    if (!confirm('Xoá sản phẩm này?')) return
    await api(`/products/${id}`, { method: 'DELETE' })
    navigate('/dashboard')
  }

  if (error) return <p className="error">{error}</p>
  if (!product) return <p className="muted">Đang tải...</p>

  const isOwner = user && (user.id === product.author_id || user.role === 'admin')

  return (
    <div className="detail">
      <div className="detail-head">
        {product.image_url && <img src={product.image_url} alt="" />}
        <div>
          <h1>{product.title}</h1>
          <p className="muted">bởi {product.author_name} · 👁 {product.views} lượt xem · ★ {product.avg_rating.toFixed(1)}</p>
          <p className="pre">{product.description}</p>
          <div className="row">
            {product.link && <a className="btn" href={product.link} target="_blank" rel="noreferrer">Dùng thử</a>}
            {isOwner && <Link className="btn-ghost" to={`/products/${id}/edit`}>Sửa</Link>}
            {isOwner && <button className="btn-ghost danger" onClick={remove}>Xoá</button>}
            {user && !isOwner && <button className="btn-ghost" onClick={() => report({ product_id: product.id })}>Báo cáo</button>}
          </div>
        </div>
      </div>

      <h2>Góp ý ({feedbacks.length})</h2>
      {user ? (
        <form className="box" onSubmit={sendFeedback}>
          <div className="row">
            <label>Mục
              <select value={section} onChange={(e) => setSection(e.target.value)}>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Đánh giá
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </label>
          </div>
          <textarea required minLength={5} placeholder="Bạn thấy sản phẩm thế nào?" value={content} onChange={(e) => setContent(e.target.value)} />
          <button className="btn">Gửi góp ý</button>
          {msg && <p className="muted">{msg}</p>}
        </form>
      ) : (
        <p className="muted"><Link to="/login">Đăng nhập</Link> để góp ý.</p>
      )}

      {feedbacks.map((f) => (
        <div key={f.id} className="box feedback">
          <div className="row between">
            <strong>{f.user_name}</strong>
            <span className="muted small">{'★'.repeat(f.rating)} · {f.section}</span>
          </div>
          <p className="pre">{f.content}</p>
          {user && <button className="link small" onClick={() => report({ feedback_id: f.id })}>Báo cáo góp ý này</button>}
        </div>
      ))}
    </div>
  )
}
