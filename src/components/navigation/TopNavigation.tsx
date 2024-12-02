"use client";

import React, { useState } from "react";
import { Box, Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { MenuOpenIcon, MenuCloseIcon } from "../icons/MenuIcons";

const TopNavigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box as="nav" bg="brand.penn-dark-blue" color="white" py={4} px={6}>
      <Flex justify="space-between" align="center">
        <HStack>
          <Link href="https://www.med.upenn.edu/" passHref>
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={200}
              height={50}
              alt="Penn Medicine logo"
            />
          </Link>
        </HStack>

        <HStack display={{ base: "none", md: "flex" }}>
          <Link href="/" passHref>
            <Text fontWeight={isActive("/") ? "bold" : "medium"} mx="2">
              Home
            </Text>
          </Link>
          <Link href="/dashboard-public" passHref>
            <Text
              fontWeight={isActive("/dashboard-public") ? "bold" : "medium"}
              mx="2"
            >
              Dashboard
            </Text>
          </Link>
          <Link href="/login" passHref>
            <Text fontWeight={isActive("/login") ? "bold" : "medium"} mx="2">
              Login
            </Text>
          </Link>
        </HStack>

        {/* Mobile Menu Toggle */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          variant="ghost"
          color="white"
          _hover={{ bg: "blue.700" }}
        >
          {isMenuOpen ? <MenuCloseIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Flex>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <VStack
          mt={4}
          display={{ md: "none" }} // Show only on small screens
          align="start"
          bg="brand.penn-dark-blue"
          p={4}
          rounded="md"
          shadow="sm"
        >
          <Link href="/" passHref>
            <Text fontWeight={isActive("/") ? "bold" : "medium"}>Home</Text>
          </Link>
          <Link href="/dashboard-public" passHref>
            <Text
              fontWeight={isActive("/dashboard-public") ? "bold" : "medium"}
            >
              Dashboard
            </Text>
          </Link>
          <Link href="/login" passHref>
            <Text fontWeight={isActive("/login") ? "bold" : "medium"}>
              Login
            </Text>
          </Link>
        </VStack>
      )}
    </Box>
  );
};

export default TopNavigation;
