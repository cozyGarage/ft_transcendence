import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

export function useNotificationWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { addNotification } = useNotificationStore();
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications/?token=${accessToken}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Notification WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        const notification = data.notification as Notification;
        addNotification(notification);

        // Show toast notification
        switch (notification.type) {
          case 'friend_request':
            toast.success(`${notification.sender?.username} sent you a friend request`);
            break;
          case 'game_invite':
            toast.success(`${notification.sender?.username} invited you to a game`);
            break;
          case 'message':
            toast(`New message from ${notification.sender?.username}`);
            break;
          default:
            toast(notification.message);
        }
      }
    };

    wsRef.current.onclose = () => {
      console.log('Notification WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [isAuthenticated, accessToken, addNotification]);
}
