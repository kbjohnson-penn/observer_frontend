'use client';

import React, { useMemo } from 'react';
import { Card, VStack, HStack, Text, Button, Badge, Box } from '@chakra-ui/react';
import { FaTrash, FaEye, FaPencilAlt, FaSearch } from 'react-icons/fa';
import { Cohort, getDetailedFilterSummary, getSearchFilterCount } from '@/interfaces/cohort';
import { VisitSearchFilters } from '@/interfaces/research';
import { EncounterSearchFilters } from '@/interfaces/search';
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

/**
 * Simple summary for search-source cohorts (flat EncounterSearchFilters).
 */
function SearchFilterSummary({
  filters,
  encounterIds,
  searchQuery,
}: {
  filters: EncounterSearchFilters;
  encounterIds?: string[] | null;
  searchQuery?: string;
}) {
  if (encounterIds && encounterIds.length > 0) {
    return (
      <HStack gap={1} flexWrap="wrap">
        <Badge size="sm" colorPalette="blue" variant="subtle">
          {encounterIds.length} selected encounter{encounterIds.length !== 1 ? 's' : ''}
        </Badge>
      </HStack>
    );
  }

  const activeCount = getSearchFilterCount(filters);
  const badges: React.ReactNode[] = [];

  if (searchQuery) {
    badges.push(
      <Badge key="q" size="sm" colorPalette="blue" variant="subtle">
        query: {searchQuery.length > 20 ? `${searchQuery.slice(0, 20)}...` : searchQuery}
      </Badge>
    );
  }
  if (filters.department && filters.department.length > 0) {
    badges.push(
      <Badge key="dept" size="sm" colorPalette="orange" variant="subtle">
        {filters.department.join(', ')}
      </Badge>
    );
  }
  if (filters.date_from || filters.date_to) {
    const label =
      filters.date_from && filters.date_to
        ? `${filters.date_from} – ${filters.date_to}`
        : filters.date_from
          ? `from ${filters.date_from}`
          : `to ${filters.date_to}`;
    badges.push(
      <Badge key="date" size="sm" colorPalette="blue" variant="subtle">
        {label}
      </Badge>
    );
  }
  if (filters.patient_gender && filters.patient_gender.length > 0) {
    badges.push(
      <Badge key="pg" size="sm" colorPalette="purple" variant="subtle">
        {filters.patient_gender.join(', ')}
      </Badge>
    );
  }

  return (
    <VStack align="stretch" gap={1}>
      {badges.length > 0 ? (
        <HStack gap={1} flexWrap="wrap">
          {badges}
        </HStack>
      ) : (
        <Text fontSize="xs" color="gray.400" fontStyle="italic">
          {activeCount > 0
            ? `${activeCount} filter${activeCount !== 1 ? 's' : ''} applied`
            : 'No filters'}
        </Text>
      )}
    </VStack>
  );
}

export default function CohortCard({ cohort, onView, onRename, onDelete }: CohortCardProps) {
  const isSearchSource = cohort.source === 'search';

  // Only compute research filter details for research-source cohorts
  const filterDetails = useMemo(
    () => (isSearchSource ? null : getDetailedFilterSummary(cohort.filters as VisitSearchFilters)),
    [cohort.filters, isSearchSource]
  );

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
          {isSearchSource ? (
            <VStack align="stretch" gap={2}>
              <HStack gap={1}>
                <FaSearch size={10} color="gray" />
                <Badge size="sm" colorPalette="blue" variant="outline">
                  Search
                </Badge>
              </HStack>
              <SearchFilterSummary
                filters={cohort.filters as EncounterSearchFilters}
                encounterIds={cohort.encounterIds}
                searchQuery={cohort.searchQuery}
              />
            </VStack>
          ) : filterDetails ? (
            <VStack align="stretch" gap={2}>
              <VisitFilterSection visit={filterDetails.visit} />
              <DemographicFilterSection
                label="Patient"
                colorPalette="purple"
                labelColor="purple.600"
                demographics={filterDetails.personDemographics}
                keyPrefix="p"
              />
              <DemographicFilterSection
                label="Provider"
                colorPalette="teal"
                labelColor="teal.600"
                demographics={filterDetails.providerDemographics}
                keyPrefix="pr"
              />
            </VStack>
          ) : null}

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
