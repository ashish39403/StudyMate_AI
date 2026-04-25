import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  login: (payload: { user: User; access: string; refresh: string }) => void;
  setUser: (user: User) => void;
  setTokens: (access: string, refresh?: string) => void;
  logout: () => void;
  setOnboarded: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasOnboarded: false,
      login: ({ user, access, refresh }) =>
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      setTokens: (access, refresh) =>
        set((state) => ({
          accessToken: access,
          refreshToken: refresh ?? state.refreshToken,
        })),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setOnboarded: (v) => set({ hasOnboarded: v }),
    }),
    {
      name: "studymate-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
        hasOnboarded: s.hasOnboarded,
      }),
    },
  ),
);
