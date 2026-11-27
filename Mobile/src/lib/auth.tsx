import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type User } from './api'
import { clearToken, getToken, setToken } from './token'

export type AuthState = {
  user: User | null
  loading: boolean
  saveLogin: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  saveLogin: async () => {},
  logout: async () => {},
})

// Dùng trong mọi màn hình để biết ai đang đăng nhập.
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Mở app: nếu còn token thì hỏi server xem token còn hợp lệ không.
  useEffect(() => {
    getToken()
      .then((token) => (token ? api<User>('/auth/me') : null))
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function saveLogin(token: string, u: User) {
    await setToken(token)
    setUser(u)
  }

  async function logout() {
    await clearToken()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, saveLogin, logout }}>{children}</AuthContext.Provider>
}
