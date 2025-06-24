"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Flex, HStack, IconButton, Text, VStack, Button } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MenuOpenIcon, MenuCloseIcon } from "./icons/MenuIcons";

interface HeaderProps {
  showLinks?: boolean;
  logo?: {
    width: number;
    height: number;
  };
}

interface NavLink {
  name: string;
  href: string;
  isActive: boolean;
}

const Header: React.FC<HeaderProps> = ({
  showLinks = true,
  logo = { width: 200, height: 50 },
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const isActive = (route: string) => pathname === route;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Different nav links based on authentication status
  const navLinks: NavLink[] = isAuthenticated ? [
    { name: "Dashboard", href: "/dashboard", isActive: isActive("/dashboard") },
    { name: "Profile", href: "/profile", isActive: isActive("/profile") },
  ] : [
    { name: "Home", href: "/", isActive: isActive("/") },
    {
      name: "Dashboard",
      href: "/dashboard-public",
      isActive: isActive("/dashboard-public"),
    },
    {
      name: "Login",
      href: "/login",
      isActive: isActive("/login"),
    },
  ];

  return (
    <Box
      as="header"
      bg="blue.800"
      color="white"
      py={4}
      px={6}
      width="100%"
      position="fixed"
      top={0}
      zIndex={40}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <Link href="/">
            <Image
              src="/ObserverLogoDarkBackground.svg"
              width={logo.width}
              height={logo.height}
              alt="Observer Project"
              priority
            />
          </Link>
        </Box>

        {showLinks && (
          <>
            <HStack gap={6} display={{ base: "none", md: "flex" }} alignItems="center">
              {navLinks.map((link) => (
                <Box key={link.name}>
                  <Link href={link.href}>
                    <Text
                      fontWeight={link.isActive ? "bold" : "medium"}
                      color="white"
                      _hover={{ color: "blue.200" }}
                      transition="color 0.2s ease"
                    >
                      {link.name}
                    </Text>
                  </Link>
                </Box>
              ))}
              
              {isAuthenticated && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  colorScheme="whiteAlpha"
                  size="sm"
                  color="white"
                  borderColor="white"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  Logout
                </Button>
              )}
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
          </>
        )}
      </Flex>

      {/* Mobile Menu */}
      {showLinks && isMenuOpen && (
        <VStack
          mt={4}
          gap={3}
          display={{ md: "none" }} /* Show only on small screens */
          align="stretch"
          bg="brand.penn-dark-blue"
          p={4}
          rounded="md"
          shadow="md"
          borderWidth="1px"
          borderColor="blue.700"
        >
          {navLinks.map((link) => (
            <Box key={link.name}>
              <Link href={link.href}>
                <Text
                  fontWeight={link.isActive ? "bold" : "medium"}
                  color="white"
                  py={2}
                  px={3}
                  borderRadius="md"
                  _hover={{ bg: "blue.700" }}
                  bg={link.isActive ? "blue.700" : "transparent"}
                  transition="background 0.2s ease"
                  display="block"
                  width="100%"
                >
                  {link.name}
                </Text>
              </Link>
            </Box>
          ))}
          
          {isAuthenticated && (
            <Box mt={4} pt={4} borderTop="1px" borderColor="blue.700">
              <Button
                onClick={handleLogout}
                variant="outline"
                colorScheme="whiteAlpha"
                size="sm"
                color="white"
                borderColor="white"
                _hover={{ bg: "whiteAlpha.200" }}
                width="100%"
              >
                Logout
              </Button>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default Header;
