'use client';

import React, { useMemo, useState, useCallback } from 'react';
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
  Link,
} from '@chakra-ui/react';
import {
  FaChevronDown,
  FaFilter,
  FaCalendar,
  FaUsers,
  FaUserMd,
  FaSave,
  FaExternalLinkAlt,
  FaTimes,
} from 'react-icons/fa';
import { LocalFilters, DemographicFilterValues } from '@/interfaces/researchTab';
import { FilterOptions } from '@/interfaces/research';
import { formatVisitSource } from '@/lib/utils/utils';
import DemographicFilters from './DemographicFilters';
import { COLORS } from '@/constants/colors';
import {
  PERSON_DEMOGRAPHIC_KEY_MAP,
  PROVIDER_DEMOGRAPHIC_KEY_MAP,
  STICKY_SIDEBAR_TOP,
} from '@/constants';

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
  // Collapsible section states
  const [isVisitDetailsOpen, setIsVisitDetailsOpen] = useState(false);
  const [isPatientDemographicsOpen, setIsPatientDemographicsOpen] = useState(false);
  const [isProviderDemographicsOpen, setIsProviderDemographicsOpen] = useState(false);

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

  // Check if visit details has active filters
  const hasVisitDetailsFilters = useMemo(() => {
    return (
      localFilters.visitSource.length > 0 ||
      localFilters.tier.length > 0 ||
      !!localFilters.dateFrom ||
      !!localFilters.dateTo
    );
  }, [localFilters.visitSource, localFilters.tier, localFilters.dateFrom, localFilters.dateTo]);

  // Check if patient demographics has active filters
  const hasPatientDemographicFilters = useMemo(() => {
    return (
      localFilters.personGender.length > 0 ||
      localFilters.personRace.length > 0 ||
      localFilters.personEthnicity.length > 0 ||
      !!localFilters.personAgeFrom ||
      !!localFilters.personAgeTo
    );
  }, [
    localFilters.personGender,
    localFilters.personRace,
    localFilters.personEthnicity,
    localFilters.personAgeFrom,
    localFilters.personAgeTo,
  ]);

  // Check if provider demographics has active filters
  const hasProviderDemographicFilters = useMemo(() => {
    return (
      localFilters.providerGender.length > 0 ||
      localFilters.providerRace.length > 0 ||
      localFilters.providerEthnicity.length > 0 ||
      !!localFilters.providerAgeFrom ||
      !!localFilters.providerAgeTo
    );
  }, [
    localFilters.providerGender,
    localFilters.providerRace,
    localFilters.providerEthnicity,
    localFilters.providerAgeFrom,
    localFilters.providerAgeTo,
  ]);

  // Memoize visit source collection with formatted labels
  const visitSourceCollection = useMemo(
    () =>
      createListCollection({
        items: filterOptions.visit_options.visit_sources.map((vs) => ({
          label: formatVisitSource(vs),
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

  // Handler for person demographic changes (memoized to prevent unnecessary re-renders)
  const handlePersonDemographicChange = useCallback(
    (key: keyof DemographicFilterValues, value: string | string[]) => {
      onFilterChange(PERSON_DEMOGRAPHIC_KEY_MAP[key], value);
    },
    [onFilterChange]
  );

  // Handler for provider demographic changes (memoized to prevent unnecessary re-renders)
  const handleProviderDemographicChange = useCallback(
    (key: keyof DemographicFilterValues, value: string | string[]) => {
      onFilterChange(PROVIDER_DEMOGRAPHIC_KEY_MAP[key], value);
    },
    [onFilterChange]
  );

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
      top={STICKY_SIDEBAR_TOP}
      zIndex={10}
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
            variant="outline"
            onClick={onClearFilters}
            fontWeight="medium"
            bg="white"
            color="gray.600"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="sm"
            px={2.5}
            py={1}
            fontSize="xs"
            _hover={{ bg: 'gray.50', borderColor: 'gray.400', color: 'gray.700' }}
          >
            Clear All
          </Button>
        </HStack>
      </Box>

      {/* Filter Content */}
      <Box p={5}>
        <VStack gap={4} align="stretch">
          {/* Visit Details Section */}
          <Box
            borderLeft="3px solid"
            borderLeftColor={hasVisitDetailsFilters ? 'blue.500' : 'transparent'}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Collapsible.Root
              open={isVisitDetailsOpen}
              onOpenChange={(details) => setIsVisitDetailsOpen(details.open)}
            >
              <Collapsible.Trigger
                py={3}
                px={3}
                width="full"
                borderRadius="md"
                bg={hasVisitDetailsFilters ? 'blue.50' : 'transparent'}
                _hover={{ bg: hasVisitDetailsFilters ? 'blue.100' : 'gray.100' }}
                transition="all 0.2s"
              >
                <HStack justify="space-between" width="full">
                  <HStack gap={2}>
                    <Box color={COLORS.ui.visitDetailsIcon} fontSize="sm">
                      <FaCalendar />
                    </Box>
                    <Text fontSize="md" fontWeight="semibold" color="gray.700">
                      Visit Details
                    </Text>
                    {hasVisitDetailsFilters && (
                      <Badge colorPalette="blue" variant="subtle" fontSize="xs">
                        Active
                      </Badge>
                    )}
                  </HStack>
                  <Box
                    color={COLORS.researchTab.chevronIcon}
                    fontSize="sm"
                    transform={isVisitDetailsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 0.2s ease-in-out"
                  >
                    <FaChevronDown />
                  </Box>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Box pt={2} pb={3} px={3}>
                  <VStack gap={3} align="stretch">
                    {/* Visit Source Select */}
                    <Select.Root
                      collection={visitSourceCollection}
                      size="sm"
                      variant="outline"
                      multiple
                      value={localFilters.visitSource}
                      onValueChange={(details) => onFilterChange('visitSource', details.value)}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger
                          borderColor="gray.300"
                          bg="white"
                          _hover={{ borderColor: 'gray.400' }}
                        >
                          <Select.ValueText placeholder="Visit Source" fontSize="sm">
                            {localFilters.visitSource.length > 0 ? (
                              <Text as="span" fontSize="sm">
                                <Text as="span" color="gray.500" fontWeight="normal" fontSize="sm">
                                  Visit Source:{' '}
                                </Text>
                                <Text
                                  as="span"
                                  fontWeight="semibold"
                                  color="gray.800"
                                  fontSize="sm"
                                >
                                  {localFilters.visitSource.length === 1
                                    ? formatVisitSource(localFilters.visitSource[0])
                                    : `${localFilters.visitSource.length} selected`}
                                </Text>
                              </Text>
                            ) : null}
                          </Select.ValueText>
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {visitSourceCollection.items.map((source) => (
                            <Select.Item item={source} key={source.value} fontSize="sm">
                              {source.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>

                    <Select.Root
                      collection={tierCollection}
                      size="sm"
                      variant="outline"
                      multiple
                      value={localFilters.tier}
                      onValueChange={(details) => onFilterChange('tier', details.value)}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger
                          borderColor="gray.300"
                          bg="white"
                          _hover={{ borderColor: 'gray.400' }}
                        >
                          <Select.ValueText placeholder="Tier" fontSize="sm">
                            {localFilters.tier.length > 0 ? (
                              <Text as="span" fontSize="sm">
                                <Text as="span" color="gray.500" fontWeight="normal" fontSize="sm">
                                  Tier:{' '}
                                </Text>
                                <Text
                                  as="span"
                                  fontWeight="semibold"
                                  color="gray.800"
                                  fontSize="sm"
                                >
                                  {localFilters.tier.length === 1
                                    ? `Tier ${localFilters.tier[0]}`
                                    : `${localFilters.tier.length} selected`}
                                </Text>
                              </Text>
                            ) : null}
                          </Select.ValueText>
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content>
                          {tierCollection.items.map((tier) => (
                            <Select.Item item={tier} key={tier.value} fontSize="sm">
                              {tier.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                    {/* Link to full tier comparison table */}
                    <Link
                      href="/dataset#data-access-tiers"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HStack gap={1} fontSize="xs" color="blue.600" _hover={{ color: 'blue.800' }}>
                        <FaExternalLinkAlt size={10} />
                        <Text>View full tier comparison table</Text>
                      </HStack>
                    </Link>

                    {/* Date Range */}
                    <VStack gap={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Date Range
                      </Text>
                      <HStack gap={2}>
                        <Input
                          type="date"
                          placeholder="From"
                          size="sm"
                          fontSize="sm"
                          value={localFilters.dateFrom}
                          onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                          max={localFilters.dateTo || undefined}
                          aria-label="Start date"
                          bg="white"
                          borderColor="gray.300"
                          color={localFilters.dateFrom ? 'gray.800' : 'gray.400'}
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                          }}
                        />
                        <Input
                          type="date"
                          placeholder="To"
                          size="sm"
                          fontSize="sm"
                          value={localFilters.dateTo}
                          onChange={(e) => onFilterChange('dateTo', e.target.value)}
                          min={localFilters.dateFrom || undefined}
                          aria-label="End date"
                          bg="white"
                          borderColor="gray.300"
                          color={localFilters.dateTo ? 'gray.800' : 'gray.400'}
                          _hover={{ borderColor: 'gray.400' }}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                          }}
                        />
                      </HStack>
                      {(localFilters.dateFrom || localFilters.dateTo) && (
                        <Button
                          type="button"
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
              </Collapsible.Content>
            </Collapsible.Root>
          </Box>

          <Box borderTop="1px solid" borderColor="gray.200" />

          {/* Patient Demographics */}
          <Box
            borderLeft="3px solid"
            borderLeftColor={hasPatientDemographicFilters ? 'green.500' : 'transparent'}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Collapsible.Root
              open={isPatientDemographicsOpen}
              onOpenChange={(details) => setIsPatientDemographicsOpen(details.open)}
            >
              <Collapsible.Trigger
                py={3}
                px={3}
                width="full"
                borderRadius="md"
                bg={hasPatientDemographicFilters ? 'green.50' : 'transparent'}
                _hover={{ bg: hasPatientDemographicFilters ? 'green.100' : 'gray.100' }}
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
                    {hasPatientDemographicFilters && (
                      <Badge colorPalette="green" variant="subtle" fontSize="xs">
                        Active
                      </Badge>
                    )}
                  </HStack>
                  <Box
                    color={COLORS.researchTab.chevronIcon}
                    fontSize="sm"
                    transform={isPatientDemographicsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 0.2s ease-in-out"
                  >
                    <FaChevronDown />
                  </Box>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Box pt={2} pb={3} px={3}>
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
          </Box>

          <Box borderTop="1px solid" borderColor="gray.200" />

          {/* Provider Demographics */}
          <Box
            borderLeft="3px solid"
            borderLeftColor={hasProviderDemographicFilters ? 'purple.500' : 'transparent'}
            borderRadius="md"
            transition="all 0.2s"
          >
            <Collapsible.Root
              open={isProviderDemographicsOpen}
              onOpenChange={(details) => setIsProviderDemographicsOpen(details.open)}
            >
              <Collapsible.Trigger
                py={3}
                px={3}
                width="full"
                borderRadius="md"
                bg={hasProviderDemographicFilters ? 'purple.50' : 'transparent'}
                _hover={{ bg: hasProviderDemographicFilters ? 'purple.100' : 'gray.100' }}
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
                    {hasProviderDemographicFilters && (
                      <Badge colorPalette="purple" variant="subtle" fontSize="xs">
                        Active
                      </Badge>
                    )}
                  </HStack>
                  <Box
                    color={COLORS.researchTab.chevronIcon}
                    fontSize="sm"
                    transform={isProviderDemographicsOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 0.2s ease-in-out"
                  >
                    <FaChevronDown />
                  </Box>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Box pt={2} pb={3} px={3}>
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
          </Box>

          <Box borderTop="1px solid" borderColor="gray.200" />

          {/* Summary and Actions */}
          <Box
            p={4}
            bg="blue.50"
            borderRadius="md"
            borderLeft="3px solid"
            borderLeftColor="blue.500"
          >
            <VStack gap={3} align="stretch">
              <Box>
                <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
                  FILTERED RESULTS
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.700">
                  {filterSummary ? `${filterSummary.filteredVisits.toLocaleString()}` : '...'}{' '}
                  <Text as="span" fontSize="sm" fontWeight="normal" color="gray.600">
                    of {filterSummary ? filterSummary.totalVisits.toLocaleString() : '...'} visits
                  </Text>
                </Text>
              </Box>
              <Button
                size="md"
                variant="solid"
                width="full"
                disabled={!filterSummary || filterSummary.filteredVisits === 0}
                onClick={onSaveCohort}
                fontWeight="semibold"
                bg="blue.600"
                color="white"
                borderRadius="md"
                py={2}
                _hover={{
                  bg: 'blue.700',
                  transform: 'translateY(-1px)',
                  boxShadow: 'md',
                }}
                _disabled={{
                  bg: 'gray.300',
                  color: 'gray.500',
                  cursor: 'not-allowed',
                  transform: 'none',
                  boxShadow: 'none',
                }}
                transition="all 0.2s"
              >
                <HStack gap={2}>
                  <FaSave />
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
