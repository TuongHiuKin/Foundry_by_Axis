import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, type User } from './api'

type AuthState = {
  user: User | null
  loading: boolean
  saveLogin: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthState>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mở web lên: nếu còn token thì hỏi server xem đó là ai.
  useEffect(() => {
    if (!getToken()) return setLoading(false)
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

export const useAuth = () => useContext(AuthContext)
