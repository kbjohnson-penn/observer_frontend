"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Text,
  Button,
  VStack,
  HStack,
  Alert,
  Table,
  Badge,
  Flex,
  Input,
  Select,
  Skeleton,
  Stack,
  Collapsible,
  Separator,
  createListCollection,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown, FaChevronDown } from "react-icons/fa";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useVisitSearch } from "@/hooks/useVisitSearch";
import { VisitSearchFilters, VisitSearchSort } from "@/interfaces/research";
import { expandDemographic } from "@/lib/utils/utils";

export default function ResearchTab() {
  const { filterOptions, loading: filterOptionsLoading, error: filterOptionsError } = useFilterOptions();

  // Create collections from filter options
  const visitSourceCollection = createListCollection({
    items: filterOptions?.visit_options.visit_sources.map(vs => ({
      label: vs,
      value: vs
    })) || [],
  });

  const tierCollection = createListCollection({
    items: filterOptions?.visit_options.tiers.map(t => ({
      label: `Tier ${t}`,
      value: String(t)
    })) || [],
  });

  const genderCollection = createListCollection({
    items: filterOptions?.demographics.genders.map(g => ({
      label: expandDemographic(g, 'gender'),
      value: g
    })) || [],
  });

  const raceCollection = createListCollection({
    items: filterOptions?.demographics.races.map(r => ({
      label: expandDemographic(r, 'race'),
      value: r
    })) || [],
  });

  const ethnicityCollection = createListCollection({
    items: filterOptions?.demographics.ethnicities.map(e => ({
      label: expandDemographic(e, 'ethnicity'),
      value: e
    })) || [],
  });

  const {
    results: visits,
    loading: visitsLoading,
    error: visitsError,
    pagination,
    filterSummary,
    sort,
    setFilters: updateFilters,
    setSort,
    setPage,
  } = useVisitSearch();

  // Local filter state for form inputs
  const [localFilters, setLocalFilters] = useState({
    visitSource: [] as string[],
    tier: [] as string[],
    dateFrom: '',
    dateTo: '',
    // Person demographics
    personGender: [] as string[],
    personRace: [] as string[],
    personEthnicity: [] as string[],
    personAgeFrom: '',
    personAgeTo: '',
    // Provider demographics
    providerGender: [] as string[],
    providerRace: [] as string[],
    providerEthnicity: [] as string[],
    providerAgeFrom: '',
    providerAgeTo: '',
  });

  const handleSort = (field: VisitSearchSort['field']) => {
    const newDirection: 'asc' | 'desc' = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    const newSort: VisitSearchSort = { field, direction: newDirection };
    setSort(newSort);
  };

  const handleFilterChange = (key: keyof typeof localFilters, value: string | string[]) => {
    const newLocalFilters = { ...localFilters, [key]: value };
    setLocalFilters(newLocalFilters);

    // Build server-side filter object
    const serverFilters: VisitSearchFilters = {};

    // Visit filters
    if (newLocalFilters.tier.length > 0 || newLocalFilters.visitSource.length > 0 || newLocalFilters.dateFrom || newLocalFilters.dateTo) {
      serverFilters.visit = {};

      if (newLocalFilters.tier.length > 0) {
        serverFilters.visit.tier_id = newLocalFilters.tier.map(t => parseInt(t));
      }

      if (newLocalFilters.visitSource.length > 0) {
        serverFilters.visit.visit_source_value = newLocalFilters.visitSource.join(',');
      }

      if (newLocalFilters.dateFrom) {
        serverFilters.visit.date_from = newLocalFilters.dateFrom;
      }

      if (newLocalFilters.dateTo) {
        serverFilters.visit.date_to = newLocalFilters.dateTo;
      }
    }

    // Person demographics filters
    if (
      newLocalFilters.personGender.length > 0 ||
      newLocalFilters.personRace.length > 0 ||
      newLocalFilters.personEthnicity.length > 0 ||
      newLocalFilters.personAgeFrom ||
      newLocalFilters.personAgeTo
    ) {
      serverFilters.person_demographics = {};

      if (newLocalFilters.personGender.length > 0) {
        serverFilters.person_demographics.gender = newLocalFilters.personGender;
      }

      if (newLocalFilters.personRace.length > 0) {
        serverFilters.person_demographics.race = newLocalFilters.personRace;
      }

      if (newLocalFilters.personEthnicity.length > 0) {
        serverFilters.person_demographics.ethnicity = newLocalFilters.personEthnicity;
      }

      if (newLocalFilters.personAgeFrom || newLocalFilters.personAgeTo) {
        const currentYear = new Date().getFullYear();
        if (newLocalFilters.personAgeFrom) {
          serverFilters.person_demographics.year_of_birth_to = currentYear - parseInt(newLocalFilters.personAgeFrom);
        }
        if (newLocalFilters.personAgeTo) {
          serverFilters.person_demographics.year_of_birth_from = currentYear - parseInt(newLocalFilters.personAgeTo);
        }
      }
    }

    // Provider demographics filters
    if (
      newLocalFilters.providerGender.length > 0 ||
      newLocalFilters.providerRace.length > 0 ||
      newLocalFilters.providerEthnicity.length > 0 ||
      newLocalFilters.providerAgeFrom ||
      newLocalFilters.providerAgeTo
    ) {
      serverFilters.provider_demographics = {};

      if (newLocalFilters.providerGender.length > 0) {
        serverFilters.provider_demographics.gender = newLocalFilters.providerGender;
      }

      if (newLocalFilters.providerRace.length > 0) {
        serverFilters.provider_demographics.race = newLocalFilters.providerRace;
      }

      if (newLocalFilters.providerEthnicity.length > 0) {
        serverFilters.provider_demographics.ethnicity = newLocalFilters.providerEthnicity;
      }

      if (newLocalFilters.providerAgeFrom || newLocalFilters.providerAgeTo) {
        const currentYear = new Date().getFullYear();
        if (newLocalFilters.providerAgeFrom) {
          serverFilters.provider_demographics.year_of_birth_to = currentYear - parseInt(newLocalFilters.providerAgeFrom);
        }
        if (newLocalFilters.providerAgeTo) {
          serverFilters.provider_demographics.year_of_birth_from = currentYear - parseInt(newLocalFilters.providerAgeTo);
        }
      }
    }

    updateFilters(serverFilters);
  };

  const clearFilters = () => {
    setLocalFilters({
      visitSource: [],
      tier: [],
      dateFrom: '',
      dateTo: '',
      personGender: [],
      personRace: [],
      personEthnicity: [],
      personAgeFrom: '',
      personAgeTo: '',
      providerGender: [],
      providerRace: [],
      providerEthnicity: [],
      providerAgeFrom: '',
      providerAgeTo: '',
    });
    updateFilters({});
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: VisitSearchSort['field'] }) => {
    if (sort.field !== field) return <FaSort color="gray" />;
    return sort.direction === 'asc' ? <FaSortUp color="blue" /> : <FaSortDown color="blue" />;
  };

  const error = filterOptionsError || visitsError;

  if (filterOptionsLoading && !filterOptions) {
    return (
      <VStack gap={6} align="stretch">
        <Flex gap={6}>
          <Box
            w="300px"
            bg="white"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            display={{ base: "none", lg: "block" }}
          >
            <Stack gap={4}>
              <Skeleton height="20px" width="100px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="80px" />
              <Skeleton height="120px" />
              <Skeleton height="120px" />
            </Stack>
          </Box>
          <Box flex={1}>
            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <Skeleton height="24px" width="200px" />
              </Card.Header>
              <Card.Body>
                <Stack gap={2}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HStack key={i} gap={4}>
                      <Skeleton height="40px" width="80px" />
                      <Skeleton height="40px" width="120px" />
                      <Skeleton height="40px" width="100px" />
                      <Skeleton height="40px" width="80px" />
                      <Skeleton height="40px" flex="1" />
                      <Skeleton height="40px" flex="1" />
                    </HStack>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>
          </Box>
        </Flex>
      </VStack>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Error Alert */}
      {error && (
        <Alert.Root status="error">
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      {/* Main Content Area */}
      <Flex gap={6}>
        {/* Filter Sidebar */}
        <Box
          w="320px"
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          h="fit-content"
          position="sticky"
          top={4}
          display={{ base: "none", lg: "block" }}
        >
          <Box
            borderBottom="1px"
            borderColor="gray.200"
            px={5}
            py={4}
            bg="gray.50"
            borderTopRadius="lg"
          >
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="md" color="gray.700">Filters</Text>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={clearFilters}
                fontWeight="medium"
              >
                Clear All
              </Button>
            </HStack>
          </Box>
          <Box p={5}>

          <VStack gap={4} align="stretch">
            {/* Visit Details Section */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>Visit Details</Text>
              <VStack gap={2.5} align="stretch">
                <Select.Root
                  collection={visitSourceCollection}
                  size="sm"
                  multiple
                  value={localFilters.visitSource}
                  onValueChange={(details) => handleFilterChange('visitSource', details.value)}
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

                <Select.Root
                  collection={tierCollection}
                  size="sm"
                  multiple
                  value={localFilters.tier}
                  onValueChange={(details) => handleFilterChange('tier', details.value)}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Tier">
                        {localFilters.tier.length > 0
                          ? `Tier: ${localFilters.tier.map(t => `Tier ${t}`).join(', ')}`
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

                <HStack gap={2}>
                  <Input
                    type="date"
                    placeholder="From"
                    size="sm"
                    value={localFilters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    size="sm"
                    value={localFilters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </HStack>
              </VStack>
            </Box>

            {/* Person Demographics */}
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger py={0} width="full">
                <HStack justify="space-between" width="full">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">Person Demographics</Text>
                  <Box color="gray.500" fontSize="xs">
                    <FaChevronDown />
                  </Box>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <VStack gap={2.5} align="stretch" mt={3}>
                  <Select.Root
                    collection={genderCollection}
                    size="sm"
                    multiple
                    value={localFilters.personGender}
                    onValueChange={(details) => handleFilterChange('personGender', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Gender">
                          {localFilters.personGender.length > 0
                            ? `Gender: ${localFilters.personGender.map(g => expandDemographic(g, 'gender')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {genderCollection.items.map((gender) => (
                          <Select.Item item={gender} key={gender.value}>
                            {gender.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <Select.Root
                    collection={raceCollection}
                    size="sm"
                    multiple
                    value={localFilters.personRace}
                    onValueChange={(details) => handleFilterChange('personRace', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Race">
                          {localFilters.personRace.length > 0
                            ? `Race: ${localFilters.personRace.map(r => expandDemographic(r, 'race')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {raceCollection.items.map((race) => (
                          <Select.Item item={race} key={race.value}>
                            {race.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <Select.Root
                    collection={ethnicityCollection}
                    size="sm"
                    multiple
                    value={localFilters.personEthnicity}
                    onValueChange={(details) => handleFilterChange('personEthnicity', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Ethnicity">
                          {localFilters.personEthnicity.length > 0
                            ? `Ethnicity: ${localFilters.personEthnicity.map(e => expandDemographic(e, 'ethnicity')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {ethnicityCollection.items.map((ethnicity) => (
                          <Select.Item item={ethnicity} key={ethnicity.value}>
                            {ethnicity.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <HStack gap={2}>
                    <Input
                      type="number"
                      placeholder="Min Age"
                      size="sm"
                      value={localFilters.personAgeFrom}
                      onChange={(e) => handleFilterChange('personAgeFrom', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Age"
                      size="sm"
                      value={localFilters.personAgeTo}
                      onChange={(e) => handleFilterChange('personAgeTo', e.target.value)}
                    />
                  </HStack>
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>

            {/* Provider Demographics */}
            <Collapsible.Root defaultOpen>
              <Collapsible.Trigger py={0} width="full">
                <HStack justify="space-between" width="full">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">Provider Demographics</Text>
                  <Box color="gray.500" fontSize="xs">
                    <FaChevronDown />
                  </Box>
                </HStack>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <VStack gap={2.5} align="stretch" mt={3}>
                  <Select.Root
                    collection={genderCollection}
                    size="sm"
                    multiple
                    value={localFilters.providerGender}
                    onValueChange={(details) => handleFilterChange('providerGender', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Gender">
                          {localFilters.providerGender.length > 0
                            ? `Gender: ${localFilters.providerGender.map(g => expandDemographic(g, 'gender')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {genderCollection.items.map((gender) => (
                          <Select.Item item={gender} key={`provider-gender-${gender.value}`}>
                            {gender.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <Select.Root
                    collection={raceCollection}
                    size="sm"
                    multiple
                    value={localFilters.providerRace}
                    onValueChange={(details) => handleFilterChange('providerRace', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Race">
                          {localFilters.providerRace.length > 0
                            ? `Race: ${localFilters.providerRace.map(r => expandDemographic(r, 'race')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {raceCollection.items.map((race) => (
                          <Select.Item item={race} key={`provider-race-${race.value}`}>
                            {race.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <Select.Root
                    collection={ethnicityCollection}
                    size="sm"
                    multiple
                    value={localFilters.providerEthnicity}
                    onValueChange={(details) => handleFilterChange('providerEthnicity', details.value)}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Ethnicity">
                          {localFilters.providerEthnicity.length > 0
                            ? `Ethnicity: ${localFilters.providerEthnicity.map(e => expandDemographic(e, 'ethnicity')).join(', ')}`
                            : null}
                        </Select.ValueText>
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {ethnicityCollection.items.map((ethnicity) => (
                          <Select.Item item={ethnicity} key={`provider-ethnicity-${ethnicity.value}`}>
                            {ethnicity.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>

                  <HStack gap={2}>
                    <Input
                      type="number"
                      placeholder="Min Age"
                      size="sm"
                      value={localFilters.providerAgeFrom}
                      onChange={(e) => handleFilterChange('providerAgeFrom', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max Age"
                      size="sm"
                      value={localFilters.providerAgeTo}
                      onChange={(e) => handleFilterChange('providerAgeTo', e.target.value)}
                    />
                  </HStack>
                </VStack>
              </Collapsible.Content>
            </Collapsible.Root>

            {/* Summary and Actions */}
            <Box pt={3} borderTop="1px" borderColor="gray.100">
              <Text fontSize="xs" color="gray.600" mb={3} fontWeight="medium">
                {filterSummary
                  ? `${filterSummary.filteredVisits} of ${filterSummary.totalVisits} visits`
                  : 'Loading...'
                }
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                width="full"
                disabled={!filterSummary || filterSummary.filteredVisits === 0}
              >
                Save as Cohort
              </Button>
            </Box>
          </VStack>
          </Box>
        </Box>

        {/* Data Table */}
        <Box flex={1}>
          <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
            <Card.Header>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Research Visits</Text>
                <Text color="gray.600" fontSize="sm">
                  {filterSummary && pagination.totalCount > 0 && (
                    <>
                      Showing {((pagination.currentPage - 1) * 20) + 1}-
                      {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} visits
                      {filterSummary.activeFilters > 0 && (
                        <Text as="span" color="blue.600" fontSize="xs" ml={1}>
                          ({filterSummary.activeFilters} {filterSummary.activeFilters === 1 ? 'filter' : 'filters'} active)
                        </Text>
                      )}
                    </>
                  )}
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              {visitsLoading ? (
                <Box overflowX="auto">
                  <Stack gap={2}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HStack key={i} gap={4}>
                        <Skeleton height="40px" width="80px" />
                        <Skeleton height="40px" width="120px" />
                        <Skeleton height="40px" width="100px" />
                        <Skeleton height="40px" width="80px" />
                        <Skeleton height="40px" flex="1" />
                        <Skeleton height="40px" flex="1" />
                      </HStack>
                    ))}
                  </Stack>
                </Box>
              ) : visits.length > 0 ? (
                <Box overflowX="auto">
                  <Table.Root size="sm" variant="outline">
                    <Table.Header bg="gray.50">
                      <Table.Row>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('id')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                            whiteSpace="nowrap"
                          >
                            <Text>Visit ID</Text>
                            <SortIcon field="id" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('visit_start_date')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                            whiteSpace="nowrap"
                          >
                            <Text>Visit Date</Text>
                            <SortIcon field="visit_start_date" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('visit_source_value')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                            whiteSpace="nowrap"
                          >
                            <Text>Source</Text>
                            <SortIcon field="visit_source_value" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('tier_id')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                            whiteSpace="nowrap"
                          >
                            <Text>Tier</Text>
                            <SortIcon field="tier_id" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Person Demographics</Table.ColumnHeader>
                        <Table.ColumnHeader>Provider Demographics</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {visits.map((visit) => (
                        <Table.Row key={visit.visit_id}>
                          <Table.Cell>
                            <Text fontWeight="medium" color="blue.600">
                              {visit.visit_id}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize="sm">
                              {new Date(visit.visit_date).toLocaleDateString()}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge size="sm" variant="subtle">
                              {visit.visit_source}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="sm"
                              colorScheme={visit.tier === 1 ? "green" : visit.tier === 2 ? "yellow" : "red"}
                            >
                              Tier {visit.tier}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack gap={1} align="start">
                              <HStack gap={1} flexWrap="wrap">
                                {visit.patient_age !== null && (
                                  <Badge size="sm" colorScheme="blue">Age {visit.patient_age}</Badge>
                                )}
                                {visit.patient_gender && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.patient_gender, 'gender')}</Badge>
                                )}
                              </HStack>
                              <HStack gap={1} flexWrap="wrap">
                                {visit.patient_race && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.patient_race, 'race')}</Badge>
                                )}
                                {visit.patient_ethnicity && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.patient_ethnicity, 'ethnicity')}</Badge>
                                )}
                              </HStack>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell>
                            <VStack gap={1} align="start">
                              <HStack gap={1} flexWrap="wrap">
                                {visit.provider_age !== null && (
                                  <Badge size="sm" colorScheme="purple">Age {visit.provider_age}</Badge>
                                )}
                                {visit.provider_gender && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.provider_gender, 'gender')}</Badge>
                                )}
                              </HStack>
                              <HStack gap={1} flexWrap="wrap">
                                {visit.provider_race && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.provider_race, 'race')}</Badge>
                                )}
                                {visit.provider_ethnicity && (
                                  <Badge size="sm" variant="subtle">{expandDemographic(visit.provider_ethnicity, 'ethnicity')}</Badge>
                                )}
                              </HStack>
                            </VStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>

                  {/* Pagination */}
                  {pagination.totalCount > 20 && (
                    <HStack justify="space-between" mt={4} align="center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevious || visitsLoading}
                      >
                        Previous
                      </Button>

                      <HStack gap={2}>
                        {Array.from(
                          { length: Math.ceil(pagination.totalCount / 20) },
                          (_, i) => i + 1
                        )
                          .filter(page =>
                            page === 1 ||
                            page === Math.ceil(pagination.totalCount / 20) ||
                            Math.abs(page - pagination.currentPage) <= 2
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <Text color="gray.400">...</Text>
                              )}
                              <Button
                                size="sm"
                                variant={pagination.currentPage === page ? "solid" : "outline"}
                                bg={pagination.currentPage === page ? "blue.500" : "white"}
                                color={pagination.currentPage === page ? "white" : "gray.700"}
                                onClick={() => setPage(page)}
                                disabled={visitsLoading}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          ))
                        }
                      </HStack>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext || visitsLoading}
                      >
                        Next
                      </Button>
                    </HStack>
                  )}
                </Box>
              ) : (
                <VStack gap={4} py={8}>
                  <Text color="gray.600" textAlign="center">
                    No visits match your current filters. Try adjusting your search criteria.
                  </Text>
                  {filterSummary && filterSummary.activeFilters > 0 && (
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>
    </VStack>
  );
}
