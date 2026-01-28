import { useEffect, useState } from 'react';
import { Avatar, Badge, Spinner } from '@/components/ui';
import { playerApi } from '@/api/player';
import { formatDistanceToNow } from 'date-fns';
import type { GameMatch } from '@/types';

interface MatchHistoryProps {
  username: string;
  limit?: number;
}

export default function MatchHistory({ username, limit = 10 }: MatchHistoryProps) {
  const [matches, setMatches] = useState<GameMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await playerApi.getMatchHistory(username, 1, limit);
        setMatches(response.results);
      } catch (error) {
        console.error('Failed to fetch match history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [username, limit]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No matches played yet
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {matches.map((match) => (
        <li
          key={match.id}
          className="flex items-center gap-4 p-3 bg-dark-100 rounded-lg"
        >
          <Avatar src={match.opponent.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{match.opponent.username}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(match.played_at), { addSuffix: true })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">{match.score}</p>
            <p className="text-xs text-gray-500 capitalize">{match.game_type}</p>
          </div>
          <Badge
            variant={match.result === 'win' ? 'success' : match.result === 'loss' ? 'danger' : 'default'}
          >
            {match.result === 'win' ? '+' : ''}{match.xp_gained} XP
          </Badge>
        </li>
      ))}
    </ul>
  );
}
