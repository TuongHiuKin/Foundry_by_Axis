import { createContext, useContext } from 'react'
import type { User } from './api'

export type AuthState = {
  user: User | null
  loading: boolean
  saveLogin: (token: string, user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthState>(null!)

// Dùng trong mọi trang để biết ai đang đăng nhập.
export const useAuth = () => useContext(AuthContext)
