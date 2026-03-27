'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Box, ProgressCircle } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading, isLoggingOut } = useAuth();

  // Routes that should use authenticated layout
  const authenticatedRoutes = ['/dashboard', '/profile', '/search'];
  const shouldUseAuthLayout = authenticatedRoutes.some((route) => pathname.startsWith(route));

  // Show loading state while checking authentication or during logout
  if (isLoading || isLoggingOut) {
    return (
      <PublicLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <ProgressCircle.Root size="lg" colorPalette="blue">
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
    return (
      <ErrorBoundary componentName="AuthenticatedLayout">
        <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </ErrorBoundary>
    );
  }

  // For all other routes (public routes, login, etc.), use PublicLayout
  return (
    <ErrorBoundary componentName="PublicLayout">
      <PublicLayout>{children}</PublicLayout>
    </ErrorBoundary>
  );
};

export default AppLayout;
