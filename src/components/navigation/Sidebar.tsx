"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  VStack,
  Text,
  Separator,
  Icon,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname } from "next/navigation";
import { LuHouse, LuLayoutDashboard, LuUser, LuLogOut } from "react-icons/lu";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const isActive = (route: string) =>
    pathname === route || pathname.startsWith(route + "/");

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LuLayoutDashboard,
      isActive: isActive("/dashboard"),
    },
    { name: "Home", href: "/", icon: LuHouse, isActive: isActive("/") },
    {
      name: "Profile",
      href: "/profile",
      icon: LuUser,
      isActive: isActive("/profile"),
    },
  ];

  return (
    <Box
      as="aside"
      bg="brand.penn-dark-blue"
      color="white"
      py={6}
      px={4}
      height="100vh"
      position="fixed"
      width={{ base: "70px", md: "250px" }}
      zIndex={10}
    >
      <Flex direction="column" height="100%" justify="space-between">
        <VStack gap={6} align="flex-start">
          <Link href="/">
            <Box overflow="hidden" whiteSpace="nowrap">
              <Image
                src="/ObserverLogoDarkBackground.svg"
                width={180}
                height={45}
                alt="Observer Project"
                priority
              />
            </Box>
          </Link>

          <Separator borderColor="gray.600" />

          <VStack align="flex-start" gap={4} width="100%">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                style={{ width: "100%", display: "block" }}
              >
                <HStack
                  px={2}
                  py={2}
                  gap={3}
                  width="100%"
                  borderRadius="md"
                  bg={item.isActive ? "blue.700" : "transparent"}
                  _hover={{ bg: "blue.700" }}
                >
                  <Box display="flex" alignItems="center">
                    <Icon as={item.icon} boxSize={5} />
                  </Box>
                  <Text
                    fontWeight={item.isActive ? "bold" : "medium"}
                    display={{ base: "none", md: "block" }}
                  >
                    {item.name}
                  </Text>
                </HStack>
              </Link>
            ))}
          </VStack>
        </VStack>

        <Box width="100%" mb={4}>
          <Separator borderColor="gray.600" mb={4} />
          <HStack
            px={2}
            py={2}
            gap={3}
            cursor="pointer"
            onClick={handleLogout}
            borderRadius="md"
            _hover={{ bg: "blue.700" }}
          >
            <Box display="flex" alignItems="center">
              <Icon as={LuLogOut} boxSize={5} />
            </Box>
            <Text fontWeight="medium" display={{ base: "none", md: "block" }}>
              Logout
            </Text>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Sidebar;
