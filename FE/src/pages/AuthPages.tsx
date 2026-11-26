import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { post, type User } from '../api'
import { useAuth } from '../auth'

type AuthResponse = { token: string; user: User }

export function Login() {
  return <AuthForm mode="login" />
}

export function Register() {
  return <AuthForm mode="register" />
}

function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { saveLogin } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const isRegister = mode === 'register'

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const body = isRegister ? { name, email, password } : { email, password }
      const res = await post<AuthResponse>(`/auth/${mode}`, body)
      saveLogin(res.token, res.user)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="box auth" onSubmit={submit}>
      <h1>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
      {isRegister && <input required placeholder="Tên hiển thị" value={name} onChange={(e) => setName(e.target.value)} />}
      <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" minLength={6} placeholder="Mật khẩu (ít nhất 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button className="btn">{isRegister ? 'Đăng ký' : 'Đăng nhập'}</button>
      <p className="muted small">
        {isRegister ? <>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></> : <>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></>}
      </p>
    </form>
  )
}
