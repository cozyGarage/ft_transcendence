import { api } from './client';
import type { Game, Tournament, TournamentMatch, PaginatedResponse } from '@/types';

export const gameApi = {
  getGame: async (gameId: number): Promise<Game> => {
    const response = await api.get(`/game/${gameId}/`);
    return response.data;
  },

  createGame: async (gameType: 'pong' | 'othello', opponentId?: number): Promise<Game> => {
    const response = await api.post('/game/create/', { 
      game_type: gameType, 
      opponent_id: opponentId 
    });
    return response.data;
  },

  joinGame: async (gameId: number): Promise<Game> => {
    const response = await api.post(`/game/${gameId}/join/`);
    return response.data;
  },

  getRecentGames: async (page = 1): Promise<PaginatedResponse<Game>> => {
    const response = await api.get('/game/recent/', { params: { page } });
    return response.data;
  },
};

export const tournamentApi = {
  getTournaments: async (): Promise<Tournament[]> => {
    const response = await api.get('/tournament/');
    return response.data;
  },

  getTournament: async (tournamentId: number): Promise<Tournament> => {
    const response = await api.get(`/tournament/${tournamentId}/`);
    return response.data;
  },

  createTournament: async (
    name: string,
    gameType: 'pong' | 'othello',
    maxPlayers: number
  ): Promise<Tournament> => {
    const response = await api.post('/tournament/create/', {
      name,
      game_type: gameType,
      max_players: maxPlayers,
    });
    return response.data;
  },

  joinTournament: async (tournamentId: number): Promise<void> => {
    await api.post(`/tournament/${tournamentId}/join/`);
  },

  leaveTournament: async (tournamentId: number): Promise<void> => {
    await api.post(`/tournament/${tournamentId}/leave/`);
  },

  getTournamentMatches: async (tournamentId: number): Promise<TournamentMatch[]> => {
    const response = await api.get(`/tournament/${tournamentId}/matches/`);
    return response.data;
  },

  startTournament: async (tournamentId: number): Promise<void> => {
    await api.post(`/tournament/${tournamentId}/start/`);
  },
};
