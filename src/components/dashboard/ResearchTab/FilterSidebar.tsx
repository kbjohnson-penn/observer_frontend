'use client';

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Collapsible,
  createListCollection,
} from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { LocalFilters, DemographicFilterValues } from '@/interfaces/researchTab';
import { FilterOptions } from '@/interfaces/research';
import DemographicFilters from './DemographicFilters';

interface FilterSidebarProps {
  localFilters: LocalFilters;
  filterOptions: FilterOptions;
  filterSummary: {
    filteredVisits: number;
    totalVisits: number;
  } | null;
  onFilterChange: (key: keyof LocalFilters, value: string | string[]) => void;
  onClearFilters: () => void;
  onSaveCohort?: () => void;
}

export default function FilterSidebar({
  localFilters,
  filterOptions,
  filterSummary,
  onFilterChange,
  onClearFilters,
  onSaveCohort,
}: FilterSidebarProps) {
  // Memoize visit source collection
  const visitSourceCollection = useMemo(
    () =>
      createListCollection({
        items: filterOptions.visit_options.visit_sources.map((vs) => ({
          label: vs,
          value: vs,
        })),
      }),
    [filterOptions.visit_options.visit_sources]
  );

  // Memoize tier collection
  const tierCollection = useMemo(
    () =>
      createListCollection({
        items: filterOptions.visit_options.tiers.map((t) => ({
          label: `Tier ${t}`,
          value: String(t),
        })),
      }),
    [filterOptions.visit_options.tiers]
  );

  // Handler for person demographic changes
  const handlePersonDemographicChange = (
    key: keyof DemographicFilterValues,
    value: string | string[]
  ) => {
    const filterKey = `person${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof LocalFilters;
    onFilterChange(filterKey, value);
  };

  // Handler for provider demographic changes
  const handleProviderDemographicChange = (
    key: keyof DemographicFilterValues,
    value: string | string[]
  ) => {
    const filterKey = `provider${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof LocalFilters;
    onFilterChange(filterKey, value);
  };

  return (
    <Box
      w="320px"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      h="fit-content"
      position="sticky"
      top={4}
      display={{ base: 'none', lg: 'block' }}
    >
      {/* Header */}
      <Box
        borderBottom="1px"
        borderColor="gray.200"
        px={5}
        py={4}
        bg="gray.50"
        borderTopRadius="lg"
      >
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="md" color="gray.700">
            Filters
          </Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="blue"
            onClick={onClearFilters}
            fontWeight="medium"
          >
            Clear All
          </Button>
        </HStack>
      </Box>

      {/* Filter Content */}
      <Box p={5}>
        <VStack gap={4} align="stretch">
          {/* Visit Details Section */}
          <Box>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              Visit Details
            </Text>
            <VStack gap={2.5} align="stretch">
              {/* Visit Source Select */}
              <Select.Root
                collection={visitSourceCollection}
                size="sm"
                multiple
                value={localFilters.visitSource}
                onValueChange={(details) => onFilterChange('visitSource', details.value)}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Visit Source">
                      {localFilters.visitSource.length > 0
                        ? `Visit Source: ${localFilters.visitSource.join(', ')}`
                        : null}
                    </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {visitSourceCollection.items.map((source) => (
                      <Select.Item item={source} key={source.value}>
                        {source.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>

              {/* Tier Select */}
              <Select.Root
                collection={tierCollection}
                size="sm"
                multiple
                value={localFilters.tier}
                onValueChange={(details) => onFilterChange('tier', details.value)}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Tier">
                      {localFilters.tier.length > 0
                        ? `Tier: ${localFilters.tier.map((t) => `Tier ${t}`).join(', ')}`
                        : null}
                    </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {tierCollection.items.map((tier) => (
                      <Select.Item item={tier} key={tier.value}>
                        {tier.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>

              {/* Date Range */}
              <HStack gap={2}>
                <Input
                  type="date"
                  placeholder="From"
                  size="sm"
                  value={localFilters.dateFrom}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  aria-label="Start date"
                />
                <Input
                  type="date"
                  placeholder="To"
                  size="sm"
                  value={localFilters.dateTo}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  aria-label="End date"
                />
              </HStack>
            </VStack>
          </Box>

          {/* Person Demographics */}
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger py={0} width="full">
              <HStack justify="space-between" width="full">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Person Demographics
                </Text>
                <Box color="gray.500" fontSize="xs">
                  <FaChevronDown />
                </Box>
              </HStack>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box mt={3}>
                <DemographicFilters
                  values={{
                    gender: localFilters.personGender,
                    race: localFilters.personRace,
                    ethnicity: localFilters.personEthnicity,
                    ageFrom: localFilters.personAgeFrom,
                    ageTo: localFilters.personAgeTo,
                  }}
                  onChange={handlePersonDemographicChange}
                  availableOptions={filterOptions.demographics}
                  keyPrefix="person"
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Provider Demographics */}
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger py={0} width="full">
              <HStack justify="space-between" width="full">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Provider Demographics
                </Text>
                <Box color="gray.500" fontSize="xs">
                  <FaChevronDown />
                </Box>
              </HStack>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Box mt={3}>
                <DemographicFilters
                  values={{
                    gender: localFilters.providerGender,
                    race: localFilters.providerRace,
                    ethnicity: localFilters.providerEthnicity,
                    ageFrom: localFilters.providerAgeFrom,
                    ageTo: localFilters.providerAgeTo,
                  }}
                  onChange={handleProviderDemographicChange}
                  availableOptions={filterOptions.demographics}
                  keyPrefix="provider"
                />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Summary and Actions */}
          <Box pt={3} borderTop="1px" borderColor="gray.100">
            <Text fontSize="xs" color="gray.600" mb={3} fontWeight="medium">
              {filterSummary
                ? `${filterSummary.filteredVisits} of ${filterSummary.totalVisits} visits`
                : 'Loading...'}
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              width="full"
              disabled={!filterSummary || filterSummary.filteredVisits === 0}
              onClick={onSaveCohort}
            >
              Save as Cohort
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
