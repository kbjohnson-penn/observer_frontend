'use client';

import React, { useMemo } from 'react';
import { Box, VStack, HStack, Text, Table, Badge, Tooltip } from '@chakra-ui/react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { VisitSearchResult } from '@/interfaces/research';
import { VisitSearchSort } from '@/interfaces/research';
import { expandDemographic, formatDateForDisplay } from '@/lib/utils/utils';
import { COLORS } from '@/constants/colors';

interface VisitsTableProps {
  visits: VisitSearchResult[];
  sort: VisitSearchSort;
  onSort: (field: VisitSearchSort['field']) => void;
}

// Format visit source: "clinic" -> "Clinic", "sim_center" -> "Sim Center"
function formatVisitSource(source: string): string {
  return source
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Memoized table row component for performance
const VisitRow = React.memo(({ visit }: { visit: VisitSearchResult }) => {
  // Memoize expanded demographic labels
  const patientGenderLabel = useMemo(
    () => expandDemographic(visit.patient_gender, 'gender'),
    [visit.patient_gender]
  );

  const patientRaceLabel = useMemo(
    () => expandDemographic(visit.patient_race, 'race'),
    [visit.patient_race]
  );

  const patientEthnicityLabel = useMemo(
    () => expandDemographic(visit.patient_ethnicity, 'ethnicity'),
    [visit.patient_ethnicity]
  );

  const providerGenderLabel = useMemo(
    () => expandDemographic(visit.provider_gender, 'gender'),
    [visit.provider_gender]
  );

  const providerRaceLabel = useMemo(
    () => expandDemographic(visit.provider_race, 'race'),
    [visit.provider_race]
  );

  const providerEthnicityLabel = useMemo(
    () => expandDemographic(visit.provider_ethnicity, 'ethnicity'),
    [visit.provider_ethnicity]
  );

  const visitDate = useMemo(() => formatDateForDisplay(visit.visit_date), [visit.visit_date]);

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
          {formatVisitSource(visit.visit_source)}
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
            <Tooltip.Root positioning={{ placement: 'top' }}>
              <Tooltip.Trigger asChild>
                <Badge
                  size="md"
                  colorPalette={visit.patient_age !== null ? COLORS.patientBadges.age : 'gray'}
                  variant={visit.patient_age !== null ? 'subtle' : 'outline'}
                >
                  {visit.patient_age !== null ? `Age ${visit.patient_age}` : 'N/A'}
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Text fontSize="xs">Age at time of visit</Text>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
            <Badge
              size="md"
              variant="outline"
              colorPalette={patientGenderLabel === 'N/A' ? 'gray' : COLORS.patientBadges.gender}
            >
              {patientGenderLabel}
            </Badge>
          </HStack>
          <HStack gap={1.5} flexWrap="wrap">
            <Badge
              size="md"
              variant="outline"
              colorPalette={patientRaceLabel === 'N/A' ? 'gray' : COLORS.patientBadges.race}
            >
              {patientRaceLabel}
            </Badge>
            <Badge
              size="md"
              variant="outline"
              colorPalette={
                patientEthnicityLabel === 'N/A' ? 'gray' : COLORS.patientBadges.ethnicity
              }
            >
              {patientEthnicityLabel}
            </Badge>
          </HStack>
        </VStack>
      </Table.Cell>
      <Table.Cell>
        <VStack gap={1.5} align="start">
          <HStack gap={1.5} flexWrap="wrap">
            <Tooltip.Root positioning={{ placement: 'top' }}>
              <Tooltip.Trigger asChild>
                <Badge
                  size="md"
                  colorPalette={visit.provider_age !== null ? COLORS.providerBadges.age : 'gray'}
                  variant={visit.provider_age !== null ? 'subtle' : 'outline'}
                >
                  {visit.provider_age !== null ? `Age ${visit.provider_age}` : 'N/A'}
                </Badge>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content>
                  <Text fontSize="xs">Age at time of visit</Text>
                  <Tooltip.Arrow>
                    <Tooltip.ArrowTip />
                  </Tooltip.Arrow>
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
            <Badge
              size="md"
              variant="outline"
              colorPalette={providerGenderLabel === 'N/A' ? 'gray' : COLORS.providerBadges.gender}
            >
              {providerGenderLabel}
            </Badge>
          </HStack>
          <HStack gap={1.5} flexWrap="wrap">
            <Badge
              size="md"
              variant="outline"
              colorPalette={providerRaceLabel === 'N/A' ? 'gray' : COLORS.providerBadges.race}
            >
              {providerRaceLabel}
            </Badge>
            <Badge
              size="md"
              variant="outline"
              colorPalette={
                providerEthnicityLabel === 'N/A' ? 'gray' : COLORS.providerBadges.ethnicity
              }
            >
              {providerEthnicityLabel}
            </Badge>
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
  tooltip,
}: {
  field: VisitSearchSort['field'];
  label: string;
  currentSort: VisitSearchSort;
  onSort: (field: VisitSearchSort['field']) => void;
  tooltip?: string;
}) {
  const isActive = currentSort.field === field;
  const headerContent = (
    <HStack
      cursor="pointer"
      onClick={() => onSort(field)}
      _hover={{ bg: COLORS.table.rowHoverBg }}
      p={2}
      borderRadius="md"
      whiteSpace="nowrap"
      transition="all 0.2s"
    >
      <Text fontWeight={isActive ? 'bold' : 'semibold'} color={isActive ? 'blue.700' : 'gray.700'}>
        {label}
      </Text>
      <SortIcon field={field} currentSort={currentSort} />
    </HStack>
  );

  return (
    <Table.ColumnHeader>
      {tooltip ? (
        <Tooltip.Root positioning={{ placement: 'top' }}>
          <Tooltip.Trigger asChild>{headerContent}</Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              <Text fontSize="xs">{tooltip}</Text>
              <Tooltip.Arrow>
                <Tooltip.ArrowTip />
              </Tooltip.Arrow>
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      ) : (
        headerContent
      )}
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
              tooltip="Date format: MM/DD/YYYY based on your browser locale"
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
                Patient Demographics
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
