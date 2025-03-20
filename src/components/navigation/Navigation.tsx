"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

/**
 * Navigation component that renders either Sidebar or TopNavigation
 * based on authentication status
 */
const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="fixed w-[250px] h-full z-50">
        <Sidebar />
      </div>
    );
  }

  return (
    <div className="fixed w-full z-50">
      <TopNavigation />
    </div>
  );
};

export default Navigation;
