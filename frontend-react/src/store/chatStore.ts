import { create } from 'zustand';
import type { ChatRoom, Message } from '@/types';

interface ChatState {
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  messages: Message[];
  websocket: WebSocket | null;
  isConnected: boolean;
  
  // Actions
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (room: ChatRoom | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  connectToRoom: (roomId: number) => void;
  disconnectFromRoom: () => void;
  sendMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  messages: [],
  websocket: null,
  isConnected: false,

  setRooms: (rooms) => set({ rooms }),

  setActiveRoom: (room) => {
    const { disconnectFromRoom, connectToRoom } = get();
    disconnectFromRoom();
    set({ activeRoom: room, messages: [] });
    if (room) {
      connectToRoom(room.id);
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setMessages: (messages) => set({ messages }),

  connectToRoom: (roomId) => {
    const wsUrl = `wss://127.0.0.1:8000/ws/chat/${roomId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
      set({ isConnected: true });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          get().addMessage(data.message);
        }
      } catch (error) {
        console.error('Error parsing chat message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected');
      set({ isConnected: false });
    };

    ws.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };

    set({ websocket: ws });
  },

  disconnectFromRoom: () => {
    const { websocket } = get();
    if (websocket) {
      websocket.close();
      set({ websocket: null, isConnected: false });
    }
  },

  sendMessage: (content) => {
    const { websocket, isConnected } = get();
    if (websocket && isConnected) {
      websocket.send(JSON.stringify({ message: content }));
    }
  },
}));
