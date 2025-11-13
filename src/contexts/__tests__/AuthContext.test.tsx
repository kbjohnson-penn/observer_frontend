import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
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

      // Mock failed logout call
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Logout should still work even if API fails
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
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

      // Mock successful refresh + user data call
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
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

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
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
});
