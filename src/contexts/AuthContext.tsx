"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email?: string;
  id?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
      } catch (error) {
        // Auth check failed
        setUser(null);
      }
      setIsLoading(false);
    };

    // Listen for auth failures from API client
    const handleAuthFailure = () => {
      setUser(null);
      router.push("/login");
    };

    window.addEventListener("auth:failed", handleAuthFailure);
    checkAuth();

    return () => {
      window.removeEventListener("auth:failed", handleAuthFailure);
    };
  }, [router]);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/auth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // Include cookies in request
    });

    if (!response.ok) {
      throw new Error("Invalid username or password");
    }

    const data = await response.json();

    // User info is now returned directly from backend
    if (data.user) {
      setUser({
        username: data.user.username,
        email: data.user.email,
        id: data.user.id
      });
    }

    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies in request
      });
    } catch (error) {
      // Logout error - continue with cleanup
    }

    // httpOnly cookies are cleared by backend, no need to clear localStorage
    setUser(null);
    router.push("/login");
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Include cookies in request
      });

      if (response.ok) {
        // Backend handles setting new httpOnly cookies
        // We need to get user info from a protected endpoint
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/profile/`, {
          method: "GET",
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser({
            username: userData.user?.username || userData.username || "user",
            email: userData.user?.email || userData.email,
            id: userData.user?.id || userData.id
          });
          return true;
        }
      }
    } catch (error) {
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