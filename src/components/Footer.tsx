"use client";

import React from "react";
import {
  Box,
  Container,
  Flex,
  Text,
  HStack,
  Separator,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  variant?: "full" | "compact";
}

const Footer: React.FC<FooterProps> = ({ variant = "full" }) => {
  return (
    <Box
      as="footer"
      bg="blue.800"
      color="white"
      p={4}
      mt="auto"
      width="100%"
    >
      <Container maxW="container.xl">
        {variant === "full" && (
          <Flex direction="column" mb={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              Observer Project
            </Text>
            <Text fontSize="sm" color="gray.300">A digital window into medicine</Text>
          </Flex>
        )}

        <Separator borderColor="gray.600" my={4} />

        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="gray.400">
            © {new Date().getFullYear()} OBSERVER Project
          </Text>
          <Box>
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={100}
              height={25}
              alt="Observer Project"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
