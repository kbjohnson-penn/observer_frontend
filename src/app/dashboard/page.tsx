'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Text, Tabs, HStack, Badge, Spinner, Center } from '@chakra-ui/react';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import ResearchTab from '@/components/dashboard/ResearchTab';
import CohortTab from '@/components/dashboard/CohortTab';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { getCohorts } from '@/lib/utils/cohortStorage';
import { logger } from '@/lib/logger';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('research');
  const [cohortCount, setCohortCount] = useState(0);
  const { filterOptions } = useFilterOptions();

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

  // Initial load on mount
  useEffect(() => {
    loadCohortCount();
  }, [loadCohortCount]);

  // Reload cohort count when switching to cohorts tab (backup mechanism)
  useEffect(() => {
    if (activeTab === 'cohorts') {
      loadCohortCount();
    }
  }, [activeTab, loadCohortCount]);

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

  return (
    <Container maxW="container.xl" py={8}>
      {/* Tabs Section */}
      <Tabs.Root
        defaultValue="research"
        variant="line"
        value={activeTab}
        onValueChange={(e) => setActiveTab(e.value)}
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
          <ResearchTab onCohortCreated={loadCohortCount} />
        </Tabs.Content>

        <Tabs.Content value="cohorts" mt={6}>
          <CohortTab onCohortCountChanged={loadCohortCount} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
