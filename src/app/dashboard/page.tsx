"use client";

import React, { useState, useEffect } from "react";
import { Text } from "@chakra-ui/react";

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Text fontSize="2xl" fontWeight="bold" textAlign="center">
      Dashboard Page
    </Text>
  );
};

export default Dashboard;
