'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, Tabs, HStack, Badge } from '@chakra-ui/react';
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

  // Load cohort count on mount
  useEffect(() => {
    const loadCohortCount = async () => {
      try {
        const cohorts = await getCohorts();
        setCohortCount(cohorts.length);
      } catch (error) {
        logger.error('Failed to load cohort count:', error);
      }
    };
    loadCohortCount();
  }, []);

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
      {/* Header Section */}
      <Box mb={8} bg="blue.50" p={6} borderRadius="lg" border="1px" borderColor="blue.100">
        <Heading size={{ base: 'xl', md: '2xl' }} color="gray.900" mb={2}>
          Research Dashboard
        </Heading>
        <Text color="gray.700" fontSize="md">
          Explore Observer dataset and create custom cohorts for your research studies.
        </Text>
      </Box>

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
        <Tabs.List gap={6}>
          <Tabs.Trigger value="research">
            <HStack gap={2}>
              <FaSearch />
              <Text>Research Data</Text>
              {totalVisits > 0 && (
                <Badge
                  colorPalette={COLORS.ui.dashboard.researchDataTabBadge}
                  variant="subtle"
                  ml={1}
                >
                  {totalVisits.toLocaleString()}
                </Badge>
              )}
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="cohorts">
            <HStack gap={2}>
              <FaUsers />
              <Text>Cohorts</Text>
              {cohortCount > 0 && (
                <Badge colorPalette={COLORS.ui.dashboard.cohortsTabBadge} variant="subtle" ml={1}>
                  {cohortCount}
                </Badge>
              )}
            </HStack>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="research" mt={6}>
          <ResearchTab />
        </Tabs.Content>

        <Tabs.Content value="cohorts" mt={6}>
          <CohortTab key={activeTab === 'cohorts' ? `cohorts-${Date.now()}` : 'cohorts-inactive'} />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}
