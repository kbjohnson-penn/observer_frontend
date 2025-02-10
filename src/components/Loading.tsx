"use client";

import React from "react";
import { Center, Spinner as ChakraSpinner, Text } from "@chakra-ui/react";

const Spinner: React.FC = () => {
  return (
    <Center w="100%" h="100vh" bg="gray.50">
      <ChakraSpinner
        size="xl"
        borderWidth="4px"
        animationDuration="0.65s"
        color="blue.500"
      />
      <Text color="blue.500">Loading...</Text>
    </Center>
  );
};

export default Spinner;
