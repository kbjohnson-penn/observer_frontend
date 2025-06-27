"use client";

import React from "react";
import { Box, Container } from "@chakra-ui/react";

// Import modular components
import HeroSection from "@/components/homepage/HeroSection";
import StatisticsSection from "@/components/homepage/StatisticsSection";
import ResearchApplicationsSection from "@/components/homepage/ResearchApplicationsSection";
import DataTypesSection from "@/components/homepage/DataTypesSection";

const Home: React.FC = () => {
  return (
    <Box py={8} className="min-h-[calc(100vh-120px)]">
      <Container maxW="container.xl">
        <HeroSection />
        <StatisticsSection />
        <ResearchApplicationsSection />
        <DataTypesSection />
      </Container>
    </Box>
  );
};

export default Home;