import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import type { Message } from '@/types';

export function useChatWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { activeRoom, addMessage } = useChatStore();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!activeRoom || !accessToken) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${activeRoom.id}/?token=${accessToken}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Chat WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        addMessage(data.message as Message);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };

    wsRef.current.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [activeRoom, accessToken, addMessage]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content,
      }));
    }
  }, []);

  return { sendMessage };
}
