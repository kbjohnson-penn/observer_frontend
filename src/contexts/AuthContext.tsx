'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CONFIG } from '@/lib/config';
import { logger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';

// Buffer time before token expiry to trigger logout (in seconds)
const AUTO_LOGOUT_BUFFER_SECONDS = 30;

interface User {
  username: string;
  email?: string;
  id?: number;
  tier?: {
    tier_name: string;
    level: number;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTokenRef = useRef<() => Promise<boolean>>(async () => false);

  // Clear any existing logout timer
  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Schedule auto-logout based on token expiry
  // expiresAt is a Unix timestamp in seconds from the backend response
  const scheduleAutoLogout = useCallback(
    (expiresAt: number) => {
      clearLogoutTimer();

      if (!expiresAt) {
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      // Schedule logout before token expires to give buffer
      const timeUntilExpiry = (expiresAt - now - AUTO_LOGOUT_BUFFER_SECONDS) * 1000;

      if (timeUntilExpiry > 0) {
        logger.log(`Token refresh scheduled in ${Math.round(timeUntilExpiry / 1000)} seconds`);
        logoutTimerRef.current = setTimeout(async () => {
          logger.log('Access token expiring, attempting refresh...');
          const refreshed = await refreshTokenRef.current();
          if (!refreshed) {
            window.dispatchEvent(new CustomEvent('auth:failed'));
          }
        }, timeUntilExpiry);
      } else {
        // Token already expired — try refresh before giving up
        refreshTokenRef.current().then((refreshed) => {
          if (!refreshed) {
            window.dispatchEvent(new CustomEvent('auth:failed'));
          }
        });
      }
    },
    [clearLogoutTimer]
  );

  // Define refreshToken BEFORE useEffect that uses it
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(
        CONFIG.getApiUrl('/accounts/auth/token/refresh/'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies in request
        },
        10000
      );

      if (response.ok) {
        // Get expires_at from refresh response for auto-logout scheduling
        const refreshData = await response.json();
        const expiresAt = refreshData.expires_at;

        // Backend handles setting new httpOnly cookies
        // We need to get user info from a protected endpoint
        const userResponse = await fetchWithTimeout(
          CONFIG.getApiUrl('/accounts/profile/'),
          {
            method: 'GET',
            credentials: 'include',
          },
          10000
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser({
            username: userData.user?.username || userData.username || 'user',
            email: userData.user?.email || userData.email,
            id: userData.user?.id || userData.id,
            tier: userData.tier
              ? { tier_name: userData.tier.tier_name, level: userData.tier.level }
              : null,
          });
          // Schedule auto-logout for the new token using expiry from response
          if (expiresAt) {
            scheduleAutoLogout(expiresAt);
          }
          return true;
        } else {
          // Profile fetch failed - clear user state
          setUser(null);
        }
      } else {
        // Token refresh failed (401, 403, etc.) - clear user state
        setUser(null);
      }
    } catch {
      // Token refresh failed - clear user state
      setUser(null);
    }

    return false;
  }, [scheduleAutoLogout]);

  // eslint-disable-next-line react-hooks/refs
  refreshTokenRef.current = refreshToken;

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to refresh token (which will verify if we have valid cookies)
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          // No valid tokens found
          setUser(null);
        }
      } catch {
        // Auth check failed
        setUser(null);
      }
      setIsLoading(false);
    };

    // Listen for auth failures from API client
    const handleAuthFailure = () => {
      setIsLoggingOut(true);
      clearLogoutTimer();
      setUser(null);
      router.replace('/login');
      // Reset isLoggingOut after navigation starts (slight delay to prevent flash)
      setTimeout(() => setIsLoggingOut(false), 100);
    };

    window.addEventListener('auth:failed', handleAuthFailure);
    checkAuth();

    return () => {
      window.removeEventListener('auth:failed', handleAuthFailure);
      // Clear auto-logout timer on unmount
      clearLogoutTimer();
    };
  }, [refreshToken, router, clearLogoutTimer]);

  const login = async (username: string, password: string) => {
    // Reset logout state in case user is logging back in after timeout
    setIsLoggingOut(false);

    // Fetch CSRF token first for state-changing operation
    const csrfResponse = await fetchWithTimeout(
      CONFIG.getApiUrl('/accounts/auth/csrf-token/'),
      {
        method: 'GET',
        credentials: 'include',
      },
      10000
    );

    if (!csrfResponse.ok) {
      throw new Error('Failed to obtain CSRF token');
    }

    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    if (!csrfToken) {
      throw new Error('CSRF token missing from response');
    }

    const response = await fetchWithTimeout(
      CONFIG.getApiUrl('/accounts/auth/token/'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Include cookies in request
      },
      10000
    );

    if (!response.ok) {
      throw new Error('Invalid username or password');
    }

    const data = await response.json();

    // User info is now returned directly from backend
    if (data.user) {
      setUser({
        username: data.user.username,
        email: data.user.email,
        id: data.user.id,
      });

      // Fetch profile to get tier data (login response doesn't include it)
      try {
        const profileResponse = await fetchWithTimeout(
          CONFIG.getApiUrl('/accounts/profile/'),
          { method: 'GET', credentials: 'include' },
          10000
        );
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  tier: profileData.tier
                    ? { tier_name: profileData.tier.tier_name, level: profileData.tier.level }
                    : null,
                }
              : prev
          );
        }
      } catch {
        // Profile fetch failed — tier will be populated on next token refresh
      }
    }

    // Schedule auto-logout for the new token using expiry from response
    if (data.expires_at) {
      scheduleAutoLogout(data.expires_at);
    }

    router.replace('/dashboard');
  };

  const logout = useCallback(async () => {
    // Prevent blank screen flash during logout
    setIsLoggingOut(true);
    // Clear the auto-logout timer
    clearLogoutTimer();

    const maxRetries = 2;
    let backendLogoutSuccessful = false;

    for (let attempt = 0; attempt <= maxRetries && !backendLogoutSuccessful; attempt++) {
      try {
        // Fetch CSRF token for state-changing operation
        const csrfResponse = await fetchWithTimeout(
          CONFIG.getApiUrl('/accounts/auth/csrf-token/'),
          {
            method: 'GET',
            credentials: 'include',
          },
          10000
        );

        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          const csrfToken = csrfData.csrfToken;

          if (csrfToken) {
            const logoutResponse = await fetchWithTimeout(
              CONFIG.getApiUrl('/accounts/auth/logout/'),
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
              },
              10000
            );
            backendLogoutSuccessful = logoutResponse.ok;
          }
        }
      } catch (error) {
        logger.warn(`Logout attempt ${attempt + 1} failed:`, error);
      }
    }

    if (!backendLogoutSuccessful) {
      logger.error('Backend logout failed after retries - server session may still be active');
    }

    // Clear local state regardless of backend result
    setUser(null);
    router.replace('/login');
    setTimeout(() => setIsLoggingOut(false), 100);
  }, [clearLogoutTimer, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isLoggingOut,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
