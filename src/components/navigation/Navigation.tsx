"use client";

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar";
import Header from "../../components/Header";
import { Box } from "@chakra-ui/react";

const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Box position="fixed" zIndex={50}>
        <Sidebar />
      </Box>
    );
  }

  return (
    <Box position="fixed" width="full" zIndex={50}>
      <Header variant="full" showLinks={true} />
    </Box>
  );
};

export default Navigation;
