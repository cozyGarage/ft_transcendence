import { clsx } from 'clsx';
import { API_BASE_URL } from '@/api/client';
import type { League } from '@/types';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  league?: League;
  isOnline?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  league,
  isOnline,
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const leagueColors: Record<League, string> = {
    bronze: 'border-league-bronze',
    silver: 'border-league-silver',
    gold: 'border-league-gold',
    platinum: 'border-league-platinum',
    diamond: 'border-league-diamond',
    master: 'border-league-master',
  };

  const fullSrc = src?.startsWith('http') ? src : `${API_BASE_URL}${src}`;

  return (
    <div className={clsx('relative', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden border-2',
          sizeClasses[size],
          league ? leagueColors[league] : 'border-dark-200'
        )}
      >
        {src ? (
          <img
            src={fullSrc}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-dark-100 flex items-center justify-center text-gray-500">
            <svg
              className="w-1/2 h-1/2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      {isOnline !== undefined && (
        <div
          className={clsx(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark',
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          )}
        />
      )}
    </div>
  );
}
