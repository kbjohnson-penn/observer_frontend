'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Box, Button, Container, HStack, Spinner, Center, Text } from '@chakra-ui/react';
import { FaSave, FaCheckSquare, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEncounterSearch } from '@/hooks';
import { EncounterSearchFilters, EncounterSearchHit } from '@/interfaces/search';
import { Cohort } from '@/interfaces/cohort';
import SearchBar from '@/components/search/SearchBar';
import FacetSidebar from '@/components/search/FacetSidebar';
import ResultsList from '@/components/search/ResultsList';
import PaginationControls from '@/components/dashboard/ResearchTab/PaginationControls';
import VisitDetailDrawer from '@/components/search/VisitDetailDrawer';
import SaveSearchCohortDialog, { SaveCohortMode } from '@/components/search/SaveSearchCohortDialog';
import { toaster } from '@/components/ui/toaster';

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

  // --- Cohort save dialog ---
  const [saveCohortOpen, setSaveCohortOpen] = useState(false);
  const [saveCohortMode, setSaveCohortMode] = useState<SaveCohortMode>('search');

  // --- Selection mode ---
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  function handleToggleSelect(encounterId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(encounterId)) {
        next.delete(encounterId);
      } else {
        next.add(encounterId);
      }
      return next;
    });
  }

  function handleSaveSearch() {
    setSaveCohortMode('search');
    setSaveCohortOpen(true);
  }

  function handleSaveSelected() {
    setSaveCohortMode('selected');
    setSaveCohortOpen(true);
  }

  function handleCohortSaved(cohort: Cohort) {
    toaster.create({
      title: 'Cohort saved',
      description: `"${cohort.name}" created with ${cohort.visitCount.toLocaleString()} encounters.`,
      type: 'success',
      duration: 4000,
    });
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  const showToolbar = hasSearched && !loading && pagination.totalCount > 0;

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
            {/* Cohort toolbar */}
            {showToolbar && (
              <HStack mb={3} gap={2} flexWrap="wrap">
                {!selectionMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="blue"
                      onClick={handleSaveSearch}
                    >
                      <FaSave />
                      Save Search as Cohort
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="gray"
                      onClick={() => setSelectionMode(true)}
                    >
                      <FaCheckSquare />
                      Select Encounters
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      colorPalette="blue"
                      onClick={handleSaveSelected}
                      disabled={selectedIds.size === 0}
                    >
                      <FaSave />
                      Save {selectedIds.size} Selected
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="gray"
                      onClick={exitSelectionMode}
                    >
                      <FaTimes />
                      Cancel
                    </Button>
                    {selectedIds.size > 0 && (
                      <Text fontSize="xs" color="gray.500">
                        {selectedIds.size} encounter{selectedIds.size !== 1 ? 's' : ''} selected
                      </Text>
                    )}
                  </>
                )}
              </HStack>
            )}

            <ResultsList
              results={results}
              loading={loading}
              totalCount={pagination.totalCount}
              hasSearched={hasSearched}
              onSelect={selectionMode ? undefined : setSelectedVisit}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
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

      <SaveSearchCohortDialog
        isOpen={saveCohortOpen}
        onClose={() => setSaveCohortOpen(false)}
        onSaved={handleCohortSaved}
        mode={saveCohortMode}
        filters={localFilters}
        query={query}
        totalCount={pagination.totalCount}
        encounterIds={saveCohortMode === 'selected' ? Array.from(selectedIds) : undefined}
      />
    </Box>
  );
}
