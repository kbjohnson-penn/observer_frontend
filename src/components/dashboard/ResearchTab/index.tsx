"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Alert,
  Flex,
  Stack,
  Skeleton,
} from "@chakra-ui/react";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { useVisitSearch } from "@/hooks/useVisitSearch";
import { VisitSearchSort } from "@/interfaces/research";
import { LocalFilters, INITIAL_LOCAL_FILTERS } from "@/interfaces/researchTab";
import { buildServerFilters } from "@/lib/utils/filterTransformer";
import { createCohort } from "@/lib/utils/cohortStorage";
import { CohortCreateRequest } from "@/interfaces/cohort";
import { logger } from "@/lib/logger";
import FilterSidebar from "./FilterSidebar";
import VisitsTable from "./VisitsTable";
import PaginationControls from "./PaginationControls";
import LoadingSkeleton from "./LoadingSkeleton";
import CreateCohortDialog from "../CohortTab/CreateCohortDialog";

export default function ResearchTab() {
  const { filterOptions, loading: filterOptionsLoading, error: filterOptionsError } = useFilterOptions();

  const {
    results: visits,
    loading: visitsLoading,
    error: visitsError,
    pagination,
    filterSummary,
    sort,
    setFilters: updateFilters,
    setSort,
    setPage,
  } = useVisitSearch();

  // Local filter state for form inputs
  const [localFilters, setLocalFilters] = useState<LocalFilters>(INITIAL_LOCAL_FILTERS);

  // Cohort dialog state
  const [isCohortDialogOpen, setIsCohortDialogOpen] = useState(false);
  const [cohortSuccess, setCohortSuccess] = useState(false);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof LocalFilters, value: string | string[]) => {
    setLocalFilters((prev) => {
      const newLocalFilters = { ...prev, [key]: value };

      // Build and apply server-side filters
      const serverFilters = buildServerFilters(newLocalFilters);
      updateFilters(serverFilters);

      return newLocalFilters;
    });
  }, [updateFilters]);

  // Handle sort changes
  const handleSort = useCallback((field: VisitSearchSort['field']) => {
    const newDirection: 'asc' | 'desc' = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    const newSort: VisitSearchSort = { field, direction: newDirection };
    setSort(newSort);
  }, [sort, setSort]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setLocalFilters(INITIAL_LOCAL_FILTERS);
    updateFilters({});
  }, [updateFilters]);

  // Handle save cohort
  const handleSaveCohort = useCallback(() => {
    setIsCohortDialogOpen(true);
  }, []);

  // Handle cohort creation
  const handleCreateCohort = useCallback(async (cohortData: CohortCreateRequest) => {
    try {
      await createCohort(cohortData);
      setCohortSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setCohortSuccess(false);
      }, 3000);
    } catch (error) {
      logger.error('Failed to create cohort:', error);
      // Error is already handled and shown in CreateCohortDialog
      throw error; // Re-throw so dialog can display error
    }
  }, []);

  const error = filterOptionsError || visitsError;

  // Show loading skeleton on initial load
  if (filterOptionsLoading && !filterOptions) {
    return <LoadingSkeleton />;
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Error Alert */}
      {error && (
        <Alert.Root status="error">
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      {/* Success Alert */}
      {cohortSuccess && (
        <Alert.Root status="success">
          <Alert.Title>Cohort saved successfully! View it in the Cohorts tab.</Alert.Title>
        </Alert.Root>
      )}

      {/* Main Content Area */}
      {filterOptions && (
        <Flex gap={6}>
          {/* Filter Sidebar */}
          <FilterSidebar
            localFilters={localFilters}
            filterOptions={filterOptions}
            filterSummary={filterSummary}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onSaveCohort={handleSaveCohort}
          />

          {/* Data Table */}
          <Box flex={1}>
            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Research Visits</Text>
                  <Text color="gray.600" fontSize="sm">
                    {filterSummary && pagination.totalCount > 0 && (
                      <>
                        Showing {((pagination.currentPage - 1) * 20) + 1}-
                        {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} visits
                        {filterSummary.activeFilters > 0 && (
                          <Text as="span" color="blue.600" fontSize="xs" ml={1}>
                            ({filterSummary.activeFilters} {filterSummary.activeFilters === 1 ? 'filter' : 'filters'} active)
                          </Text>
                        )}
                      </>
                    )}
                  </Text>
                </HStack>
              </Card.Header>
              <Card.Body>
                {visitsLoading ? (
                  <Box overflowX="auto">
                    <Stack gap={2}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <HStack key={i} gap={4}>
                          <Skeleton height="40px" width="80px" />
                          <Skeleton height="40px" width="120px" />
                          <Skeleton height="40px" width="100px" />
                          <Skeleton height="40px" width="80px" />
                          <Skeleton height="40px" flex="1" />
                          <Skeleton height="40px" flex="1" />
                        </HStack>
                      ))}
                    </Stack>
                  </Box>
                ) : visits.length > 0 ? (
                  <>
                    <VisitsTable
                      visits={visits}
                      sort={sort}
                      onSort={handleSort}
                    />
                    <PaginationControls
                      currentPage={pagination.currentPage}
                      totalCount={pagination.totalCount}
                      hasNext={pagination.hasNext}
                      hasPrevious={pagination.hasPrevious}
                      loading={visitsLoading}
                      onPageChange={setPage}
                    />
                  </>
                ) : (
                  <VStack gap={4} py={8}>
                    <Text color="gray.600" textAlign="center">
                      No visits match your current filters. Try adjusting your search criteria.
                    </Text>
                    {filterSummary && filterSummary.activeFilters > 0 && (
                      <Button size="sm" variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </Box>
        </Flex>
      )}

      {/* Create Cohort Dialog */}
      {filterSummary && (
        <CreateCohortDialog
          isOpen={isCohortDialogOpen}
          onClose={() => setIsCohortDialogOpen(false)}
          onSave={handleCreateCohort}
          filters={buildServerFilters(localFilters)}
          visitCount={filterSummary.filteredVisits}
        />
      )}
    </VStack>
  );
}
