'use client';

import React, { useMemo } from 'react';
import { Card, VStack, HStack, Text, Button, Badge } from '@chakra-ui/react';
import { FaTrash, FaEye, FaPencilAlt } from 'react-icons/fa';
import { Cohort, getCohortFilterSummary } from '@/interfaces/cohort';
import { COLORS } from '@/constants/colors';
import { COHORT_NAME_MAX_LENGTH } from '@/lib/utils/cohortValidation';

interface CohortCardProps {
  cohort: Cohort;
  onView: (cohort: Cohort) => void;
  onRename: (cohort: Cohort) => void;
  // TODO: Re-enable when duplicate functionality is ready
  onDuplicate?: (cohort: Cohort) => void;
  onDelete: (cohortId: string) => void;
  // TODO: Re-enable when export functionality is ready
  onExport?: (cohort: Cohort) => void;
}

export default function CohortCard({ cohort, onView, onRename, onDelete }: CohortCardProps) {
  // Memoize filter summary calculation
  const filterSummary = useMemo(() => getCohortFilterSummary(cohort.filters), [cohort.filters]);

  // Truncate name for display if too long
  const displayName = useMemo(() => {
    if (cohort.name.length <= COHORT_NAME_MAX_LENGTH) {
      return cohort.name;
    }
    return `${cohort.name.slice(0, COHORT_NAME_MAX_LENGTH)}...`;
  }, [cohort.name]);

  // Memoize formatted date
  const formattedDate = useMemo(
    () => new Date(cohort.createdAt).toLocaleDateString(),
    [cohort.createdAt]
  );

  return (
    <Card.Root
      bg="white"
      shadow="md"
      border="1px"
      borderColor="gray.200"
      transition="all 0.2s"
      _hover={{
        shadow: 'lg',
        borderColor: 'blue.300',
        transform: COLORS.animation.cardHoverLift,
      }}
    >
      <Card.Header>
        <VStack align="start" gap={1}>
          <Text fontWeight="semibold" fontSize="md" lineClamp={2} wordBreak="break-word">
            {displayName}
          </Text>
          {cohort.description && (
            <Text fontSize="xs" color="gray.600" lineClamp={2}>
              {cohort.description}
            </Text>
          )}
        </VStack>
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
            <HStack gap={2} flexWrap="wrap">
              {filterSummary.visitFilters > 0 && (
                <Badge size="sm" colorPalette="blue">
                  Visit: {filterSummary.visitFilters}
                </Badge>
              )}
              {filterSummary.personDemographicFilters > 0 && (
                <Badge size="sm" colorPalette="purple">
                  Patient: {filterSummary.personDemographicFilters}
                </Badge>
              )}
              {filterSummary.providerDemographicFilters > 0 && (
                <Badge size="sm" colorPalette="teal">
                  Provider: {filterSummary.providerDemographicFilters}
                </Badge>
              )}
              {filterSummary.clinicalFilters > 0 && (
                <Badge size="sm" colorPalette="orange">
                  Clinical: {filterSummary.clinicalFilters}
                </Badge>
              )}
            </HStack>
          )}

          {/* Actions */}
          <HStack gap={2} pt={2} justify="stretch">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(cohort)}
              flex={1}
              colorPalette="blue"
              color={COLORS.cohortActions.view}
            >
              <FaEye />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRename(cohort)}
              flex={1}
              colorPalette="yellow"
              color={COLORS.cohortActions.rename}
            >
              <FaPencilAlt />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(cohort.id)}
              flex={1}
              colorPalette="red"
              color={COLORS.cohortActions.delete}
              _hover={{ bg: 'red.50' }}
            >
              <FaTrash />
              Delete
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
