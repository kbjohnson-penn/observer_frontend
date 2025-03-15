"use client";

import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <Box 
      bg="white" 
      p={4} 
      borderRadius="lg" 
      boxShadow="sm"
      transition="all 0.3s"
      height="100%"
      className="hover:-translate-y-1 hover:shadow-md"
    >
      <Flex direction="column" align="start" height="100%" position="relative">
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          color="gray.500" 
          mb={1}
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>
        
        <Text 
          fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
          fontWeight="bold" 
          color="blue.600"
          mt="auto"
          pt={2}
        >
          {value.toLocaleString()}
        </Text>
        
        {icon && (
          <Box position="absolute" top={2} right={2}>
            {icon}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default StatCard;
