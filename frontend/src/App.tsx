import { Link, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import { Login, Register } from './pages/AuthPages'
import ProductForm from './pages/ProductForm'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

export default function App() {
  const { user, logout } = useAuth()

  return (
    <>
      <header className="nav">
        <Link to="/" className="logo">Foundry</Link>
        <nav>
          <Link to="/">Khám phá</Link>
          {user && <Link to="/dashboard">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {user ? (
            <>
              <span className="muted">Chào, {user.name}</span>
              <button className="btn-ghost" onClick={logout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register" className="btn">Đăng ký</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/new" element={<NeedLogin><ProductForm /></NeedLogin>} />
          <Route path="/products/:id/edit" element={<NeedLogin><ProductForm /></NeedLogin>} />
          <Route path="/dashboard" element={<NeedLogin><Dashboard /></NeedLogin>} />
          <Route path="/admin" element={<NeedLogin admin><Admin /></NeedLogin>} />
          <Route path="*" element={<p>Không tìm thấy trang.</p>} />
        </Routes>
      </main>

      <footer className="footer muted">Foundry · Dự án EXE2</footer>
    </>
  )
}

// Chặn trang cần đăng nhập (hoặc cần quyền admin).
function NeedLogin({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth()
  if (loading) return <p>Đang tải...</p>
  if (!user) return <Navigate to="/login" />
  if (admin && user.role !== 'admin') return <p>Chỉ admin mới được vào trang này.</p>
  return children
}
