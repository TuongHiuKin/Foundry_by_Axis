import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Product } from '../api'

type DashboardData = {
  products: Product[]
  total_products: number
  total_views: number
  total_feedbacks: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    api<DashboardData>('/me/dashboard').then(setData)
  }, [])

  if (!data) return <p className="muted">Đang tải...</p>

  return (
    <>
      <div className="row between">
        <h1>Dashboard tác giả</h1>
        <Link to="/products/new" className="btn">+ Đăng sản phẩm</Link>
      </div>
      <div className="stats">
        <Stat label="Sản phẩm" value={data.total_products} />
        <Stat label="Lượt xem" value={data.total_views} />
        <Stat label="Góp ý" value={data.total_feedbacks} />
      </div>
      <table>
        <thead>
          <tr><th>Sản phẩm</th><th>Lượt xem</th><th>Góp ý</th><th>Điểm</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          {data.products.map((p) => (
            <tr key={p.id}>
              <td><Link to={`/products/${p.id}`}>{p.title}</Link></td>
              <td>{p.views}</td>
              <td>{p.feedback_count}</td>
              <td>★ {p.avg_rating.toFixed(1)}</td>
              <td>{p.hidden ? 'Bị ẩn' : 'Đang hiện'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.products.length === 0 && <p className="muted">Bạn chưa đăng sản phẩm nào.</p>}
    </>
  )
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="muted small">{label}</div>
    </div>
  )
}
