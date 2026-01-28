// User & Auth Types
export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string;
  first_name?: string;
  last_name?: string;
  is_online?: boolean;
  created_at?: string;
}

export interface Player {
  id: number;
  user: User;
  stats: PlayerStats;
}

export interface PlayerStats {
  rank: number;
  league: League;
  xp: number;
  wins: number;
  losses: number;
  total_games: number;
  win_rate: number;
}

export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

// Auth Types
export interface LoginResponse {
  access_token: string;
  is_2fa_enabled?: boolean;
}

export interface RegisterResponse {
  message: string;
}

export interface TokenResponse {
  access_token: string;
}

// Notification Types
export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  data?: Record<string, unknown>;
}

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'game_invite'
  | 'tournament_invite'
  | 'message'
  | 'system';

// Chat Types
export interface ChatRoom {
  id: number;
  name?: string;
  is_group: boolean;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  room_id: number;
  created_at: string;
  is_read: boolean;
}

// Friend Types
export interface Friend {
  id: number;
  user: User;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// Game Types
export interface Game {
  id: number;
  game_type: 'pong' | 'othello';
  player1: Player;
  player2: Player;
  winner?: Player;
  score_player1: number;
  score_player2: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
}

export interface GameMatch {
  id: number;
  opponent: User;
  result: 'win' | 'loss' | 'draw';
  score: string;
  xp_gained: number;
  game_type: 'pong' | 'othello';
  played_at: string;
}

// Tournament Types
export interface Tournament {
  id: number;
  name: string;
  game_type: 'pong' | 'othello';
  status: 'upcoming' | 'in_progress' | 'completed';
  max_players: number;
  current_players: number;
  participants: Player[];
  winner?: Player;
  start_date: string;
  created_at: string;
}

export interface TournamentMatch {
  id: number;
  tournament_id: number;
  round: number;
  player1: Player;
  player2: Player;
  winner?: Player;
  score_player1: number;
  score_player2: number;
  status: 'pending' | 'in_progress' | 'completed';
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  player: Player;
  xp: number;
  wins: number;
  league: League;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Settings Types
export interface UserSettings {
  notifications_enabled: boolean;
  sound_enabled: boolean;
  two_factor_enabled: boolean;
  theme: 'dark' | 'light';
  language: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: File;
}
