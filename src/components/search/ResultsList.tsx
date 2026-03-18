'use client';

import { VStack, Text, Box, Skeleton, Stack, HStack, Icon } from '@chakra-ui/react';
import { HiSearch } from 'react-icons/hi';
import { EncounterSearchHit, EncounterSearchSort } from '@/interfaces/search';
import ResultCard from './ResultCard';

interface ResultsListProps {
  results: EncounterSearchHit[];
  loading: boolean;
  totalCount: number;
  hasSearched: boolean;
  sort?: EncounterSearchSort;
  onSelect?: (hit: EncounterSearchHit) => void;
}

function LoadingSkeleton() {
  return (
    <Stack gap={3}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} height="120px" borderRadius="lg" />
      ))}
    </Stack>
  );
}

export default function ResultsList({
  results,
  loading,
  totalCount,
  hasSearched,
  sort,
  onSelect,
}: ResultsListProps) {
  const sortLabel = sort?.visit_date
    ? `sorted by date (${sort.visit_date === 'asc' ? 'oldest first' : 'newest first'})`
    : sort?.tier_level
      ? `sorted by tier (${sort.tier_level})`
      : 'sorted by relevance';
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!hasSearched) {
    return (
      <Box py={20} textAlign="center">
        <Box color="gray.300" mb={4} display="flex" justifyContent="center">
          <HiSearch size={48} />
        </Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.500" mb={1}>
          Search encounters
        </Text>
        <Text fontSize="sm" color="gray.400">
          Enter a query or apply filters to find encounters.
        </Text>
      </Box>
    );
  }

  if (results.length === 0) {
    return (
      <Box py={20} textAlign="center">
        <Box color="gray.300" mb={4} display="flex" justifyContent="center">
          <HiSearch size={48} />
        </Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.500" mb={1}>
          No encounters found
        </Text>
        <Text fontSize="sm" color="gray.400">
          Try adjusting your search query or filters.
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={3} align="stretch">
      <HStack justify="space-between" pb={1}>
        <Text fontSize="sm" color="gray.500">
          <Text as="span" fontWeight="bold" color="gray.800">
            {totalCount.toLocaleString()}
          </Text>{' '}
          encounter{totalCount !== 1 ? 's' : ''} found
        </Text>
        <Text fontSize="xs" color="gray.400">
          {sortLabel}
        </Text>
      </HStack>
      {results.map((hit) => (
        <ResultCard key={hit.encounter_id} hit={hit} onSelect={onSelect} />
      ))}
    </VStack>
  );
}
