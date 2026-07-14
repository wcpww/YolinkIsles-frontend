import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/User';

type AuthState = {
  userId: string | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  currentUserData: User | null;
  setAuth: (payload: { userId: string; accessToken: string }) => void;
  setAccessToken: (accessToken: string | null) => void;
  setCurrentUserData: (userData: User | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      isLoggedIn: false,
      currentUserData: null,
      setAuth: ({ userId, accessToken }) => set({ userId, accessToken, isLoggedIn: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setCurrentUserData: (userData) => set({ currentUserData: userData }),
      clearAuth: () =>
        set({
          userId: null,
          accessToken: null,
          isLoggedIn: false,
          currentUserData: null,
        }),
    }),
    {
      name: 'yolink-auth',
      partialize: (state) => ({
        userId: state.userId,
        accessToken: state.accessToken,
        isLoggedIn: state.isLoggedIn,
        currentUserData: state.currentUserData,
      }),
    },
  ),
);
