import { api } from './client';
import type { ChatRoom, Message, PaginatedResponse } from '@/types';

export const chatApi = {
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await api.get('/chat/rooms/');
    return response.data;
  },

  getRoom: async (roomId: number): Promise<ChatRoom> => {
    const response = await api.get(`/chat/rooms/${roomId}/`);
    return response.data;
  },

  createRoom: async (participantIds: number[]): Promise<ChatRoom> => {
    const response = await api.post('/chat/rooms/', { participants: participantIds });
    return response.data;
  },

  getMessages: async (
    roomId: number,
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResponse<Message>> => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  sendMessage: async (roomId: number, content: string): Promise<Message> => {
    const response = await api.post(`/chat/rooms/${roomId}/messages/`, { content });
    return response.data;
  },

  getOrCreateDirectRoom: async (userId: number): Promise<ChatRoom> => {
    const response = await api.post('/chat/rooms/direct/', { user_id: userId });
    return response.data;
  },
};
