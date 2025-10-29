'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Text, Tabs, HStack, Badge } from '@chakra-ui/react';
import { FaSearch, FaUsers } from 'react-icons/fa';
import ResearchTab from '@/components/dashboard/ResearchTab';
import CohortTab from '@/components/dashboard/CohortTab';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { getCohorts } from '@/lib/utils/cohortStorage';
import { logger } from '@/lib/logger';
import { COLORS } from '@/constants/colors';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('research');
  const [cohortCount, setCohortCount] = useState(0);
  const { filterOptions, loading: filterOptionsLoading } = useFilterOptions();

  // Load cohort count function (reusable for callbacks and tab switches)
  const loadCohortCount = useCallback(async () => {
    try {
      const cohorts = await getCohorts();
      setCohortCount(cohorts.length);
    } catch (error) {
      logger.error('Failed to load cohort count:', error);
    }
  }, []);

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

  // Calculate total available filters from filter options
  const calculateFilterCount = (): number => {
    if (!filterOptions) {
      return 0;
    }

    let count = 0;

    // Demographics filters
    count += filterOptions.demographics.genders.length;
    count += filterOptions.demographics.races.length;
    count += filterOptions.demographics.ethnicities.length;
    if (
      filterOptions.demographics.year_of_birth_range.min !== null ||
      filterOptions.demographics.year_of_birth_range.max !== null
    ) {
      count += 1; // Age range counts as 1 filter
    }

    // Visit filters
    count += filterOptions.visit_options.tiers.length;
    count += filterOptions.visit_options.visit_sources.length;
    if (
      filterOptions.visit_options.date_range.earliest ||
      filterOptions.visit_options.date_range.latest
    ) {
      count += 1; // Date range counts as 1 filter
    }

    // Clinical filters
    count += filterOptions.clinical_options.conditions.available_codes.length;
    count += filterOptions.clinical_options.labs.procedure_names.length;
    count += filterOptions.clinical_options.drugs.common_drugs.length;
    count += filterOptions.clinical_options.procedures.common_names.length;
    count += filterOptions.clinical_options.notes.note_types.length;
    count += filterOptions.clinical_options.observations.file_types.length;

    return count;
  };

  const totalVisits = filterOptions?.total_accessible_visits || 0;
  const filterCount = calculateFilterCount();

  return (
    <Container maxW="container.xl" py={8}>
      {/* Dashboard Statistics */}
      <DashboardStats
        totalVisits={totalVisits}
        cohortCount={cohortCount}
        filterCount={filterCount}
        isLoading={filterOptionsLoading}
      />

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
          <CohortTab key={activeTab === 'cohorts' ? `cohorts-${Date.now()}` : 'cohorts-inactive'} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
