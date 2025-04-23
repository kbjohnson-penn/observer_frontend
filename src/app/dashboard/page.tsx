// import React from "react";

// import PlayGround from "./_components/PlayGround";

// const Dashboard: React.FC = () => {
//   return <PlayGround />;
// };

// export default Dashboard;

"use client";

import React, { useState } from "react";
import { Input, Stack, Text, Box, Card } from "@chakra-ui/react";

const Dashboard = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.100"
      px={4}
    >
      <Card.Root
        maxW="sm"
        w="full"
        rounded="md"
        shadow="lg"
        bg="white"
        border="1px"
      >
        <Box
          bg="yellow.100"
          p={3}
          mb={4}
          borderRadius="md"
          border="1px"
          borderColor="yellow.300"
        >
          <Text fontWeight="bold" color="yellow.800" textAlign="center">
            🚧 Page Under Construction 🚧
          </Text>
          <Text fontSize="sm" color="yellow.800" textAlign="center">
            This feature is currently being developed and is not yet available.
          </Text>
        </Box>
      </Card.Root>
    </Box>
  );
};

export default Dashboard;
