import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth';
import type { User, Player } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  player: Player | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setPlayer: (player: Player) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; is2FAEnabled?: boolean; error?: string }>;
  register: (email: string, username: string, password1: string, password2: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  verifyToken: () => Promise<boolean>;
  fetchCurrentPlayer: () => Promise<void>;
  updateProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      player: null,
      isAuthenticated: false,
      isLoading: false,

      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({ user });
      },

      setPlayer: (player) => {
        set({ player, user: player.user });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password);
          
          if (response.is_2fa_enabled) {
            set({ isLoading: false });
            return { success: false, is2FAEnabled: true };
          }
          
          set({
            accessToken: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user data after login
          await get().fetchCurrentPlayer();
          
          return { success: true };
        } catch (error: unknown) {
          set({ isLoading: false });
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          return { success: false, error: errorMessage };
        }
      },

      register: async (email, username, password1, password2) => {
        set({ isLoading: true });
        try {
          await authApi.register(email, username, password1, password2);
          set({ isLoading: false });
          return { success: true };
        } catch (error: unknown) {
          set({ isLoading: false });
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors
        }
        set({
          accessToken: null,
          user: null,
          player: null,
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          set({ accessToken: response.access_token, isAuthenticated: true });
          return true;
        } catch {
          set({ accessToken: null, isAuthenticated: false });
          return false;
        }
      },

      verifyToken: async () => {
        const { accessToken } = get();
        if (!accessToken) return false;
        
        try {
          await authApi.verifyToken(accessToken);
          return true;
        } catch {
          // Try to refresh
          return await get().refreshToken();
        }
      },

      fetchCurrentPlayer: async () => {
        try {
          const player = await authApi.getCurrentPlayer();
          set({ player, user: player.user });
        } catch (error) {
          console.error('Failed to fetch current player:', error);
        }
      },

      updateProfile: async () => {
        await get().fetchCurrentPlayer();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
