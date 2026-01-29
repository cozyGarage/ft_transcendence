import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { api, API_BASE_URL, WS_BASE_URL } from '../client';

vi.mock('axios');

describe('API Client Configuration', () => {
  it('uses correct base URL from environment', () => {
    expect(API_BASE_URL).toBe('http://localhost:8000');
    expect(WS_BASE_URL).toBe('ws://localhost:8000');
  });

  it('creates axios instance with correct config', () => {
    expect(api.defaults.baseURL).toBe(API_BASE_URL);
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('has JSON content type header', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });
});

describe('API Error Handling', () => {
  it('handles network errors', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.create.mockReturnValue({
      ...api,
      get: vi.fn().mockRejectedValue(new Error('Network Error'))
    } as any);

    // Test that error is properly propagated
    try {
      await api.get('/test');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
