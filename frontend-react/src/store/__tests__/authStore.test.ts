import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      player: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.player).toBeNull();
  });

  it('should set tokens', () => {
    const { setTokens } = useAuthStore.getState();
    setTokens('access-token', 'refresh-token');
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const { setTokens, logout } = useAuthStore.getState();
    
    // Set tokens first
    setTokens('access-token', 'refresh-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    
    // Logout
    logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.player).toBeNull();
  });
});
