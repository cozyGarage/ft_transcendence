import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';

export function useGameWebSocket(gameType: 'pong' | 'othello', gameId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const { accessToken } = useAuthStore();
  const { endGame } = useGameStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!gameId || !accessToken) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/game/${gameType}/${gameId}/?token=${accessToken}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log(`${gameType} WebSocket connected`);
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'game_state':
          console.log('Game state:', data.state);
          break;
        case 'game_over':
          console.log('Game over, winner:', data.winner);
          endGame();
          break;
        case 'player_joined':
          console.log('Player joined:', data.player);
          break;
        case 'player_left':
          console.log('Player left:', data.player);
          break;
      }
    };

    wsRef.current.onclose = () => {
      console.log(`${gameType} WebSocket disconnected`);
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error(`${gameType} WebSocket error:`, error);
    };

    return () => {
      wsRef.current?.close();
    };
  }, [gameId, gameType, accessToken, endGame]);

  const sendMove = useCallback((move: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'move',
        ...move,
      }));
    }
  }, []);

  const sendPaddleMove = useCallback((direction: 'up' | 'down') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'paddle_move',
        direction,
      }));
    }
  }, []);

  return { isConnected, sendMove, sendPaddleMove };
}
