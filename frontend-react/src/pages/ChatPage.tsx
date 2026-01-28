import { useEffect, useState, useRef } from 'react';
import { Send, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { chatApi } from '@/api/chat';
import { Card, Avatar, Button, Spinner } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import type { ChatRoom, Message } from '@/types';

export default function ChatPage() {
  const { player } = useAuthStore();
  const { rooms, activeRoom, messages, setRooms, setActiveRoom, setMessages, sendMessage, isConnected } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await chatApi.getRooms();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [setRooms]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeRoom) return;
      try {
        const response = await chatApi.getMessages(activeRoom.id);
        setMessages(response.results);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [activeRoom, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && activeRoom) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setActiveRoom(room);
  };

  const getOtherParticipant = (room: ChatRoom) => {
    return room.participants.find(p => p.id !== player?.user?.id) || room.participants[0];
  };

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold text-white mb-6">Chat</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-dark-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-dark-200 rounded-lg 
                           text-sm text-white placeholder-gray-500 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No conversations yet
              </div>
            ) : (
              <ul>
                {rooms.map((room) => {
                  const otherUser = getOtherParticipant(room);
                  return (
                    <li
                      key={room.id}
                      onClick={() => handleSelectRoom(room)}
                      className={clsx(
                        'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                        'hover:bg-dark-100',
                        activeRoom?.id === room.id && 'bg-dark-100 border-l-2 border-primary'
                      )}
                    >
                      <Avatar src={otherUser.avatar} size="sm" isOnline={otherUser.is_online} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{otherUser.username}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {room.last_message?.content || 'No messages yet'}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center 
                                       text-xs font-bold text-dark">
                          {room.unread_count}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-dark-200 flex items-center gap-3">
                <Avatar 
                  src={getOtherParticipant(activeRoom).avatar} 
                  size="sm" 
                  isOnline={getOtherParticipant(activeRoom).is_online}
                />
                <div>
                  <p className="text-white font-medium">{getOtherParticipant(activeRoom).username}</p>
                  <p className="text-xs text-gray-500">
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender.id === player?.user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-dark-100 border border-dark-200 rounded-lg 
                               text-white placeholder-gray-500 outline-none focus:border-primary"
                  />
                  <Button type="submit" disabled={!messageInput.trim()}>
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={clsx('flex gap-2 max-w-[70%]', isOwn && 'flex-row-reverse')}>
        {!isOwn && <Avatar src={message.sender.avatar} size="sm" />}
        <div>
          <div
            className={clsx(
              'px-4 py-2 rounded-2xl',
              isOwn
                ? 'bg-primary text-dark rounded-br-sm'
                : 'bg-dark-100 text-white rounded-bl-sm'
            )}
          >
            <p>{message.content}</p>
          </div>
          <p className={clsx('text-xs text-gray-500 mt-1', isOwn && 'text-right')}>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}
