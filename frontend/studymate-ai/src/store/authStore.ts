import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isOnboarded: boolean
  setUser: (user: User | null) => void
  login: (user: User) => void
  logout: () => void
  setOnboarded: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, isOnboarded: false }),
      setOnboarded: (v) => set({ isOnboarded: v }),
    }),
    { name: 'studymate-auth' }
  )
)
