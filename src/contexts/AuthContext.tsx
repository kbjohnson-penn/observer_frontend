"use client";

import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import apiClient from "../lib/apiClient";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!Cookies.get("accessToken")
  );

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/token/", {
        username,
        password,
      });
      const { access, refresh } = response.data;

      // Store tokens in cookies
      Cookies.set("accessToken", access, { secure: true });
      Cookies.set("refreshToken", refresh, { secure: true });

      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout/", {
        refresh: Cookies.get("refreshToken"),
      });
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const verify = async () => {
    try {
      await apiClient.post("/auth/token/verify/", {
        token: Cookies.get("accessToken"),
      });
    } catch (error) {
      console.error("Token verification failed:", error);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, verify }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
