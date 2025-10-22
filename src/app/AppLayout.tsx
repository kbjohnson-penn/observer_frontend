'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, ProgressCircle } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Routes that should use authenticated layout
  const authenticatedRoutes = ['/dashboard', '/profile'];
  const shouldUseAuthLayout = authenticatedRoutes.some((route) => pathname.startsWith(route));

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <PublicLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <ProgressCircle.Root value={null} size="lg" colorPalette="blue">
            <ProgressCircle.Circle>
              <ProgressCircle.Track stroke="gray.200" />
              <ProgressCircle.Range />
            </ProgressCircle.Circle>
          </ProgressCircle.Root>
        </Box>
      </PublicLayout>
    );
  }

  // For authenticated routes, use AuthenticatedLayout if user is logged in
  if (shouldUseAuthLayout && isAuthenticated) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // For all other routes (public routes, login, etc.), use PublicLayout
  return <PublicLayout>{children}</PublicLayout>;
};

export default AppLayout;
