import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  setError,
  clearError,
  setLoading,
} from '../features/auth/authSlice.js';

describe('🔑 Redux Auth Slice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const actual = authReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });

  it('should handle setCredentials', () => {
    const mockPayload = {
      user: {
        _id: '123',
        username: 'john',
        email: 'john@example.com',
        displayName: 'John Doe',
        isEmailVerified: true,
      },
      accessToken: 'token123',
    };
    const actual = authReducer(initialState, setCredentials(mockPayload));
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(mockPayload.user);
    expect(actual.accessToken).toBe('token123');
  });

  it('should handle logout', () => {
    const authenticatedState = {
      user: {
        _id: '123',
        username: 'john',
        email: 'john@example.com',
        displayName: 'John Doe',
        isEmailVerified: true,
      },
      accessToken: 'token123',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const actual = authReducer(authenticatedState, logout());
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBeNull();
    expect(actual.accessToken).toBeNull();
  });

  it('should handle setError and clearError', () => {
    const errorState = authReducer(initialState, setError('Authentication failed'));
    expect(errorState.error).toBe('Authentication failed');
    const clearedState = authReducer(errorState, clearError());
    expect(clearedState.error).toBeNull();
  });
});
