import { useState } from 'react';
import { X, Bell, Users, Check, UserPlus } from 'lucide-react';
import { clsx } from 'clsx';
import { useNotificationStore } from '@/store/notificationStore';
import { Avatar, Button } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/types';

type Tab = 'notifications' | 'friends';

export default function RightSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-dark-50 border-l border-dark-200 z-50
                      shadow-lg animate-slide-in">
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-dark-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              activeTab === 'notifications'
                ? 'bg-primary/20 text-primary'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              activeTab === 'friends'
                ? 'bg-primary/20 text-primary'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Friends</span>
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 rounded-lg hover:bg-dark-100 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notifications' ? (
          <NotificationsList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        ) : (
          <FriendRequestsList />
        )}
      </div>
    </aside>
  );
}

// Notifications List Component
interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

function NotificationsList({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationsListProps) {
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <div className="p-4">
      {unreadNotifications.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary hover:text-primary-400 transition-colors"
          >
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={clsx(
                'p-3 rounded-lg cursor-pointer transition-colors',
                notification.is_read ? 'bg-dark-100' : 'bg-primary/10 border border-primary/30'
              )}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {notification.sender && (
                  <Avatar src={notification.sender.avatar} size="sm" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Friend Requests List Component
function FriendRequestsList() {
  // This would be connected to a friend requests store/API
  const requests: { id: number; sender: { username: string; avatar: string } }[] = [];

  return (
    <div className="p-4">
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-500">No friend requests</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id} className="p-3 bg-dark-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar src={request.sender.avatar} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{request.sender.username}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
