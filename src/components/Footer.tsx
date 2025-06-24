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
      bg="brand.penn-dark-blue"
      color="white"
      p={4}
      mt="auto"
      width="100%"
    >
      <Container maxW="container.xl">
        {variant === "full" ? (
          <Flex direction="column" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Observer Project
            </Text>
            <Text fontSize="sm">A digital window into medicine</Text>
          </Flex>
        ) : (
          <HStack justify="center" gap={4}>
            <Box>
              <Link href="/">
                <Text color="gray.200">Home</Text>
              </Link>
            </Box>
            <Box>
              <Link href="/dashboard-public">
                <Text color="gray.200">Dashboard</Text>
              </Link>
            </Box>
          </HStack>
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
