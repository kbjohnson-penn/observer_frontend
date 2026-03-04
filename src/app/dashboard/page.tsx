'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Box, Container, Text, Tabs, HStack, Badge, Spinner, Center } from '@chakra-ui/react';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import ResearchTab from '@/components/dashboard/ResearchTab';
import CohortTab from '@/components/dashboard/CohortTab';
import { useFilterOptions } from '@/hooks';
import { getCohorts } from '@/lib/utils/cohortStorage';
import { logger } from '@/lib/logger';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

function DashboardLoading() {
  return (
    <Center h="50vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'cohorts' ? 'cohorts' : 'research';
  });
  const [cohortCount, setCohortCount] = useState(0);
  const { filterOptions } = useFilterOptions(isAuthenticated);

  // Load cohort count function (reusable for callbacks and tab switches)
  const loadCohortCount = useCallback(async () => {
    try {
      const cohorts = await getCohorts();
      setCohortCount(cohorts.length);
    } catch (error) {
      logger.error('Failed to load cohort count:', error);
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Initial load on mount and sync URL with active tab
  useEffect(() => {
    loadCohortCount();
    if (!searchParams.get('tab')) {
      router.replace(`/dashboard?tab=${activeTab}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalVisits = filterOptions?.total_accessible_visits || 0;

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  // Return nothing while redirect is in progress
  if (!isAuthenticated) {
    return null;
  }

  const hasValidTier =
    user?.tier !== null &&
    user?.tier !== undefined &&
    user?.tier?.level !== null &&
    user?.tier?.level !== undefined;

  return (
    <Container maxW="container.xl" py={8}>
      {/* Tabs Section */}
      <Tabs.Root
        defaultValue="research"
        variant="line"
        value={activeTab}
        onValueChange={(e) => {
          setActiveTab(e.value);
          router.replace(`/dashboard?tab=${e.value}`, { scroll: false });
          if (e.value === 'cohorts') {
            loadCohortCount();
          }
        }}
      >
        <Tabs.List gap={4} borderBottom="2px" borderColor="gray.200">
          <Tabs.Trigger
            value="research"
            px={4}
            py={3}
            fontWeight={activeTab === 'research' ? 'semibold' : 'normal'}
            color={activeTab === 'research' ? 'blue.600' : 'gray.600'}
            borderBottom={activeTab === 'research' ? '3px solid' : 'none'}
            borderColor={activeTab === 'research' ? 'blue.600' : 'transparent'}
            _hover={{ bg: 'gray.50', color: activeTab === 'research' ? 'blue.700' : 'gray.800' }}
            transition="all 0.2s"
          >
            <HStack gap={2}>
              <Box color={activeTab === 'research' ? 'blue.600' : 'gray.500'}>
                <FaSearch />
              </Box>
              <Text>Research Data</Text>
              {totalVisits > 0 && (
                <Badge
                  colorPalette={COLORS.ui.dashboard.researchDataTabBadge}
                  variant={activeTab === 'research' ? 'solid' : 'subtle'}
                  ml={1}
                >
                  {totalVisits.toLocaleString()}
                </Badge>
              )}
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger
            value="cohorts"
            px={4}
            py={3}
            fontWeight={activeTab === 'cohorts' ? 'semibold' : 'normal'}
            color={activeTab === 'cohorts' ? 'green.600' : 'gray.600'}
            borderBottom={activeTab === 'cohorts' ? '3px solid' : 'none'}
            borderColor={activeTab === 'cohorts' ? 'green.600' : 'transparent'}
            _hover={{ bg: 'gray.50', color: activeTab === 'cohorts' ? 'green.700' : 'gray.800' }}
            transition="all 0.2s"
          >
            <HStack gap={2}>
              <Box color={activeTab === 'cohorts' ? 'green.600' : 'gray.500'}>
                <FaUsers />
              </Box>
              <Text>Cohorts</Text>
              {cohortCount > 0 && (
                <Badge
                  colorPalette={COLORS.ui.dashboard.cohortsTabBadge}
                  variant={activeTab === 'cohorts' ? 'solid' : 'subtle'}
                  ml={1}
                >
                  {cohortCount}
                </Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="research" mt={6}>
          <ResearchTab hasValidTier={hasValidTier} onCohortCreated={loadCohortCount} />
        </Tabs.Content>

        <Tabs.Content value="cohorts" mt={6}>
          <CohortTab isActive={activeTab === 'cohorts'} onCohortCountChanged={loadCohortCount} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
