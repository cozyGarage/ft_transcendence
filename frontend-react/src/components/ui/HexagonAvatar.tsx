import { clsx } from 'clsx';
import { API_BASE_URL } from '@/api/client';
import type { League } from '@/types';

interface HexagonAvatarProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  league?: League;
  className?: string;
  onClick?: () => void;
}

export default function HexagonAvatar({
  src,
  size = 'md',
  league,
  className,
  onClick,
}: HexagonAvatarProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  const leagueColors: Record<League, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    master: '#FF4500',
  };

  const borderColor = league ? leagueColors[league] : '#00FFFC';
  const fullSrc = src?.startsWith('http') ? src : `${API_BASE_URL}${src}`;

  return (
    <div
      className={clsx(
        'relative cursor-pointer transition-transform hover:scale-105',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        <defs>
          <clipPath id={`hexagon-clip-${size}`}>
            <polygon points="50,3 95,25 95,75 50,97 5,75 5,25" />
          </clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Border */}
        <polygon
          points="50,0 100,25 100,75 50,100 0,75 0,25"
          fill="none"
          stroke={borderColor}
          strokeWidth="3"
          filter="url(#glow)"
        />
        
        {/* Image */}
        {src ? (
          <image
            href={fullSrc}
            x="5"
            y="3"
            width="90"
            height="94"
            clipPath={`url(#hexagon-clip-${size})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <polygon
            points="50,3 95,25 95,75 50,97 5,75 5,25"
            fill="#1a1a1a"
          />
        )}
      </svg>
    </div>
  );
}
