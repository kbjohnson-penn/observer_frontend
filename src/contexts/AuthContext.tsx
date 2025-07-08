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
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/token/verify/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            // Token is valid, decode it to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: payload.username || "user", id: payload.user_id });
          } else {
            // Token is invalid, try refresh
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
            }
          }
        } catch (error) {
          // Auth check failed - silently clean up tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid username or password");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    
    // Also set cookies for middleware
    document.cookie = `access_token=${data.access}; path=/; SameSite=Lax`;
    document.cookie = `refresh_token=${data.refresh}; path=/; SameSite=Lax`;

    // Decode JWT to get user info
    const payload = JSON.parse(atob(data.access.split('.')[1]));
    setUser({ username: payload.username || username, id: payload.user_id });
    
    router.push("/dashboard");
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    
    if (refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch (error) {
        // Logout error - continue with local cleanup
      }
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    
    // Clear cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setUser(null);
    router.push("/login");
  };

  const refreshToken = async (): Promise<boolean> => {
    const refresh = localStorage.getItem("refresh_token");
    
    if (!refresh) {
      return false;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        document.cookie = `access_token=${data.access}; path=/; SameSite=Lax`;
        
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
          document.cookie = `refresh_token=${data.refresh}; path=/; SameSite=Lax`;
        }
        
        // Decode JWT to get user info
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        setUser({ username: payload.username || "user", id: payload.user_id });
        
        return true;
      }
    } catch (error) {
      // Token refresh failed - will return false
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