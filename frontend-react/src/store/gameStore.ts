import { create } from 'zustand';

export type GameType = 'pong' | 'othello';
export type GameMode = 'single' | 'local' | 'online' | 'tournament';

interface GameState {
  gameType: GameType | null;
  gameMode: GameMode | null;
  isInGame: boolean;
  isInLobby: boolean;
  websocket: WebSocket | null;
  opponent: { id: number; username: string; avatar: string } | null;
  score: { player: number; opponent: number };
  
  // Actions
  setGameType: (type: GameType) => void;
  setGameMode: (mode: GameMode) => void;
  startGame: () => void;
  endGame: () => void;
  joinLobby: (gameType: GameType) => void;
  leaveLobby: () => void;
  setOpponent: (opponent: { id: number; username: string; avatar: string } | null) => void;
  updateScore: (playerScore: number, opponentScore: number) => void;
  resetGame: () => void;
  connectToGame: (gameId: string) => void;
  disconnectFromGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gameType: null,
  gameMode: null,
  isInGame: false,
  isInLobby: false,
  websocket: null,
  opponent: null,
  score: { player: 0, opponent: 0 },

  setGameType: (type: GameType) => set({ gameType: type }),
  
  setGameMode: (mode: GameMode) => set({ gameMode: mode }),

  startGame: () => set({ isInGame: true, isInLobby: false }),

  endGame: () => set({ isInGame: false }),

  joinLobby: (gameType: GameType) => {
    set({ isInLobby: true, gameType });
  },

  leaveLobby: () => {
    set({ isInLobby: false });
    get().disconnectFromGame();
  },

  setOpponent: (opponent: { id: number; username: string; avatar: string } | null) => set({ opponent }),

  updateScore: (playerScore: number, opponentScore: number) => {
    set({ score: { player: playerScore, opponent: opponentScore } });
  },

  resetGame: () => {
    get().disconnectFromGame();
    set({
      gameType: null,
      gameMode: null,
      isInGame: false,
      isInLobby: false,
      opponent: null,
      score: { player: 0, opponent: 0 },
    });
  },

  connectToGame: (gameId: string) => {
    const { gameType } = get();
    const wsPath = gameType === 'othello' ? 'othello' : 'pong';
    const wsUrl = `wss://127.0.0.1:8000/ws/game/${wsPath}/${gameId}/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Game WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle game state updates
        if (data.type === 'game_state') {
          // Update game state based on message
        }
      } catch (error) {
        console.error('Error parsing game message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Game WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('Game WebSocket error:', error);
    };

    set({ websocket: ws });
  },

  disconnectFromGame: () => {
    const { websocket } = get();
    if (websocket) {
      websocket.close();
      set({ websocket: null });
    }
  },
}));
