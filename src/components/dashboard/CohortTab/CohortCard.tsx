'use client';

import React, { useMemo } from 'react';
import { Box, Card, VStack, HStack, Text, Button, Badge, IconButton } from '@chakra-ui/react';
import { FaTrash, FaEye, FaDownload, FaCopy } from 'react-icons/fa';
import { Cohort, getCohortFilterSummary } from '@/interfaces/cohort';

interface CohortCardProps {
  cohort: Cohort;
  onView: (cohort: Cohort) => void;
  onDuplicate: (cohort: Cohort) => void;
  onDelete: (cohortId: string) => void;
  onExport: (cohort: Cohort) => void;
}

export default function CohortCard({
  cohort,
  onView,
  onDuplicate,
  onDelete,
  onExport,
}: CohortCardProps) {
  // Memoize filter summary calculation
  const filterSummary = useMemo(() => getCohortFilterSummary(cohort.filters), [cohort.filters]);

  // Memoize formatted date
  const formattedDate = useMemo(
    () => new Date(cohort.createdAt).toLocaleDateString(),
    [cohort.createdAt]
  );

  return (
    <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
      <Card.Header>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={1} flex={1}>
            <Text fontWeight="semibold" fontSize="md" lineClamp={2}>
              {cohort.name}
            </Text>
            {cohort.description && (
              <Text fontSize="xs" color="gray.600" lineClamp={2}>
                {cohort.description}
              </Text>
            )}
          </VStack>
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Delete cohort"
            onClick={() => onDelete(cohort.id)}
            colorScheme="red"
          >
            <FaTrash />
          </IconButton>
        </HStack>
      </Card.Header>

      <Card.Body pt={2}>
        <VStack align="stretch" gap={3}>
          {/* Cohort Stats */}
          <HStack justify="space-between">
            <VStack align="start" gap={0}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {cohort.visitCount.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.600">
                visits
              </Text>
            </VStack>
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="gray.600">
                Created
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formattedDate}
              </Text>
            </VStack>
          </HStack>

          {/* Filter Summary */}
          {filterSummary.totalActiveFilters > 0 && (
            <Box>
              <Text fontSize="xs" color="gray.600" mb={1}>
                Applied Filters ({filterSummary.totalActiveFilters}):
              </Text>
              <HStack wrap="wrap" gap={1}>
                {filterSummary.visitFilters > 0 && (
                  <Badge size="sm" variant="subtle" colorScheme="blue">
                    Visit ({filterSummary.visitFilters})
                  </Badge>
                )}
                {filterSummary.personDemographicFilters > 0 && (
                  <Badge size="sm" variant="subtle" colorScheme="green">
                    Person ({filterSummary.personDemographicFilters})
                  </Badge>
                )}
                {filterSummary.providerDemographicFilters > 0 && (
                  <Badge size="sm" variant="subtle" colorScheme="purple">
                    Provider ({filterSummary.providerDemographicFilters})
                  </Badge>
                )}
                {filterSummary.clinicalFilters > 0 && (
                  <Badge size="sm" variant="subtle" colorScheme="orange">
                    Clinical ({filterSummary.clinicalFilters})
                  </Badge>
                )}
              </HStack>
            </Box>
          )}

          {/* Actions */}
          <HStack gap={2} pt={2}>
            <Button size="sm" variant="outline" onClick={() => onView(cohort)} flex={1}>
              <FaEye />
              View
            </Button>
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Duplicate cohort"
              onClick={() => onDuplicate(cohort)}
            >
              <FaCopy />
            </IconButton>
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Export cohort"
              onClick={() => onExport(cohort)}
            >
              <FaDownload />
            </IconButton>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
