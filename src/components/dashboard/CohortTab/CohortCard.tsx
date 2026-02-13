'use client';

import React, { useMemo } from 'react';
import { Card, VStack, HStack, Text, Button, Badge, Box } from '@chakra-ui/react';
import { FaTrash, FaEye, FaPencilAlt } from 'react-icons/fa';
import { Cohort, getDetailedFilterSummary } from '@/interfaces/cohort';
import { COLORS } from '@/constants/colors';
import { COHORT_NAME_MAX_LENGTH } from '@/lib/utils/cohortValidation';
import { formatVisitSource, expandDemographic, formatDateForDisplay } from '@/lib/utils/utils';

// Maximum number of badges to show before showing "+N more"
const MAX_BADGES_PER_CATEGORY = 3;

/**
 * Hook to handle badge overflow logic
 * Returns visible badges and remaining count for "+N more" display
 */
function useBadgeLimit<T extends React.ReactNode>(
  badges: T[],
  limit: number = MAX_BADGES_PER_CATEGORY
) {
  const visibleBadges = badges.slice(0, limit);
  const remainingCount = Math.max(0, badges.length - limit);
  return { visibleBadges, remainingCount, hasOverflow: remainingCount > 0 };
}

/**
 * Placeholder text shown when no filters are applied for a category
 */
function EmptyFilterPlaceholder() {
  return (
    <Text fontSize="xs" color="gray.400" fontStyle="italic">
      None
    </Text>
  );
}

interface DemographicData {
  gender: string[];
  race: string[];
  ethnicity: string[];
  yearOfBirthFrom: number | null;
  yearOfBirthTo: number | null;
}

interface DemographicFilterSectionProps {
  label: string;
  colorPalette: string;
  labelColor: string;
  demographics: DemographicData;
  keyPrefix: string;
}

function DemographicFilterSection({
  label,
  colorPalette,
  labelColor,
  demographics,
  keyPrefix,
}: DemographicFilterSectionProps) {
  const hasFilters =
    demographics.gender.length > 0 ||
    demographics.race.length > 0 ||
    demographics.ethnicity.length > 0 ||
    demographics.yearOfBirthFrom !== null ||
    demographics.yearOfBirthTo !== null;

  // Collect all badges to apply overflow limit
  const allBadges: React.ReactNode[] = [];

  if (hasFilters) {
    demographics.gender.forEach((g) => {
      allBadges.push(
        <Badge key={`${keyPrefix}g-${g}`} size="sm" colorPalette={colorPalette} variant="subtle">
          {expandDemographic(g, 'gender')}
        </Badge>
      );
    });

    demographics.race.forEach((r) => {
      allBadges.push(
        <Badge key={`${keyPrefix}r-${r}`} size="sm" colorPalette={colorPalette} variant="subtle">
          {expandDemographic(r, 'race')}
        </Badge>
      );
    });

    demographics.ethnicity.forEach((e) => {
      allBadges.push(
        <Badge key={`${keyPrefix}e-${e}`} size="sm" colorPalette={colorPalette} variant="subtle">
          {expandDemographic(e, 'ethnicity')}
        </Badge>
      );
    });

    if (demographics.yearOfBirthFrom !== null || demographics.yearOfBirthTo !== null) {
      allBadges.push(
        <Badge key={`${keyPrefix}yob`} size="sm" colorPalette={colorPalette} variant="subtle">
          {demographics.yearOfBirthFrom !== null && demographics.yearOfBirthTo !== null
            ? `Born ${demographics.yearOfBirthFrom}-${demographics.yearOfBirthTo}`
            : demographics.yearOfBirthFrom !== null
              ? `Born ≥${demographics.yearOfBirthFrom}`
              : `Born ≤${demographics.yearOfBirthTo}`}
        </Badge>
      );
    }
  }

  const { visibleBadges, hasOverflow, remainingCount } = useBadgeLimit(allBadges);

  return (
    <Box>
      <HStack gap={1} flexWrap="wrap" align="center">
        <Text fontSize="xs" color={labelColor} fontWeight="medium" minW="40px">
          {label}:
        </Text>
        {hasFilters ? (
          <>
            {visibleBadges}
            {hasOverflow && (
              <Badge size="sm" colorPalette={colorPalette} variant="outline">
                +{remainingCount} more
              </Badge>
            )}
          </>
        ) : (
          <EmptyFilterPlaceholder />
        )}
      </HStack>
    </Box>
  );
}

interface VisitData {
  tiers: number[];
  visitSources: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

interface VisitFilterSectionProps {
  visit: VisitData;
}

function VisitFilterSection({ visit }: VisitFilterSectionProps) {
  const hasFilters =
    visit.tiers.length > 0 || visit.visitSources.length > 0 || visit.dateFrom || visit.dateTo;

  // Collect all badges to apply overflow limit
  const allBadges: React.ReactNode[] = [];

  if (hasFilters) {
    visit.tiers.forEach((tier) => {
      allBadges.push(
        <Badge key={`tier-${tier}`} size="sm" colorPalette="blue" variant="subtle">
          Tier {tier}
        </Badge>
      );
    });

    visit.visitSources.forEach((source) => {
      allBadges.push(
        <Badge key={`source-${source}`} size="sm" colorPalette="blue" variant="subtle">
          {formatVisitSource(source)}
        </Badge>
      );
    });

    if (visit.dateFrom || visit.dateTo) {
      allBadges.push(
        <Badge key="date-range" size="sm" colorPalette="blue" variant="subtle">
          {visit.dateFrom && visit.dateTo
            ? `${formatDateForDisplay(visit.dateFrom)} - ${formatDateForDisplay(visit.dateTo)}`
            : visit.dateFrom
              ? `From ${formatDateForDisplay(visit.dateFrom)}`
              : `To ${formatDateForDisplay(visit.dateTo)}`}
        </Badge>
      );
    }
  }

  const { visibleBadges, hasOverflow, remainingCount } = useBadgeLimit(allBadges);

  return (
    <Box>
      <HStack gap={1} flexWrap="wrap" align="center">
        <Text fontSize="xs" color="blue.600" fontWeight="medium" minW="40px">
          Visit:
        </Text>
        {hasFilters ? (
          <>
            {visibleBadges}
            {hasOverflow && (
              <Badge size="sm" colorPalette="blue" variant="outline">
                +{remainingCount} more
              </Badge>
            )}
          </>
        ) : (
          <EmptyFilterPlaceholder />
        )}
      </HStack>
    </Box>
  );
}

interface CohortCardProps {
  cohort: Cohort;
  onView: (cohort: Cohort) => void;
  onRename: (cohort: Cohort) => void;
  onDelete: (cohortId: string) => void;
}

export default function CohortCard({ cohort, onView, onRename, onDelete }: CohortCardProps) {
  // Memoize detailed filter summary calculation
  const filterDetails = useMemo(() => getDetailedFilterSummary(cohort.filters), [cohort.filters]);

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

          {/* Filter Summary - Always show all categories with labels */}
          <VStack align="stretch" gap={2}>
            {/* Visit Filters */}
            <VisitFilterSection visit={filterDetails.visit} />

            {/* Patient Demographic Filters */}
            <DemographicFilterSection
              label="Patient"
              colorPalette="purple"
              labelColor="purple.600"
              demographics={filterDetails.personDemographics}
              keyPrefix="p"
            />

            {/* Provider Demographic Filters */}
            <DemographicFilterSection
              label="Provider"
              colorPalette="teal"
              labelColor="teal.600"
              demographics={filterDetails.providerDemographics}
              keyPrefix="pr"
            />

            {/* TODO: Add Clinical Filters section when clinical filtering is implemented */}
          </VStack>

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
