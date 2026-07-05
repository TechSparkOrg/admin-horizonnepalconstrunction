import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie, deleteCookie } from "cookies-next";
import { AuthService } from "@/api/services/auth.service";
import type { LoginFormData, AuthUser } from "@/api/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const COOKIE_AGE = 60 * 60 * 24 * 7;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      checkAuth: async () => {
        try {
          const user = await AuthService.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (data) => {
        const res = await AuthService.login(data);
        setCookie("access_token", res.access, { maxAge: COOKIE_AGE, path: "/" });
        setCookie("refresh_token", res.refresh, { maxAge: COOKIE_AGE, path: "/" });
        set({ user: res.user, isAuthenticated: true });
        return res.user;
      },

      logout: async () => {
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        set({ user: null, isAuthenticated: false });
        window.location.href = "/login";
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
