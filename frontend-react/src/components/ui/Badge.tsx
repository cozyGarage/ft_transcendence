import { clsx } from 'clsx';
import type { League } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'league';
  league?: League;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  league,
  size = 'md',
  className,
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-dark-100 text-gray-300',
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    league: '',
  };

  const leagueClasses: Record<League, string> = {
    bronze: 'bg-league-bronze/20 text-league-bronze',
    silver: 'bg-league-silver/20 text-league-silver',
    gold: 'bg-league-gold/20 text-league-gold',
    platinum: 'bg-league-platinum/20 text-league-platinum',
    diamond: 'bg-league-diamond/20 text-league-diamond',
    master: 'bg-league-master/20 text-league-master',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        variant === 'league' && league ? leagueClasses[league] : variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
