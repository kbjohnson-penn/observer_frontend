"use client";

import React, { useState, useEffect } from "react";
import Navigation from "../components/navigation/Navigation";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import LayoutContent from "./LayoutContent";
import { useAuth } from "../contexts/AuthContext";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      {!isHydrated ? (
        <Loading />
      ) : (
        <>
          <Navigation />
          <LayoutContent>{children}</LayoutContent>
          {!isAuthenticated && <Footer />}
        </>
      )}
    </>
  );
};

export default AppLayout;
