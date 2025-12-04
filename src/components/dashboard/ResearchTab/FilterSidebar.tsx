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
  Badge,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import {
  FaChevronDown,
  FaFilter,
  FaCalendar,
  FaUsers,
  FaUserMd,
  FaSave,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaTimes,
} from 'react-icons/fa';
import { LocalFilters, DemographicFilterValues } from '@/interfaces/researchTab';
import { FilterOptions } from '@/interfaces/research';
import DemographicFilters from './DemographicFilters';
import { COLORS } from '@/constants/colors';
import { getAllTiersTooltip } from '@/constants/tierInfo';

/**
 * Maps visit source values to their display labels
 */
const VISIT_SOURCE_LABELS: Record<string, string> = {
  clinic: 'Clinic',
  simcenter: 'Sim Center',
  pennpersonalizedcare: 'Penn Personalized Care',
};

/**
 * Gets the display label for a visit source value
 * Falls back to Title Case formatting for unknown values
 */
function formatVisitSourceLabel(value: string): string {
  if (VISIT_SOURCE_LABELS[value.toLowerCase()]) {
    return VISIT_SOURCE_LABELS[value.toLowerCase()];
  }
  // Fallback: split on underscores and capitalize
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

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
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.visitSource.length > 0) {
      count++;
    }
    if (localFilters.tier.length > 0) {
      count++;
    }
    if (localFilters.dateFrom || localFilters.dateTo) {
      count++;
    }
    if (localFilters.personGender.length > 0) {
      count++;
    }
    if (localFilters.personRace.length > 0) {
      count++;
    }
    if (localFilters.personEthnicity.length > 0) {
      count++;
    }
    if (localFilters.personAgeFrom || localFilters.personAgeTo) {
      count++;
    }
    if (localFilters.providerGender.length > 0) {
      count++;
    }
    if (localFilters.providerRace.length > 0) {
      count++;
    }
    if (localFilters.providerEthnicity.length > 0) {
      count++;
    }
    if (localFilters.providerAgeFrom || localFilters.providerAgeTo) {
      count++;
    }
    return count;
  }, [localFilters]);

  // Memoize visit source collection with formatted labels
  const visitSourceCollection = useMemo(
    () =>
      createListCollection({
        items: filterOptions.visit_options.visit_sources.map((vs) => ({
          label: formatVisitSourceLabel(vs),
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
      boxShadow="lg"
      border="1px"
      borderColor="gray.200"
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
          <HStack gap={2}>
            <Box color={COLORS.ui.filterIcon} fontSize="md">
              <FaFilter />
            </Box>
            <Text fontWeight="bold" fontSize="md" color="gray.700">
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <Badge
                colorPalette={COLORS.ui.dashboard.activeFiltersBadge}
                variant="solid"
                fontSize="xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </HStack>
          <Button
            size="xs"
            variant="ghost"
            colorPalette="blue"
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
            <HStack gap={2} mb={3}>
              <Box color={COLORS.ui.visitDetailsIcon} fontSize="sm">
                <FaCalendar />
              </Box>
              <Text fontSize="md" fontWeight="semibold" color="gray.700">
                Visit Details
              </Text>
            </HStack>
            <VStack gap={3} align="stretch">
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
                        ? `Visit Source: ${localFilters.visitSource.map(formatVisitSourceLabel).join(', ')}`
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

              <Box flex={1}>
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
              </Box>
              {/* Link to full tier comparison table */}
              <Link href="/dataset" target="_blank" rel="noopener noreferrer">
                <HStack gap={1} fontSize="xs" color="blue.600" _hover={{ color: 'blue.800' }}>
                  <FaExternalLinkAlt size={10} />
                  <Text>View full tier comparison table</Text>
                </HStack>
              </Link>

              {/* Date Range */}
              <VStack gap={1} align="stretch">
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
                {(localFilters.dateFrom || localFilters.dateTo) && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="gray"
                    onClick={() => {
                      onFilterChange('dateFrom', '');
                      onFilterChange('dateTo', '');
                    }}
                  >
                    <FaTimes /> Clear dates
                  </Button>
                )}
              </VStack>
            </VStack>
          </Box>

          <Box borderTop="1px solid" borderColor="gray.200" />

          {/* Patient Demographics */}
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger
              py={2}
              px={3}
              width="full"
              borderRadius="md"
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              <HStack justify="space-between" width="full">
                <HStack gap={2}>
                  <Box color={COLORS.ui.personDemographicsIcon} fontSize="sm">
                    <FaUsers />
                  </Box>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    Patient Demographics
                  </Text>
                </HStack>
                <Box color={COLORS.researchTab.chevronIcon} fontSize="sm">
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

          <Box borderTop="1px solid" borderColor="gray.200" />

          {/* Provider Demographics */}
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger
              py={2}
              px={3}
              width="full"
              borderRadius="md"
              _hover={{ bg: 'gray.50' }}
              transition="all 0.2s"
            >
              <HStack justify="space-between" width="full">
                <HStack gap={2}>
                  <Box color={COLORS.ui.providerDemographicsIcon} fontSize="sm">
                    <FaUserMd />
                  </Box>
                  <Text fontSize="md" fontWeight="semibold" color="gray.700">
                    Provider Demographics
                  </Text>
                </HStack>
                <Box color={COLORS.researchTab.chevronIcon} fontSize="sm">
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
          <Box pt={4} borderTop="2px" borderColor="blue.100">
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>
                  FILTERED RESULTS
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="blue.600">
                  {filterSummary ? `${filterSummary.filteredVisits.toLocaleString()}` : '...'}{' '}
                  <Text as="span" fontSize="sm" fontWeight="normal" color="gray.600">
                    of {filterSummary ? filterSummary.totalVisits.toLocaleString() : '...'} visits
                  </Text>
                </Text>
              </Box>
              <Button
                size="md"
                colorPalette="blue"
                width="full"
                disabled={!filterSummary || filterSummary.filteredVisits === 0}
                onClick={onSaveCohort}
              >
                <HStack gap={2}>
                  <Box as={FaSave} color={COLORS.researchTab.saveIcon} />
                  <Text>Save as Cohort</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
