import { Link } from 'react-router-dom'
import type { Product } from '../api'

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/products/${p.id}`} className="card">
      {p.image_url ? <img src={p.image_url} alt="" /> : <div className="img-placeholder">{p.title[0]}</div>}
      <div className="card-body">
        <h3>{p.title}</h3>
        <p className="muted small">bởi {p.author_name}</p>
        <p className="clamp">{p.description}</p>
        <div className="meta small muted">
          <span>👁 {p.views}</span>
          <span>★ {p.avg_rating.toFixed(1)}</span>
          <span>💬 {p.feedback_count}</span>
        </div>
        <div className="tags">
          {p.tags.split(',').filter(Boolean).map((t) => <span key={t} className="tag">#{t.trim()}</span>)}
        </div>
      </div>
    </Link>
  )
}
