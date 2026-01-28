import { useEffect, useState } from 'react';
import { Trophy, Users, Calendar, Plus } from 'lucide-react';
import { tournamentApi } from '@/api/game';
import { Card, Button, Badge, Spinner, Avatar } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import type { Tournament } from '@/types';
import toast from 'react-hot-toast';

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await tournamentApi.getTournaments();
        setTournaments(data);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const handleJoinTournament = async (tournamentId: number) => {
    try {
      await tournamentApi.joinTournament(tournamentId);
      toast.success('Joined tournament!');
      // Refresh tournaments
      const data = await tournamentApi.getTournaments();
      setTournaments(data);
    } catch {
      toast.error('Failed to join tournament');
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tournaments</h1>
        <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Tournament
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : tournaments.length === 0 ? (
        <Card className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Tournaments</h2>
          <p className="text-gray-500 mb-6">Be the first to create a tournament!</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Tournament
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onJoin={() => handleJoinTournament(tournament.id)}
            />
          ))}
        </div>
      )}

      {/* Create Tournament Modal - simplified for now */}
      {showCreateModal && (
        <CreateTournamentModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

interface TournamentCardProps {
  tournament: Tournament;
  onJoin: () => void;
}

function TournamentCard({ tournament, onJoin }: TournamentCardProps) {
  const isFull = tournament.current_players >= tournament.max_players;
  const canJoin = tournament.status === 'upcoming' && !isFull;

  return (
    <Card hoverable className="flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
          <Badge variant={tournament.game_type === 'pong' ? 'primary' : 'secondary'} size="sm">
            {tournament.game_type}
          </Badge>
        </div>
        <Badge 
          variant={
            tournament.status === 'upcoming' ? 'primary' :
            tournament.status === 'in_progress' ? 'warning' : 'success'
          }
        >
          {tournament.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{tournament.current_players}/{tournament.max_players} players</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(tournament.start_date), { addSuffix: true })}</span>
        </div>

        {/* Participants Preview */}
        <div className="flex -space-x-2">
          {tournament.participants.slice(0, 5).map((participant) => (
            <Avatar
              key={participant.id}
              src={participant.user.avatar}
              size="sm"
              className="border-2 border-dark-50"
            />
          ))}
          {tournament.current_players > 5 && (
            <div className="w-8 h-8 rounded-full bg-dark-100 border-2 border-dark-50 
                           flex items-center justify-center text-xs text-gray-400">
              +{tournament.current_players - 5}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dark-200">
        {canJoin ? (
          <Button onClick={onJoin} className="w-full">
            Join Tournament
          </Button>
        ) : (
          <Button disabled className="w-full" variant="secondary">
            {isFull ? 'Full' : 'Started'}
          </Button>
        )}
      </div>
    </Card>
  );
}

interface CreateTournamentModalProps {
  onClose: () => void;
}

function CreateTournamentModal({ onClose }: CreateTournamentModalProps) {
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState<'pong' | 'othello'>('pong');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await tournamentApi.createTournament(name, gameType, maxPlayers);
      toast.success('Tournament created!');
      onClose();
    } catch {
      toast.error('Failed to create tournament');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-6">Create Tournament</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Tournament Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter tournament name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Game Type</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value as 'pong' | 'othello')}
              className="input-field"
            >
              <option value="pong">Pong</option>
              <option value="othello">Othello</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Players</label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="input-field"
            >
              <option value={4}>4 Players</option>
              <option value={8}>8 Players</option>
              <option value={16}>16 Players</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
