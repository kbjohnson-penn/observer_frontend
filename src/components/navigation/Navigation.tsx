"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import TopNavigation from "./TopNavigation";

const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div>
      {isLoggedIn ? (
        <div className="fixed w-[250px] h-full z-50">
          <Sidebar />
        </div>
      ) : (
        <div className="fixed w-full z-50">
          <TopNavigation />
        </div>
      )}
    </div>
  );
};

export default Navigation;
