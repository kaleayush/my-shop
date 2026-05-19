'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  shopId: string
}

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
  isOwner: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        set({ user, token })
      },
      clearAuth: () => {
        localStorage.removeItem('token')
        document.cookie = 'token=; path=/; max-age=0'
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
      isOwner: () => get().user?.role === 'ShopOwner',
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
)
