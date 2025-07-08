"use client";

import React from "react";
import { Box } from "@chakra-ui/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bg="gray.50">
      <Header showLinks={true} />
      <Box flex="1" pt="80px"> {/* Add padding-top to account for fixed header */}
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default AuthenticatedLayout;