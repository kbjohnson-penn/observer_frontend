/**
 * Authentication Context and Provider
 *
 * Manages user authentication state across the application using React Context API.
 * Handles login, logout, token refresh, and authentication state.
 *
 * Authentication Flow:
 * 1. User logs in with username/password
 * 2. Backend returns JWT tokens stored as httpOnly cookies
 * 3. Tokens are automatically included in subsequent requests
 * 4. Token refresh happens automatically in the background
 * 5. On logout, cookies are cleared by backend
 *
 * @module AuthContext
 */

'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CONFIG } from '@/lib/config';

/**
 * User object representing the authenticated user
 */
interface User {
  /** Username for the authenticated user */
  username: string;
  /** Email address (optional) */
  email?: string;
  /** Unique user ID */
  id?: number;
}

/**
 * Authentication context type providing auth state and methods
 */
interface AuthContextType {
  /** Currently authenticated user, or null if not authenticated */
  user: User | null;
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether authentication state is still being determined */
  isLoading: boolean;
  /**
   * Authenticate a user with username and password
   * @param username - User's username
   * @param password - User's password
   * @throws Error if authentication fails
   */
  login: (username: string, password: string) => Promise<void>;
  /**
   * Log out the current user and clear authentication state
   */
  logout: () => Promise<void>;
  /**
   * Refresh the authentication token
   * @returns true if refresh successful, false otherwise
   */
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 *
 * @returns Authentication context with user state and auth methods
 * @throws Error if used outside of AuthProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Welcome, {user.username}!</div>;
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider Component
 *
 * Provides authentication context to all child components.
 * Should wrap the entire application or authenticated sections.
 *
 * Features:
 * - Automatic token refresh on mount
 * - Listens for auth failures from API client
 * - Manages loading state during auth check
 * - Uses httpOnly cookies for secure token storage
 *
 * @component
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth:failed', handleAuthFailure);
    checkAuth();

    return () => {
      window.removeEventListener('auth:failed', handleAuthFailure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps intentional: router is stable in Next.js App Router, refreshToken defined in component

  const login = async (username: string, password: string) => {
    const response = await fetch(CONFIG.getApiUrl('/accounts/auth/token/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies in request
    });

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
    }

    router.replace('/dashboard');
  };

  const logout = async () => {
    try {
      await fetch(CONFIG.getApiUrl('/accounts/auth/logout/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
      });
    } catch {
      // Logout error - continue with cleanup
    }

    // httpOnly cookies are cleared by backend, no need to clear localStorage
    setUser(null);
    router.push('/login');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(CONFIG.getApiUrl('/accounts/auth/token/refresh/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
      });

      if (response.ok) {
        // Backend handles setting new httpOnly cookies
        // We need to get user info from a protected endpoint
        const userResponse = await fetch(CONFIG.getApiUrl('/accounts/profile/'), {
          method: 'GET',
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser({
            username: userData.user?.username || userData.username || 'user',
            email: userData.user?.email || userData.email,
            id: userData.user?.id || userData.id,
          });
          return true;
        }
      }
    } catch {
      // Token refresh failed
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
