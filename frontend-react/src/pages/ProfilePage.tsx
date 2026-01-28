import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Trophy, 
  Target, 
  Percent, 
  Gamepad2, 
  UserPlus, 
  MessageCircle,
  Ban
} from 'lucide-react';
import { playerApi, friendApi } from '@/api/player';
import { useAuthStore } from '@/store/authStore';
import { Card, HexagonAvatar, Badge, Button, Spinner } from '@/components/ui';
import MatchHistory from '@/components/home/MatchHistory';
import type { Player } from '@/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { player: currentPlayer } = useAuthStore();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  const isOwnProfile = !username || username === currentPlayer?.user?.username;

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        if (isOwnProfile && currentPlayer) {
          setPlayer(currentPlayer);
        } else if (username) {
          const data = await playerApi.getPlayer(username);
          setPlayer(data);
        }
      } catch (error) {
        console.error('Failed to fetch player:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
  }, [username, currentPlayer, isOwnProfile]);

  const handleAddFriend = async () => {
    if (!player) return;
    try {
      await friendApi.sendFriendRequest(player.user.id);
      toast.success('Friend request sent!');
    } catch {
      toast.error('Failed to send friend request');
    }
  };

  const handleMessage = () => {
    // Navigate to chat with this user
    toast.success('Opening chat...');
  };

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container text-center">
        <h1 className="text-2xl font-bold text-white">Player not found</h1>
      </div>
    );
  }

  const stats = player.stats;
  const winRate = stats.total_games > 0 
    ? Math.round((stats.wins / stats.total_games) * 100) 
    : 0;

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <HexagonAvatar
              src={player.user.avatar}
              size="xl"
              league={stats.league}
              className="mx-auto"
            />
            <h1 className="text-2xl font-bold text-white mt-4">{player.user.username}</h1>
            <Badge variant="league" league={stats.league} className="mt-2">
              {stats.league} League
            </Badge>
            <p className="text-gray-500 mt-2">Rank #{stats.rank}</p>

            {/* Action Buttons (for other profiles) */}
            {!isOwnProfile && (
              <div className="flex gap-3 mt-6 justify-center">
                {!isFriend && (
                  <Button onClick={handleAddFriend} leftIcon={<UserPlus className="w-4 h-4" />}>
                    Add Friend
                  </Button>
                )}
                <Button variant="secondary" onClick={handleMessage} leftIcon={<MessageCircle className="w-4 h-4" />}>
                  Message
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Stats & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.wins}</p>
              <p className="text-sm text-gray-500">Wins</p>
            </Card>
            <Card className="text-center">
              <Target className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.losses}</p>
              <p className="text-sm text-gray-500">Losses</p>
            </Card>
            <Card className="text-center">
              <Percent className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{winRate}%</p>
              <p className="text-sm text-gray-500">Win Rate</p>
            </Card>
            <Card className="text-center">
              <Gamepad2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total_games}</p>
              <p className="text-sm text-gray-500">Total Games</p>
            </Card>
          </div>

          {/* XP Progress */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Experience Points</span>
              <span className="text-primary font-bold">{stats.xp} XP</span>
            </div>
            <div className="w-full h-3 bg-dark-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.xp % 1000) / 10, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {1000 - (stats.xp % 1000)} XP until next level
            </p>
          </Card>

          {/* Match History */}
          <Card>
            <h3 className="text-xl font-bold text-white mb-4">Match History</h3>
            <MatchHistory username={player.user.username} limit={10} />
          </Card>
        </div>
      </div>
    </div>
  );
}
