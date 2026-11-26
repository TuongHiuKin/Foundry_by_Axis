import { useEffect, useState, type ReactNode } from 'react'
import { api, getToken, type User } from './api'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Chỉ cần "đang tải" khi có token để hỏi server.
  const [loading, setLoading] = useState(() => getToken() !== null)

  // Mở web lên: nếu còn token thì hỏi server xem đó là ai.
  useEffect(() => {
    if (!getToken()) return
    api<User>('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  function saveLogin(token: string, u: User) {
    localStorage.setItem('token', token)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
