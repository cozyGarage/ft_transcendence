// WebSocket Connection Utility with JWT Authentication
// Location: frontend-react/src/utils/websocket.ts

import { useAuthStore } from '@/store/authStore';

export interface WSConnectionOptions {
  url: string;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

export class AuthenticatedWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WSConnectionOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;

  constructor(options: WSConnectionOptions) {
    this.options = options;
    this.url = options.url;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.connect();
  }

  private connect() {
    const token = useAuthStore.getState().accessToken;
    
    if (!token) {
      console.error('No access token available for WebSocket connection');
      return;
    }

    // Append token to WebSocket URL
    const wsUrl = `${this.url}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = (event) => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.options.onOpen?.(event);
      };

      this.ws.onmessage = (event) => {
        this.options.onMessage?.(event);
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.options.onError?.(event);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Handle authentication failures (code 4001)
        if (event.code === 4001) {
          console.error('WebSocket authentication failed');
          // Optionally trigger token refresh or logout
        }
        
        this.options.onClose?.(event);

        // Auto-reconnect if enabled
        if (this.options.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket is not open. Message not sent:', data);
    }
  }

  close(code?: number, reason?: string) {
    this.ws?.close(code, reason);
  }

  get readyState() {
    return this.ws?.readyState;
  }
}

// Usage Example
export const createGameWebSocket = (roomName: string) => {
  return new AuthenticatedWebSocket({
    url: `wss://127.0.0.1:8000/ws/game/${roomName}/`,
    reconnect: true,
    maxReconnectAttempts: 5,
    onOpen: () => console.log('Game WebSocket connected'),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('Game message:', data);
    },
    onError: () => console.error('Game WebSocket error'),
    onClose: (event) => {
      if (event.code === 4001) {
        console.error('Not authenticated for game');
        // Redirect to login or refresh token
      }
    }
  });
};

export const createChatWebSocket = (roomName: string) => {
  return new AuthenticatedWebSocket({
    url: `wss://127.0.0.1:8000/ws/chat/${roomName}/`,
    reconnect: true,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('Chat message:', data);
    }
  });
};

export const createNotificationWebSocket = (userId: number) => {
  return new AuthenticatedWebSocket({
    url: `wss://127.0.0.1:8000/ws/notifications/${userId}/`,
    reconnect: true,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('Notification:', data);
    }
  });
};
