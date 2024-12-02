"use client";

import React, { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

const LayoutContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <main
      className={`${
        isAuthenticated ? "ml-[250px]" : "ml-0"
      } p-6 transition-all duration-300`}
    >
      {children}
    </main>
  );
};

export default LayoutContent;
