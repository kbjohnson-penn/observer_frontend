'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  Button,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { HiUser } from 'react-icons/hi2';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { MenuOpenIcon, MenuCloseIcon } from './icons/MenuIcons';

// Constants
const HEADER_Z_INDEX = 40;
const AVATAR_SIZE = '32px';

interface HeaderProps {
  showLinks?: boolean;
  logo?: {
    width: number;
    height: number;
  };
}

// Reusable Components
const NavigationLink: React.FC<{
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  isMobile?: boolean;
}> = ({ href, children, isActive = false, isMobile = false }) => (
  <Link href={href}>
    <Text
      fontWeight="medium"
      color="white"
      _hover={{ color: isMobile ? undefined : 'blue.200', bg: isMobile ? 'blue.700' : undefined }}
      transition={isMobile ? 'background 0.2s ease' : 'color 0.2s ease'}
      cursor="pointer"
      py={isMobile ? 2 : undefined}
      px={isMobile ? 3 : undefined}
      borderRadius={isMobile ? 'md' : undefined}
      bg={isMobile && isActive ? 'blue.700' : 'transparent'}
      display={isMobile ? 'block' : undefined}
      width={isMobile ? '100%' : undefined}
      textAlign={isMobile ? 'center' : undefined}
    >
      {children}
    </Text>
  </Link>
);

const UserAvatar: React.FC<{
  isAuthenticated: boolean;
  user: { username?: string } | null;
}> = ({ isAuthenticated, user }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    w={AVATAR_SIZE}
    h={AVATAR_SIZE}
    borderRadius="full"
    bg={isAuthenticated ? 'white' : 'gray.100'}
    color={isAuthenticated ? 'gray.700' : 'gray.600'}
    _hover={{ bg: isAuthenticated ? 'gray.50' : 'gray.200' }}
    transition="background 0.2s ease"
    border="2px solid transparent"
  >
    {isAuthenticated ? (
      <Text fontSize="sm" fontWeight="bold">
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </Text>
    ) : (
      <HiUser size={16} />
    )}
  </Box>
);

const Header: React.FC<HeaderProps> = ({ showLinks = true, logo = { width: 200, height: 50 } }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const isActive = (route: string) => pathname === route;

  // Force unauthenticated menu on auth pages to handle race conditions
  // when session expires and redirects to /login before auth state updates
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const showAuthenticatedMenu = isAuthenticated && !isAuthPage;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Log error but continue with logout flow
      logger.error('Header: Logout failed:', error);
      // Could also add toast notification here
    }
  };

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
      zIndex={HEADER_Z_INDEX}
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
            {/* Right Navigation Links + Avatar */}
            <HStack gap={6} display={{ base: 'none', md: 'flex' }} alignItems="center">
              <NavigationLink href={isAuthenticated ? '/dashboard' : '/dashboard-public'}>
                Dashboard
              </NavigationLink>
              <NavigationLink href="/dataset">Dataset</NavigationLink>
              <NavigationLink href="/search">Search</NavigationLink>

              {/* Avatar Menu */}
              <Menu.Root positioning={{ placement: 'bottom-end' }}>
                <Menu.Trigger focusRing="outside">
                  <UserAvatar isAuthenticated={showAuthenticatedMenu} user={user} />
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content bg="white" border="1px" borderColor="gray.200" shadow="lg">
                      {showAuthenticatedMenu ? (
                        <>
                          <Menu.Item asChild value="settings">
                            <Link href="/settings">
                              <Text color="gray.700">Settings</Text>
                            </Link>
                          </Menu.Item>
                          <Menu.Item value="logout" onClick={handleLogout}>
                            <Text color="gray.700">Logout</Text>
                          </Menu.Item>
                        </>
                      ) : (
                        <>
                          <Menu.Item asChild value="login">
                            <Link href="/login">
                              <Text color="gray.700">Login</Text>
                            </Link>
                          </Menu.Item>
                          <Menu.Item asChild value="register">
                            <Link href="/register">
                              <Text color="gray.700">Register</Text>
                            </Link>
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </HStack>

            {/* Mobile Menu Toggle */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.700' }}
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
          display={{ md: 'none' }} /* Show only on small screens */
          align="stretch"
          bg="blue.800"
          p={4}
          rounded="md"
          shadow="md"
          borderWidth="1px"
          borderColor="blue.700"
        >
          {/* Mobile Menu Items */}
          <NavigationLink
            href={isAuthenticated ? '/dashboard' : '/dashboard-public'}
            isActive={isActive('/dashboard') || isActive('/dashboard-public')}
            isMobile
          >
            Dashboard
          </NavigationLink>

          <NavigationLink href="/dataset" isActive={isActive('/dataset')} isMobile>
            Dataset
          </NavigationLink>

          <NavigationLink href="/search" isActive={isActive('/search')} isMobile>
            Search
          </NavigationLink>

          {/* Mobile Auth Section */}
          {showAuthenticatedMenu ? (
            <Box mt={4} pt={4} borderTop="1px" borderColor="blue.700">
              <VStack gap={3}>
                <NavigationLink href="/settings" isActive={isActive('/settings')} isMobile>
                  Settings
                </NavigationLink>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  colorPalette="whiteAlpha"
                  size="sm"
                  color="white"
                  borderColor="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  width="100%"
                >
                  Logout
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box mt={4} pt={4} borderTop="1px" borderColor="blue.700">
              <VStack gap={3}>
                <NavigationLink href="/login" isActive={isActive('/login')} isMobile>
                  Login
                </NavigationLink>
                <NavigationLink href="/register" isActive={isActive('/register')} isMobile>
                  Register
                </NavigationLink>
              </VStack>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default Header;
