'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Box, Container, HStack, Spinner, Center, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEncounterSearch } from '@/hooks';
import { EncounterSearchFilters, EncounterSearchHit } from '@/interfaces/search';
import SearchBar from '@/components/search/SearchBar';
import FacetSidebar from '@/components/search/FacetSidebar';
import ResultsList from '@/components/search/ResultsList';
import PaginationControls from '@/components/dashboard/ResearchTab/PaginationControls';
import VisitDetailDrawer from '@/components/search/VisitDetailDrawer';

function SearchLoading() {
  return (
    <Center h="50vh">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    results,
    loading,
    error,
    pagination,
    aggregations,
    query,
    setQuery,
    setFilters,
    setPage,
  } = useEncounterSearch();

  const [localFilters, setLocalFilters] = useState<EncounterSearchFilters>({});
  const [selectedVisit, setSelectedVisit] = useState<EncounterSearchHit | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasSearched = query.trim().length > 0 || Object.keys(localFilters).length > 0;

  const activeFilterCount = Object.values(localFilters).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null
  ).length;

  function handleFilterChange(filters: EncounterSearchFilters) {
    setLocalFilters(filters);
    setFilters(filters);
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Hero search bar */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" shadow="sm" pt={6} pb={4}>
        <Container maxW="container.xl" px={6}>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={4}>
            Encounter Search
          </Text>
          <SearchBar
            value={query}
            onChange={setQuery}
            totalCount={pagination.totalCount}
            hasSearched={hasSearched}
            activeFilterCount={activeFilterCount}
          />
          {error && (
            <Box mt={3} p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
              <Text color="red.600" fontSize="sm">
                {error}
              </Text>
            </Box>
          )}
        </Container>
      </Box>

      {/* Main layout */}
      <Container maxW="container.xl" px={6} py={6}>
        <HStack align="flex-start" gap={6}>
          <Box position="sticky" top="20px" maxH="calc(100vh - 100px)" overflowY="auto">
            <FacetSidebar
              filters={localFilters}
              aggregations={aggregations}
              onChange={handleFilterChange}
            />
          </Box>

          <Box flex={1} minW={0}>
            <ResultsList
              results={results}
              loading={loading}
              totalCount={pagination.totalCount}
              hasSearched={hasSearched}
              onSelect={setSelectedVisit}
            />

            {hasSearched && !loading && pagination.totalCount > 0 && (
              <Box mt={4}>
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalCount={pagination.totalCount}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  loading={loading}
                  onPageChange={setPage}
                />
              </Box>
            )}
          </Box>
        </HStack>
      </Container>

      <VisitDetailDrawer
        visitSourceId={selectedVisit ? parseInt(selectedVisit.encounter_id) : null}
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />
    </Box>
  );
}
