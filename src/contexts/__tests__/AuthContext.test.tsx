import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch.mockClear();
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should start with loading state', () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw error when used outside AuthProvider', () => {
      // Suppress logger.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });

  describe('Login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock initial refresh call (fails - no existing auth)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Mock login call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        id: 1,
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle login failure with invalid credentials', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Mock failed login call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(result.current.login('wronguser', 'wrongpassword')).rejects.toThrow(
        'Invalid username or password'
      );

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should make login request with correct parameters', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Mock login call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounts/auth/token/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': 'test-csrf-token',
          },
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123',
          }),
          credentials: 'include',
        })
      );
    });
  });

  describe('Logout', () => {
    it('should successfully logout and redirect to login', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch for login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Setup: login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Mock CSRF token fetch for logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Mock logout call
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });

    it('should handle logout even if API call fails', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch for login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Setup: login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      // Mock failed CSRF fetch or logout call (network error)
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Logout should still work even if API fails
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  describe('Token Refresh', () => {
    it('should successfully refresh token and get user data', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock successful refresh with expires_at + user data call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: Math.floor(Date.now() / 1000) + 300 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          }),
        });

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        id: 1,
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when refresh token fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult: boolean = true;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle user data fetch failure after token refresh', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: Math.floor(Date.now() / 1000) + 300 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult: boolean = true;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(false);
    });
  });

  describe('Auth Failure Event', () => {
    it('should clear user and redirect on auth:failed event', async () => {
      // Mock initial refresh call
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Setup: login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Simulate auth failure event
      act(() => {
        window.dispatchEvent(new CustomEvent('auth:failed'));
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/login');
    });
  });

  describe('Initial Auth Check', () => {
    it('should attempt token refresh on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/accounts/auth/token/refresh/'),
          expect.any(Object)
        );
      });
    });

    it('should set user if refresh succeeds on mount', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: Math.floor(Date.now() / 1000) + 300 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        id: 1,
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle network errors during login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(result.current.login('testuser', 'password123')).rejects.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle missing user data in login response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.user).toBeNull();
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle user data with nested user object in refresh', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: Math.floor(Date.now() / 1000) + 300 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: {
              username: 'testuser',
              email: 'test@example.com',
              id: 1,
            },
          }),
        });

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(result.current.user).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        id: 1,
      });
    });

    it('should handle user data with partial information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: Math.floor(Date.now() / 1000) + 300 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            username: 'testuser',
          }),
        });

      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult).toBe(true);
      expect(result.current.user).toEqual({
        username: 'testuser',
        email: undefined,
        id: undefined,
      });
    });

    it('should handle exception during initial auth check', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should cleanup auth failure event listener on unmount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('auth:failed', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Auto-Logout Timer', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should schedule auto-logout after successful login', async () => {
      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Token expires in 5 minutes (300 seconds) from NOW
      // Compute this AFTER initial render to ensure timer consistency
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 300;

      // Mock CSRF token fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });

      // Mock login call with expires_at in response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          },
          expires_at: expiryTime,
        }),
      });

      // Spy on dispatchEvent BEFORE login to track all events
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Clear previous calls after login is complete
      dispatchEventSpy.mockClear();

      // Advance time to just before logout trigger (270 seconds = 300 - 30 buffer)
      act(() => {
        jest.advanceTimersByTime(269 * 1000);
      });

      // Should not have dispatched yet
      expect(dispatchEventSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:failed' })
      );

      // Advance 1 more second to trigger
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now should have dispatched auth:failed
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
      const authFailedCalls = dispatchEventSpy.mock.calls.filter(
        (call) => (call[0] as CustomEvent).type === 'auth:failed'
      );
      expect(authFailedCalls.length).toBeGreaterThan(0);

      dispatchEventSpy.mockRestore();
    });

    it('should schedule auto-logout after successful token refresh', async () => {
      // Token expires in 5 minutes (300 seconds)
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 300;

      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock successful refresh with expires_at + user data call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ expires_at: expiryTime }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            username: 'testuser',
            email: 'test@example.com',
            id: 1,
          }),
        });

      await act(async () => {
        await result.current.refreshToken();
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Spy on dispatchEvent
      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      // Advance time to trigger auto-logout (270 seconds = 300 - 30 buffer)
      act(() => {
        jest.advanceTimersByTime(270 * 1000);
      });

      // Should have dispatched auth:failed
      const authFailedCalls = dispatchEventSpy.mock.calls.filter(
        (call) => (call[0] as CustomEvent).type === 'auth:failed'
      );
      expect(authFailedCalls.length).toBeGreaterThan(0);

      dispatchEventSpy.mockRestore();
    });

    it('should clear timer on logout', async () => {
      // Token expires in 5 minutes
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 300;

      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { username: 'testuser', email: 'test@example.com', id: 1 },
          expires_at: expiryTime,
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Mock CSRF fetch and logout call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({ ok: true });

      await act(async () => {
        await result.current.logout();
      });

      // Timer should have been cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should clear timer on auth:failed event', async () => {
      // Token expires in 5 minutes
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 300;

      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { username: 'testuser', email: 'test@example.com', id: 1 },
          expires_at: expiryTime,
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Simulate auth failure event
      act(() => {
        window.dispatchEvent(new CustomEvent('auth:failed'));
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      // Timer should have been cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('should dispatch auth:failed immediately if token already expired', async () => {
      // Token already expired (expiry in the past)
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now - 60; // 60 seconds ago

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login with expired token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { username: 'testuser', email: 'test@example.com', id: 1 },
          expires_at: expiryTime,
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      // Should dispatch auth:failed immediately since token is expired
      const authFailedCalls = dispatchEventSpy.mock.calls.filter(
        (call) => (call[0] as CustomEvent).type === 'auth:failed'
      );
      expect(authFailedCalls.length).toBeGreaterThan(0);

      dispatchEventSpy.mockRestore();
    });

    it('should handle missing expires_at in response gracefully', async () => {
      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login without expires_at
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { username: 'testuser', email: 'test@example.com', id: 1 },
          // No expires_at
        }),
      });

      // Should not throw when no expires_at
      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      // Should still successfully login
      expect(result.current.isAuthenticated).toBe(true);

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      // Advance time significantly - no timer should fire since no expires_at
      act(() => {
        jest.advanceTimersByTime(600 * 1000); // 10 minutes
      });

      // auth:failed should NOT be dispatched from timer
      const authFailedFromTimer = dispatchEventSpy.mock.calls.filter(
        (call) => (call[0] as CustomEvent).type === 'auth:failed'
      );
      expect(authFailedFromTimer.length).toBe(0);

      dispatchEventSpy.mockRestore();
    });

    it('should clear timer on component unmount', async () => {
      // Token expires in 5 minutes
      const now = Math.floor(Date.now() / 1000);
      const expiryTime = now + 300;

      // Mock initial refresh (fails)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result, unmount } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ csrfToken: 'test-csrf-token' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { username: 'testuser', email: 'test@example.com', id: 1 },
          expires_at: expiryTime,
        }),
      });

      await act(async () => {
        await result.current.login('testuser', 'password123');
      });

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      // Unmount the component
      unmount();

      // Timer should have been cleared on unmount
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});
