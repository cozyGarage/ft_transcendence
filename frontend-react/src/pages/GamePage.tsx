import { useState } from 'react';
import { Gamepad2, Circle, Users, Monitor, Globe, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, Button } from '@/components/ui';
import { useGameStore, type GameType, type GameMode } from '@/store/gameStore';
import PongGame from '@/components/game/PongGame';
import OthelloGame from '@/components/game/OthelloGame';
import GameLobby from '@/components/game/GameLobby';

export default function GamePage() {
  const { gameType, gameMode, isInGame, isInLobby, setGameType, setGameMode, startGame, resetGame } = useGameStore();
  const [selectedType, setSelectedType] = useState<GameType | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  // If in game, show the game component
  if (isInGame) {
    return (
      <div className="page-container">
        {gameType === 'pong' ? <PongGame /> : <OthelloGame />}
      </div>
    );
  }

  // If in lobby, show the lobby
  if (isInLobby) {
    return (
      <div className="page-container">
        <GameLobby />
      </div>
    );
  }

  const handleStartGame = () => {
    if (selectedType && selectedMode) {
      setGameType(selectedType);
      setGameMode(selectedMode);
      
      if (selectedMode === 'online') {
        // Join lobby for matchmaking
        useGameStore.getState().joinLobby(selectedType);
      } else {
        // Start game directly for local/single modes
        startGame();
      }
    }
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Select Game</h1>

      {/* Game Type Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-300 mb-4">Choose Game Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GameTypeCard
            type="pong"
            title="Pong"
            description="Classic paddle game. Be the first to score 11 points!"
            icon={<Gamepad2 className="w-12 h-12" />}
            isSelected={selectedType === 'pong'}
            onClick={() => setSelectedType('pong')}
          />
          <GameTypeCard
            type="othello"
            title="Othello"
            description="Strategic board game. Flip your opponent's pieces!"
            icon={<Circle className="w-12 h-12" />}
            isSelected={selectedType === 'othello'}
            onClick={() => setSelectedType('othello')}
          />
        </div>
      </div>

      {/* Game Mode Selection */}
      {selectedType && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Choose Game Mode</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GameModeCard
              mode="single"
              title="Single Player"
              description="Play against AI"
              icon={<Monitor className="w-8 h-8" />}
              isSelected={selectedMode === 'single'}
              onClick={() => setSelectedMode('single')}
            />
            <GameModeCard
              mode="local"
              title="Local Multiplayer"
              description="Play with a friend"
              icon={<Users className="w-8 h-8" />}
              isSelected={selectedMode === 'local'}
              onClick={() => setSelectedMode('local')}
            />
            <GameModeCard
              mode="online"
              title="Online Match"
              description="Play online"
              icon={<Globe className="w-8 h-8" />}
              isSelected={selectedMode === 'online'}
              onClick={() => setSelectedMode('online')}
            />
            <GameModeCard
              mode="tournament"
              title="Tournament"
              description="Compete for glory"
              icon={<Trophy className="w-8 h-8" />}
              isSelected={selectedMode === 'tournament'}
              onClick={() => setSelectedMode('tournament')}
            />
          </div>
        </div>
      )}

      {/* Start Button */}
      {selectedType && selectedMode && (
        <div className="text-center animate-fade-in">
          <Button
            size="lg"
            onClick={handleStartGame}
            className="px-12"
          >
            {selectedMode === 'online' ? 'Find Match' : 'Start Game'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface GameTypeCardProps {
  type: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function GameTypeCard({ title, description, icon, isSelected, onClick }: GameTypeCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={clsx(
        'cursor-pointer transition-all duration-300',
        isSelected && 'border-primary ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-center gap-4">
        <div className={clsx(
          'p-4 rounded-xl transition-colors',
          isSelected ? 'bg-primary/20 text-primary' : 'bg-dark-100 text-gray-400'
        )}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
    </Card>
  );
}

interface GameModeCardProps {
  mode: GameMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function GameModeCard({ title, description, icon, isSelected, onClick }: GameModeCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={clsx(
        'cursor-pointer text-center transition-all duration-300',
        isSelected && 'border-primary ring-2 ring-primary/30'
      )}
    >
      <div className={clsx(
        'w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center transition-colors',
        isSelected ? 'bg-primary/20 text-primary' : 'bg-dark-100 text-gray-400'
      )}>
        {icon}
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </Card>
  );
}
