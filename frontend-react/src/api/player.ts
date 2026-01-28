import { api } from './client';
import type { Player, LeaderboardEntry, GameMatch, PaginatedResponse } from '@/types';

export const playerApi = {
  getPlayer: async (username: string): Promise<Player> => {
    const response = await api.get(`/api/v1/players/${username}/`);
    return response.data;
  },

  getLeaderboard: async (): Promise<Player[]> => {
    const response = await api.get('/api/v1/players/leaderboard/');
    return response.data;
  },

  getMatchHistory: async (
    username: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResponse<GameMatch>> => {
    const response = await api.get(`/api/v1/players/${username}/matches/`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  searchPlayers: async (query: string): Promise<Player[]> => {
    const response = await api.get('/api/v1/players/search/', {
      params: { q: query }
    });
    return response.data;
  },

  updateOnlineStatus: async (): Promise<void> => {
    await api.post('/api/v1/players/online/');
  },
};

export const friendApi = {
  getFriends: async (): Promise<Player[]> => {
    const response = await api.get('/api/v1/friend/list/');
    return response.data;
  },

  getFriendRequests: async (): Promise<{ id: number; sender: Player }[]> => {
    const response = await api.get('/api/v1/friend/requests/');
    return response.data;
  },

  sendFriendRequest: async (userId: number): Promise<void> => {
    await api.post('/api/v1/friend/request/', { user_id: userId });
  },

  acceptFriendRequest: async (requestId: number): Promise<void> => {
    await api.post(`/api/v1/friend/accept/${requestId}/`);
  },

  rejectFriendRequest: async (requestId: number): Promise<void> => {
    await api.post(`/api/v1/friend/reject/${requestId}/`);
  },

  removeFriend: async (friendId: number): Promise<void> => {
    await api.delete(`/api/v1/friend/remove/${friendId}/`);
  },

  blockUser: async (userId: number): Promise<void> => {
    await api.post('/api/v1/friend/block/', { user_id: userId });
  },

  unblockUser: async (userId: number): Promise<void> => {
    await api.post('/api/v1/friend/unblock/', { user_id: userId });
  },
};

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notification/list/');
    return response.data;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notification/read/${notificationId}/`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notification/read-all/');
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await api.delete(`/notification/${notificationId}/`);
  },
};
