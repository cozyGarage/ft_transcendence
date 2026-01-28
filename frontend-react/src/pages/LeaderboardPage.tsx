import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { playerApi } from '@/api/player';
import { Card, HexagonAvatar, Badge, Spinner } from '@/components/ui';
import type { Player } from '@/types';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await playerApi.getLeaderboard();
        setPlayers(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
      </div>

      {/* Top 3 Podium */}
      {players.length >= 3 && (
        <Card className="mb-8">
          <div className="flex justify-center items-end gap-8 py-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="bg-league-silver/20 rounded-t-lg px-4 pb-4 pt-8">
                <HexagonAvatar
                  src={players[1]?.user?.avatar}
                  size="lg"
                  league={players[1]?.stats?.league}
                  onClick={() => handleProfileClick(players[1]?.user?.username)}
                />
              </div>
              <div className="bg-league-silver text-dark px-6 py-2 rounded-b-lg">
                <p className="font-bold text-lg">2</p>
              </div>
              <p className="text-white font-medium mt-3">{players[1]?.user?.username}</p>
              <p className="text-sm text-gray-500">{players[1]?.stats?.xp} XP</p>
            </div>

            {/* 1st Place */}
            <div className="text-center -mb-4">
              <div className="bg-league-gold/20 rounded-t-lg px-4 pb-4 pt-8">
                <HexagonAvatar
                  src={players[0]?.user?.avatar}
                  size="xl"
                  league={players[0]?.stats?.league}
                  onClick={() => handleProfileClick(players[0]?.user?.username)}
                />
              </div>
              <div className="bg-league-gold text-dark px-8 py-3 rounded-b-lg">
                <Trophy className="w-6 h-6 mx-auto" />
              </div>
              <p className="text-white font-bold text-lg mt-3">{players[0]?.user?.username}</p>
              <p className="text-sm text-gray-500">{players[0]?.stats?.xp} XP</p>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="bg-league-bronze/20 rounded-t-lg px-4 pb-4 pt-8">
                <HexagonAvatar
                  src={players[2]?.user?.avatar}
                  size="md"
                  league={players[2]?.stats?.league}
                  onClick={() => handleProfileClick(players[2]?.user?.username)}
                />
              </div>
              <div className="bg-league-bronze text-dark px-6 py-2 rounded-b-lg">
                <p className="font-bold text-lg">3</p>
              </div>
              <p className="text-white font-medium mt-3">{players[2]?.user?.username}</p>
              <p className="text-sm text-gray-500">{players[2]?.stats?.xp} XP</p>
            </div>
          </div>
        </Card>
      )}

      {/* Rest of Leaderboard */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b border-dark-200">
                <th className="pb-3 px-4">Rank</th>
                <th className="pb-3 px-4">Player</th>
                <th className="pb-3 px-4">League</th>
                <th className="pb-3 px-4">Wins</th>
                <th className="pb-3 px-4">XP</th>
              </tr>
            </thead>
            <tbody>
              {players.slice(3).map((player, index) => (
                <tr
                  key={player.id}
                  onClick={() => handleProfileClick(player.user.username)}
                  className="border-b border-dark-200 hover:bg-dark-100 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4 text-gray-400 font-bold">#{index + 4}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <HexagonAvatar
                        src={player.user.avatar}
                        size="sm"
                        league={player.stats.league}
                      />
                      <span className="text-white font-medium">{player.user.username}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="league" league={player.stats.league}>
                      {player.stats.league}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-white">{player.stats.wins}</td>
                  <td className="py-4 px-4 text-primary font-bold">{player.stats.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
