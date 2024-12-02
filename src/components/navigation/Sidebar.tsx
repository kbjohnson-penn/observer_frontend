"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, VStack, Text, Separator } from "@chakra-ui/react";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const isActive = (route: string) => pathname === route;

  return (
    <Box
      as="nav"
      bg="brand.penn-dark-blue"
      color="white"
      py={4}
      px={6}
      height="100vh"
      position="fixed"
      width="250px"
      display={{ base: "none", md: "block" }}
    >
      <VStack align="start" gap={4}>
        <Image
          src="/ObserverLogoDarkBackground.svg"
          width={200}
          height={50}
          alt="Penn Medicine logo"
        />

        <Separator orientation="vertical" borderColor="gray.600" />

        <VStack align="start" gap={3} w="full">
          <Link href="/dashboard" passHref>
            <Text fontWeight={isActive("/dashboard") ? "bold" : "medium"}>
              Dashboard
            </Text>
          </Link>

          {isActive("/dashboard") && (
            <VStack align="start" pl={4} gap={2}>
              <Link href="/dashboard/encounters" passHref>
                <Text
                  fontWeight={
                    isActive("/dashboard/encounters") ? "bold" : "medium"
                  }
                >
                  Encounters
                </Text>
              </Link>
              <Link href="/dashboard/patients" passHref>
                <Text
                  fontWeight={
                    isActive("/dashboard/patients") ? "bold" : "medium"
                  }
                >
                  Patients
                </Text>
              </Link>
              <Link href="/dashboard/providers" passHref>
                <Text
                  fontWeight={
                    isActive("/dashboard/providers") ? "bold" : "medium"
                  }
                >
                  Providers
                </Text>
              </Link>
            </VStack>
          )}

          <Link href="/profile" passHref>
            <Text fontWeight={isActive("/profile") ? "bold" : "medium"}>
              Profile
            </Text>
          </Link>
        </VStack>

        <Separator orientation="vertical" borderColor="gray.600" />

        <Text
          onClick={handleLogout}
          cursor="pointer"
          fontWeight="medium"
          mt="auto"
        >
          Logout
        </Text>
      </VStack>
    </Box>
  );
};

export default Sidebar;
