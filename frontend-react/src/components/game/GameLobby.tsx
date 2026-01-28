import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, Spinner, Button, Avatar } from '@/components/ui';
import { Search, X } from 'lucide-react';

export default function GameLobby() {
  const { gameType, leaveLobby, startGame, setOpponent } = useGameStore();
  const [searchTime, setSearchTime] = useState(0);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    // Simulate finding a match after some time (demo purposes)
    const matchTimeout = setTimeout(() => {
      setMatchFound(true);
      setOpponent({
        id: 1,
        username: 'Player2',
        avatar: '/images/default-avatar.png',
      });
      
      // Auto-start after showing match found
      setTimeout(() => {
        startGame();
      }, 2000);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimeout);
    };
  }, [setOpponent, startGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="text-center">
        {matchFound ? (
          <>
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Match Found!</h2>
            <p className="text-gray-400 mb-6">Starting game...</p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <Avatar size="lg" />
                <p className="text-white font-medium mt-2">You</p>
              </div>
              <span className="text-2xl font-bold text-primary">VS</span>
              <div className="text-center">
                <Avatar size="lg" />
                <p className="text-white font-medium mt-2">Player2</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-20 h-20 mx-auto mb-4">
              <Spinner size="lg" className="absolute inset-0 m-auto" />
              <Search className="w-8 h-8 text-primary absolute inset-0 m-auto" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Finding {gameType === 'pong' ? 'Pong' : 'Othello'} Match
            </h2>
            <p className="text-gray-400 mb-2">Searching for opponent...</p>
            <p className="text-primary font-mono text-lg mb-6">{formatTime(searchTime)}</p>

            <Button
              variant="secondary"
              onClick={leaveLobby}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel Search
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
