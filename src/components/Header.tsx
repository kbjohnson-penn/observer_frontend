"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Box, Flex, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { MenuOpenIcon, MenuCloseIcon } from "./icons/MenuIcons";

interface HeaderProps {
  variant?: "full" | "compact";
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
  variant = "full",
  showLinks = true,
  logo = { width: 200, height: 50 },
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  const navLinks: NavLink[] = [
    { name: "Home", href: "/", isActive: isActive("/") },
    {
      name: "Dashboard",
      href: "/dashboard-public",
      isActive: isActive("/dashboard-public"),
    },
    // { name: "Documentation", href: "/documentation", isActive: isActive("/documentation") },
    { name: "Login", href: "/login", isActive: isActive("/login") },
  ];

  return (
    <Box
      as="header"
      bg="brand.penn-dark-blue"
      color="white"
      py={4}
      px={6}
      width={variant === "full" ? "full" : "auto"}
      position="fixed"
      top={0}
      zIndex={40}
    >
      <Flex justify="space-between" align="center">
        <Link href="/">
          <Image
            src="/ObserverLogoDarkBackground.svg"
            width={logo.width}
            height={logo.height}
            alt="Observer Project"
            priority
          />
        </Link>

        {showLinks && (
          <>
            <HStack gap={6} display={{ base: "none", md: "flex" }}>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <Text
                    fontWeight={link.isActive ? "bold" : "medium"}
                    _hover={{ color: "blue.200" }}
                    transition="color 0.2s ease"
                  >
                    {link.name}
                  </Text>
                </Link>
              ))}
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
            <Link key={link.name} href={link.href}>
              <Text
                fontWeight={link.isActive ? "bold" : "medium"}
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
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Header;
