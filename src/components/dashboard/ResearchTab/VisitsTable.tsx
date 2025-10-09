"use client";

import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Badge,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { VisitSearchResult } from "@/interfaces/research";
import { VisitSearchSort } from "@/interfaces/research";
import { expandDemographic } from "@/lib/utils/utils";

interface VisitsTableProps {
  visits: VisitSearchResult[];
  sort: VisitSearchSort;
  onSort: (field: VisitSearchSort['field']) => void;
}

// Memoized table row component for performance
const VisitRow = React.memo(({ visit }: { visit: VisitSearchResult }) => {
  // Memoize expanded demographic labels
  const patientGenderLabel = useMemo(
    () => visit.patient_gender ? expandDemographic(visit.patient_gender, 'gender') : null,
    [visit.patient_gender]
  );

  const patientRaceLabel = useMemo(
    () => visit.patient_race ? expandDemographic(visit.patient_race, 'race') : null,
    [visit.patient_race]
  );

  const patientEthnicityLabel = useMemo(
    () => visit.patient_ethnicity ? expandDemographic(visit.patient_ethnicity, 'ethnicity') : null,
    [visit.patient_ethnicity]
  );

  const providerGenderLabel = useMemo(
    () => visit.provider_gender ? expandDemographic(visit.provider_gender, 'gender') : null,
    [visit.provider_gender]
  );

  const providerRaceLabel = useMemo(
    () => visit.provider_race ? expandDemographic(visit.provider_race, 'race') : null,
    [visit.provider_race]
  );

  const providerEthnicityLabel = useMemo(
    () => visit.provider_ethnicity ? expandDemographic(visit.provider_ethnicity, 'ethnicity') : null,
    [visit.provider_ethnicity]
  );

  const visitDate = useMemo(
    () => new Date(visit.visit_date).toLocaleDateString(),
    [visit.visit_date]
  );

  return (
    <Table.Row>
      <Table.Cell>
        <Text fontWeight="medium" color="blue.600">
          {visit.visit_id}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="sm">{visitDate}</Text>
      </Table.Cell>
      <Table.Cell>
        <Badge size="sm" variant="subtle">
          {visit.visit_source}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Badge
          size="sm"
          colorScheme={
            visit.tier === 1 ? "green" : visit.tier === 2 ? "yellow" : "red"
          }
        >
          Tier {visit.tier}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <VStack gap={1} align="start">
          <HStack gap={1} flexWrap="wrap">
            {visit.patient_age !== null && (
              <Badge size="sm" colorScheme="blue">
                Age {visit.patient_age}
              </Badge>
            )}
            {patientGenderLabel && (
              <Badge size="sm" variant="subtle">
                {patientGenderLabel}
              </Badge>
            )}
          </HStack>
          <HStack gap={1} flexWrap="wrap">
            {patientRaceLabel && (
              <Badge size="sm" variant="subtle">
                {patientRaceLabel}
              </Badge>
            )}
            {patientEthnicityLabel && (
              <Badge size="sm" variant="subtle">
                {patientEthnicityLabel}
              </Badge>
            )}
          </HStack>
        </VStack>
      </Table.Cell>
      <Table.Cell>
        <VStack gap={1} align="start">
          <HStack gap={1} flexWrap="wrap">
            {visit.provider_age !== null && (
              <Badge size="sm" colorScheme="purple">
                Age {visit.provider_age}
              </Badge>
            )}
            {providerGenderLabel && (
              <Badge size="sm" variant="subtle">
                {providerGenderLabel}
              </Badge>
            )}
          </HStack>
          <HStack gap={1} flexWrap="wrap">
            {providerRaceLabel && (
              <Badge size="sm" variant="subtle">
                {providerRaceLabel}
              </Badge>
            )}
            {providerEthnicityLabel && (
              <Badge size="sm" variant="subtle">
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
function SortIcon({ field, currentSort }: { field: VisitSearchSort['field']; currentSort: VisitSearchSort }) {
  if (currentSort.field !== field) {
    return <FaSort color="gray" />;
  }
  return currentSort.direction === 'asc' ? (
    <FaSortUp color="blue" />
  ) : (
    <FaSortDown color="blue" />
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
  return (
    <Table.ColumnHeader>
      <HStack
        cursor="pointer"
        onClick={() => onSort(field)}
        _hover={{ bg: "gray.100" }}
        p={2}
        borderRadius="md"
        whiteSpace="nowrap"
      >
        <Text>{label}</Text>
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
    <Box overflowX="auto">
      <Table.Root size="sm" variant="outline">
        <Table.Header bg="gray.50">
          <Table.Row>
            <SortableHeader
              field="id"
              label="Visit ID"
              currentSort={sort}
              onSort={onSort}
            />
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
            <SortableHeader
              field="tier_id"
              label="Tier"
              currentSort={sort}
              onSort={onSort}
            />
            <Table.ColumnHeader>Person Demographics</Table.ColumnHeader>
            <Table.ColumnHeader>Provider Demographics</Table.ColumnHeader>
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
