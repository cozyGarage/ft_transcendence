import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  websocket: WebSocket | null;
  
  // Actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: Notification[]) => void;
  connectWebSocket: (userId: number) => void;
  disconnectWebSocket: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  websocket: null,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: Math.max(0, state.unreadCount - (
        state.notifications.find((n) => n.id === id && !n.is_read) ? 1 : 0
      )),
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - (
        state.notifications.find((n) => n.id === id && !n.is_read) ? 1 : 0
      )),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    });
  },

  connectWebSocket: (userId) => {
    const wsUrl = `wss://127.0.0.1:8000/ws/user/notification/${userId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.error) {
          get().addNotification(data);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };

    ws.onclose = () => {
      console.log('Notification WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };

    set({ websocket: ws });
  },

  disconnectWebSocket: () => {
    const { websocket } = get();
    if (websocket) {
      websocket.close();
      set({ websocket: null });
    }
  },
}));
