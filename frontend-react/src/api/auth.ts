import { api, handleApiError, API_BASE_URL } from './client';
import type { LoginResponse, Player } from '@/types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/api/v1/auth/login/', { email, password });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  register: async (
    email: string, 
    username: string, 
    password1: string, 
    password2: string
  ): Promise<void> => {
    try {
      await api.post('/api/v1/auth/register/', {
        email,
        username,
        password1,
        password2,
      });
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  logout: async (): Promise<void> => {
    await api.post('/api/v1/auth/logout/');
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const response = await api.post('/api/v1/auth/refresh/');
    return response.data;
  },

  verifyToken: async (token: string): Promise<void> => {
    await api.post('/api/v1/auth/verify/', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/v1/auth/password-reset/', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/api/v1/auth/password-reset-confirm/', { token, password });
  },

  verify2FA: async (code: string): Promise<LoginResponse> => {
    const response = await api.post('/api/v1/auth/2fa/verify/', { code });
    return response.data;
  },

  enable2FA: async (): Promise<{ qr_code: string; secret: string }> => {
    const response = await api.post('/api/v1/auth/2fa/enable/');
    return response.data;
  },

  disable2FA: async (code: string): Promise<void> => {
    await api.post('/api/v1/auth/2fa/disable/', { code });
  },

  getCurrentPlayer: async (): Promise<Player> => {
    const response = await api.get('/api/v1/players/me/');
    return response.data;
  },

  updateUser: async (data: FormData): Promise<void> => {
    await api.patch('/api/v1/auth/update-user/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // OAuth URLs
  getGoogleAuthUrl: () => `${API_BASE_URL}/api/v1/auth/google/redirect/`,
  getIntraAuthUrl: () => `${API_BASE_URL}/api/v1/auth/intra/redirect/`,
};
