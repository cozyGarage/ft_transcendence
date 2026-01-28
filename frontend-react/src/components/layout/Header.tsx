import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, Search as SearchIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Avatar } from '@/components/ui';
import SearchBar from './SearchBar';

interface HeaderProps {
  onToggleNotifications?: () => void;
  onToggleFriends?: () => void;
}

export default function Header({ onToggleNotifications, onToggleFriends }: HeaderProps) {
  const navigate = useNavigate();
  const { player } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-20 bg-dark-50 border-b border-dark-200 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        {showSearch ? (
          <SearchBar onClose={() => setShowSearch(false)} />
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-3 px-4 py-2 bg-dark-100 border border-dark-200 
                       rounded-lg text-gray-500 hover:border-primary transition-colors w-full max-w-md"
          >
            <SearchIcon className="w-5 h-5" />
            <span>Search players...</span>
          </button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Friends Button */}
        <button
          onClick={onToggleFriends}
          className="relative p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <Users className="w-6 h-6 text-gray-400 hover:text-white" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-400 hover:text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                           flex items-center justify-center text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <Avatar
            src={player?.user?.avatar}
            alt={player?.user?.username}
            size="sm"
            league={player?.stats?.league}
          />
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white">{player?.user?.username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{player?.stats?.league || 'Bronze'}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
