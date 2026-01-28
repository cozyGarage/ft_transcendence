import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Trophy, TrendingUp } from 'lucide-react';
import { playerApi } from '@/api/player';
import { useAuthStore } from '@/store/authStore';
import { Card, HexagonAvatar, Badge, Spinner } from '@/components/ui';
import MatchHistory from '@/components/home/MatchHistory';
import type { Player } from '@/types';

export default function HomePage() {
  const navigate = useNavigate();
  const { player } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await playerApi.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handlePlayClick = () => {
    navigate('/game');
  };

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Play & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Play Now Card */}
          <Card
            hoverable
            onClick={handlePlayClick}
            className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Play?</h2>
                <p className="text-gray-400">Challenge your friends or find a match online</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center">
                <Gamepad2 className="w-10 h-10 text-primary" />
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{player?.stats?.wins || 0}</p>
              <p className="text-sm text-gray-500">Wins</p>
            </Card>
            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">#{player?.stats?.rank || '-'}</p>
              <p className="text-sm text-gray-500">Rank</p>
            </Card>
            <Card className="text-center">
              <Badge variant="league" league={player?.stats?.league} className="mx-auto mb-2">
                {player?.stats?.league || 'Bronze'}
              </Badge>
              <p className="text-2xl font-bold text-white">{player?.stats?.xp || 0}</p>
              <p className="text-sm text-gray-500">XP</p>
            </Card>
          </div>

          {/* Match History */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Recent Matches</h3>
            <MatchHistory username="me" limit={5} />
          </Card>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold text-white mb-6">Leaderboard</h3>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Top 3 */}
                {leaderboard.length >= 3 && (
                  <div className="flex justify-center items-end gap-4 mb-8">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <HexagonAvatar
                        src={leaderboard[1]?.user?.avatar}
                        size="md"
                        league={leaderboard[1]?.stats?.league}
                        onClick={() => handleProfileClick(leaderboard[1]?.user?.username)}
                      />
                      <p className="text-sm font-medium text-white mt-2 truncate max-w-20">
                        {leaderboard[1]?.user?.username}
                      </p>
                      <Badge variant="league" league={leaderboard[1]?.stats?.league} size="sm">
                        #2
                      </Badge>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center -mb-4">
                      <HexagonAvatar
                        src={leaderboard[0]?.user?.avatar}
                        size="lg"
                        league={leaderboard[0]?.stats?.league}
                        onClick={() => handleProfileClick(leaderboard[0]?.user?.username)}
                      />
                      <p className="text-sm font-medium text-white mt-2 truncate max-w-24">
                        {leaderboard[0]?.user?.username}
                      </p>
                      <Badge variant="league" league={leaderboard[0]?.stats?.league} size="sm">
                        #1
                      </Badge>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <HexagonAvatar
                        src={leaderboard[2]?.user?.avatar}
                        size="sm"
                        league={leaderboard[2]?.stats?.league}
                        onClick={() => handleProfileClick(leaderboard[2]?.user?.username)}
                      />
                      <p className="text-sm font-medium text-white mt-2 truncate max-w-16">
                        {leaderboard[2]?.user?.username}
                      </p>
                      <Badge variant="league" league={leaderboard[2]?.stats?.league} size="sm">
                        #3
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Rest of leaderboard */}
                <ul className="space-y-3">
                  {leaderboard.slice(3, 10).map((p, index) => (
                    <li
                      key={p.id}
                      onClick={() => handleProfileClick(p.user.username)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-100 
                                 cursor-pointer transition-colors"
                    >
                      <span className="text-gray-500 font-bold w-6">#{index + 4}</span>
                      <HexagonAvatar
                        src={p.user.avatar}
                        size="sm"
                        league={p.stats.league}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{p.user.username}</p>
                        <p className="text-xs text-gray-500">{p.stats.xp} XP</p>
                      </div>
                      <Badge variant="league" league={p.stats.league} size="sm">
                        {p.stats.league}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
