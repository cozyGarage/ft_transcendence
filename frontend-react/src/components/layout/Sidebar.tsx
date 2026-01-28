import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Gamepad2, 
  MessageCircle, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/game', icon: Gamepad2, label: 'Game' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/tournament', icon: Trophy, label: 'Tournament' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-dark-50 border-r border-dark-200 z-40',
        'flex flex-col transition-all duration-300',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-dark-200">
        <Link to="/home" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10" />
          {isExpanded && (
            <span className="text-xl font-bold text-primary">ft_transcendence</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                  )}
                >
                  <Icon className={clsx('w-6 h-6', isActive && 'text-primary')} />
                  {isExpanded && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && isExpanded && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-dark-200">
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-4 w-full px-4 py-3 rounded-lg',
            'text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200'
          )}
        >
          <LogOut className="w-6 h-6" />
          {isExpanded && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full 
                   bg-dark-50 border border-dark-200 flex items-center justify-center
                   hover:bg-primary hover:text-dark hover:border-primary transition-colors"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
