"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  IconButton,
  Text,
  StackSeparator,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { MenuOpenIcon, MenuCloseIcon } from "../components/icons/MenuIcons";

const NavigationContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsHydrated(true); // Ensure hydration for client-side rendering
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (route: string) => pathname === route;

  if (!isHydrated) return null; // Prevent rendering until hydration is complete

  return (
    <Box as="nav" bg="brand.penn-dark-blue" color="white" py={4} px={6}>
      <Flex justify="space-between" align="center">
        {/* Logo and Tagline */}
        <HStack>
          <Link href="https://www.med.upenn.edu/" passHref>
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={220}
              height={80}
              alt="Penn Medicine logo"
            />
          </Link>
          <Text
            fontSize="sm"
            fontWeight="light"
            display={{ base: "none", md: "block" }} // Hide tagline on small screens
          >
            Automating Healthcare Beyond Documentation
          </Text>
        </HStack>

        {/* Desktop Navigation Links */}
        <HStack display={{ base: "none", md: "flex" }}>
          {!isAuthenticated && (
            <Link href="/" passHref>
              <Text fontWeight={isActive("/") ? "bold" : "medium"} mx="2">
                Home
              </Text>
            </Link>
          )}
          <Link
            href={isAuthenticated ? "/dashboard" : "/dashboard-public"}
            passHref
          >
            <Text
              fontWeight={
                isActive("/dashboard") || isActive("/dashboard-public")
                  ? "bold"
                  : "medium"
              }
              mx="2"
            >
              Dashboard
            </Text>
          </Link>
          {isAuthenticated && (
            <Link href="/profile" passHref>
              <Text
                fontWeight={isActive("/profile") ? "bold" : "medium"}
                mx="2"
              >
                Profile
              </Text>
            </Link>
          )}
          <Link href={isAuthenticated ? "#" : "/login"} passHref>
            <Text
              onClick={isAuthenticated ? handleLogout : undefined}
              fontWeight={
                isAuthenticated
                  ? "medium"
                  : isActive("/login")
                  ? "bold"
                  : "medium"
              }
              mx="2"
            >
              {isAuthenticated ? "Logout" : "Login"}
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
          {isMenuOpen ? <MenuOpenIcon /> : <MenuCloseIcon />}
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
          separator={<StackSeparator />}
        >
          {!isAuthenticated && (
            <Link href="/" passHref>
              <Text fontWeight={isActive("/") ? "bold" : "medium"}>Home</Text>
            </Link>
          )}
          <Link
            href={isAuthenticated ? "/dashboard" : "/dashboard-public"}
            passHref
          >
            <Text
              fontWeight={
                isActive("/dashboard") || isActive("/dashboard-public")
                  ? "bold"
                  : "medium"
              }
            >
              Dashboard
            </Text>
          </Link>
          {isAuthenticated && (
            <Link href="/profile" passHref>
              <Text fontWeight={isActive("/profile") ? "bold" : "medium"}>
                Profile
              </Text>
            </Link>
          )}
          <Link href={isAuthenticated ? "#" : "/login"} passHref>
            <Text
              onClick={isAuthenticated ? handleLogout : undefined}
              fontWeight={
                isAuthenticated
                  ? "medium"
                  : isActive("/login")
                  ? "bold"
                  : "medium"
              }
            >
              {isAuthenticated ? "Logout" : "Login"}
            </Text>
          </Link>
        </VStack>
      )}
    </Box>
  );
};

export default NavigationContent;
