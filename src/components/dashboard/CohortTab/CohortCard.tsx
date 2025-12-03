'use client';

import React, { useMemo } from 'react';
import { Card, VStack, HStack, Text, Button, Badge, IconButton } from '@chakra-ui/react';
import { FaTrash, FaEye, FaPencilAlt } from 'react-icons/fa';
import { Cohort, getCohortFilterSummary } from '@/interfaces/cohort';
import { COLORS } from '@/constants/colors';

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
        transform: 'translateY(-2px)',
      }}
    >
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
            colorPalette="red"
            color={COLORS.cohortActions.delete}
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
          <HStack gap={2} pt={2}>
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
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Rename cohort"
              onClick={() => onRename(cohort)}
              colorPalette="yellow"
              color={COLORS.cohortActions.rename}
            >
              <FaPencilAlt />
            </IconButton>
            {/* TODO: Re-enable when duplicate functionality is ready
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Duplicate cohort"
              onClick={() => onDuplicate(cohort)}
              colorPalette="purple"
              color={COLORS.cohortActions.duplicate}
            >
              <FaCopy />
            </IconButton>
            */}
            {/* TODO: Re-enable when export functionality is ready
            <IconButton
              size="sm"
              variant="outline"
              aria-label="Export cohort"
              onClick={() => onExport(cohort)}
              colorPalette="green"
              color={COLORS.cohortActions.export}
            >
              <FaDownload />
            </IconButton>
            */}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
