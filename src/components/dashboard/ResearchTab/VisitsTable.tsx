'use client';

import React, { useMemo } from 'react';
import { Box, VStack, HStack, Text, Table, Badge } from '@chakra-ui/react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { VisitSearchResult } from '@/interfaces/research';
import { VisitSearchSort } from '@/interfaces/research';
import { expandDemographic } from '@/lib/utils/utils';
import { COLORS } from '@/constants/colors';

interface VisitsTableProps {
  visits: VisitSearchResult[];
  sort: VisitSearchSort;
  onSort: (field: VisitSearchSort['field']) => void;
}

// Memoized table row component for performance
const VisitRow = React.memo(({ visit }: { visit: VisitSearchResult }) => {
  // Memoize expanded demographic labels
  const patientGenderLabel = useMemo(
    () => (visit.patient_gender ? expandDemographic(visit.patient_gender, 'gender') : null),
    [visit.patient_gender]
  );

  const patientRaceLabel = useMemo(
    () => (visit.patient_race ? expandDemographic(visit.patient_race, 'race') : null),
    [visit.patient_race]
  );

  const patientEthnicityLabel = useMemo(
    () =>
      visit.patient_ethnicity ? expandDemographic(visit.patient_ethnicity, 'ethnicity') : null,
    [visit.patient_ethnicity]
  );

  const providerGenderLabel = useMemo(
    () => (visit.provider_gender ? expandDemographic(visit.provider_gender, 'gender') : null),
    [visit.provider_gender]
  );

  const providerRaceLabel = useMemo(
    () => (visit.provider_race ? expandDemographic(visit.provider_race, 'race') : null),
    [visit.provider_race]
  );

  const providerEthnicityLabel = useMemo(
    () =>
      visit.provider_ethnicity ? expandDemographic(visit.provider_ethnicity, 'ethnicity') : null,
    [visit.provider_ethnicity]
  );

  const visitDate = useMemo(
    () => new Date(visit.visit_date).toLocaleDateString(),
    [visit.visit_date]
  );

  return (
    <Table.Row _hover={{ bg: COLORS.table.rowHoverBg, transition: 'all 0.2s' }}>
      <Table.Cell>
        <Text fontWeight="semibold" color="blue.600" fontSize="md">
          {visit.visit_id}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm">{visitDate}</Text>
      </Table.Cell>
      <Table.Cell>
        <Badge size="md" variant="subtle" colorPalette={COLORS.visitSource}>
          {visit.visit_source}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Badge
          size="md"
          colorPalette={COLORS.tier[visit.tier as keyof typeof COLORS.tier] || 'gray'}
        >
          Tier {visit.tier}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <VStack gap={1.5} align="start">
          <HStack gap={1.5} flexWrap="wrap">
            {visit.patient_age !== null && (
              <Badge size="md" colorPalette={COLORS.patientBadges.age} variant="subtle">
                Age {visit.patient_age}
              </Badge>
            )}
            {patientGenderLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.patientBadges.gender}>
                {patientGenderLabel}
              </Badge>
            )}
          </HStack>
          <HStack gap={1.5} flexWrap="wrap">
            {patientRaceLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.patientBadges.race}>
                {patientRaceLabel}
              </Badge>
            )}
            {patientEthnicityLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.patientBadges.ethnicity}>
                {patientEthnicityLabel}
              </Badge>
            )}
          </HStack>
        </VStack>
      </Table.Cell>
      <Table.Cell>
        <VStack gap={1.5} align="start">
          <HStack gap={1.5} flexWrap="wrap">
            {visit.provider_age !== null && (
              <Badge size="md" colorPalette={COLORS.providerBadges.age} variant="subtle">
                Age {visit.provider_age}
              </Badge>
            )}
            {providerGenderLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.providerBadges.gender}>
                {providerGenderLabel}
              </Badge>
            )}
          </HStack>
          <HStack gap={1.5} flexWrap="wrap">
            {providerRaceLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.providerBadges.race}>
                {providerRaceLabel}
              </Badge>
            )}
            {providerEthnicityLabel && (
              <Badge size="md" variant="outline" colorPalette={COLORS.providerBadges.ethnicity}>
                {providerEthnicityLabel}
              </Badge>
            )}
          </HStack>
        </VStack>
      </Table.Cell>
    </Table.Row>
  );
});

VisitRow.displayName = 'VisitRow';

// Sort icon component
function SortIcon({
  field,
  currentSort,
}: {
  field: VisitSearchSort['field'];
  currentSort: VisitSearchSort;
}) {
  const isActive = currentSort.field === field;
  if (!isActive) {
    return (
      <Box color="gray.400" fontSize="sm">
        <FaSort />
      </Box>
    );
  }
  return currentSort.direction === 'asc' ? (
    <Box color="blue.600" fontSize="sm">
      <FaSortUp />
    </Box>
  ) : (
    <Box color="blue.600" fontSize="sm">
      <FaSortDown />
    </Box>
  );
}

// Sortable header component
function SortableHeader({
  field,
  label,
  currentSort,
  onSort,
}: {
  field: VisitSearchSort['field'];
  label: string;
  currentSort: VisitSearchSort;
  onSort: (field: VisitSearchSort['field']) => void;
}) {
  const isActive = currentSort.field === field;
  return (
    <Table.ColumnHeader>
      <HStack
        cursor="pointer"
        onClick={() => onSort(field)}
        _hover={{ bg: COLORS.table.rowHoverBg }}
        p={2}
        borderRadius="md"
        whiteSpace="nowrap"
        transition="all 0.2s"
      >
        <Text
          fontWeight={isActive ? 'bold' : 'semibold'}
          color={isActive ? 'blue.700' : 'gray.700'}
        >
          {label}
        </Text>
        <SortIcon field={field} currentSort={currentSort} />
      </HStack>
    </Table.ColumnHeader>
  );
}

export default function VisitsTable({ visits, sort, onSort }: VisitsTableProps) {
  if (visits.length === 0) {
    return null;
  }

  return (
    <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
      <Table.Root size="sm" variant="outline" striped>
        <Table.Header bg="gray.50">
          <Table.Row>
            <SortableHeader field="id" label="Visit ID" currentSort={sort} onSort={onSort} />
            <SortableHeader
              field="visit_start_date"
              label="Visit Date"
              currentSort={sort}
              onSort={onSort}
            />
            <SortableHeader
              field="visit_source_value"
              label="Source"
              currentSort={sort}
              onSort={onSort}
            />
            <SortableHeader field="tier_id" label="Tier" currentSort={sort} onSort={onSort} />
            <Table.ColumnHeader>
              <Text fontWeight="semibold" color="gray.700" p={2}>
                Person Demographics
              </Text>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <Text fontWeight="semibold" color="gray.700" p={2}>
                Provider Demographics
              </Text>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visits.map((visit) => (
            <VisitRow key={visit.visit_id} visit={visit} />
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
