import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, post, type Product, type User } from '../api'
import { Stat } from './Dashboard'

type Stats = { users: number; products: number; feedbacks: number; open_reports: number }
type Report = {
  id: number
  reporter_name: string
  product_id: number | null
  product_title: string | null
  feedback_id: number | null
  reason: string
  status: string
}

export default function Admin() {
  const [tab, setTab] = useState<'reports' | 'products' | 'users'>('reports')
  const [stats, setStats] = useState<Stats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])

  function load() {
    api<Stats>('/admin/stats').then(setStats)
    api<Report[]>('/admin/reports').then(setReports)
    api<Product[]>('/admin/products').then(setProducts)
    api<User[]>('/admin/users').then(setUsers)
  }
  useEffect(load, [])

  async function action(path: string) {
    await post(path, {})
    load()
  }

  return (
    <>
      <h1>Trang admin</h1>
      {stats && (
        <div className="stats">
          <Stat label="Người dùng" value={stats.users} />
          <Stat label="Sản phẩm" value={stats.products} />
          <Stat label="Góp ý" value={stats.feedbacks} />
          <Stat label="Báo cáo chờ xử lý" value={stats.open_reports} />
        </div>
      )}

      <div className="tags">
        <button className={tab === 'reports' ? 'tag active' : 'tag'} onClick={() => setTab('reports')}>Báo cáo</button>
        <button className={tab === 'products' ? 'tag active' : 'tag'} onClick={() => setTab('products')}>Sản phẩm</button>
        <button className={tab === 'users' ? 'tag active' : 'tag'} onClick={() => setTab('users')}>Người dùng</button>
      </div>

      {tab === 'reports' && (
        <table>
          <thead><tr><th>Người báo cáo</th><th>Đối tượng</th><th>Lý do</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.reporter_name}</td>
                <td>
                  {r.product_id ? <Link to={`/products/${r.product_id}`}>{r.product_title}</Link> : `Góp ý #${r.feedback_id}`}
                </td>
                <td>{r.reason}</td>
                <td>{r.status === 'open' ? 'Chờ xử lý' : 'Đã xử lý'}</td>
                <td>
                  {r.product_id && <button className="btn-ghost small" onClick={() => action(`/admin/products/${r.product_id}/hide`)}>Ẩn SP</button>}
                  {r.status === 'open' && <button className="btn-ghost small" onClick={() => action(`/admin/reports/${r.id}/resolve`)}>Đánh dấu xong</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'products' && (
        <table>
          <thead><tr><th>Sản phẩm</th><th>Tác giả</th><th>Lượt xem</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.hidden ? p.title : <Link to={`/products/${p.id}`}>{p.title}</Link>}</td>
                <td>{p.author_name}</td>
                <td>{p.views}</td>
                <td>{p.hidden ? 'Bị ẩn' : 'Đang hiện'}</td>
                <td>
                  <button className="btn-ghost small" onClick={() => action(`/admin/products/${p.id}/${p.hidden ? 'unhide' : 'hide'}`)}>
                    {p.hidden ? 'Hiện lại' : 'Ẩn'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'users' && (
        <table>
          <thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th></tr></thead>
          <tbody>
            {users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>)}
          </tbody>
        </table>
      )}
    </>
  )
}
