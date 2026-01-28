import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
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
    // Manually set state to simulate login
    useAuthStore.setState({
      accessToken: 'access-token',
      isAuthenticated: true,
    });
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', () => {
    const { logout } = useAuthStore.getState();
    
    // Set tokens first
    useAuthStore.setState({
      accessToken: 'access-token',
      isAuthenticated: true,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    
    // Logout
    logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.player).toBeNull();
  });
});
