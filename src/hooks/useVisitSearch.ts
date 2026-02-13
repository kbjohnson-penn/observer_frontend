import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import {
  VisitSearchFilters,
  VisitSearchSort,
  VisitSearchResponse,
  VisitSearchResult,
} from '@/interfaces/research';
import { logger } from '@/lib/logger';

interface FilterSummary {
  totalVisits: number;
  filteredVisits: number;
  activeFilters: number;
}

interface UseVisitSearchReturn {
  results: VisitSearchResult[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filterSummary: FilterSummary | null;
  sort: VisitSearchSort;
  setFilters: (filters: VisitSearchFilters) => void;
  setSort: (sort: VisitSearchSort) => void;
  setPage: (page: number) => void;
}

/**
 * Hook for server-side visit search with filtering, sorting, and pagination
 * - Filters are debounced (300ms)
 * - Sort and page changes are instant
 */
export function useVisitSearch(): UseVisitSearchReturn {
  // Data state
  const [results, setResults] = useState<VisitSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query params
  const [filters, setFilters] = useState<VisitSearchFilters>({});
  const [sort, setSort] = useState<VisitSearchSort>({ field: 'id', direction: 'asc' });
  const [page, setPage] = useState(1);

  // Response metadata
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [filterSummary, setFilterSummary] = useState<FilterSummary | null>(null);

  // Track previous values to detect what changed
  const prevFiltersRef = useRef(filters);
  const prevSortRef = useRef(sort);

  // Fetch data
  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post<VisitSearchResponse>(
          `/research/private/visits-search/?page=${page}`,
          {
            filters,
            sort,
          }
        );

        setResults(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
        setFilterSummary({
          totalVisits: response.data.filter_summary.total_visits,
          filteredVisits: response.data.filter_summary.filtered_visits,
          activeFilters: response.data.filter_summary.active_filters,
        });
      } catch (err) {
        setError('Failed to search visits');
        logger.error('Visit search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Check if filters or sort changed
    const filtersChanged = prevFiltersRef.current !== filters;
    const sortChanged = prevSortRef.current !== sort;

    // Update refs
    prevFiltersRef.current = filters;
    prevSortRef.current = sort;

    // Reset to page 1 if filters or sort changed
    if ((filtersChanged || sortChanged) && page !== 1) {
      setPage(1);
      return; // Don't fetch yet, let the page change trigger the fetch
    }

    // Debounce only filter changes, fetch immediately for sort/page
    if (filtersChanged) {
      const timer = setTimeout(fetchVisits, 300);
      return () => clearTimeout(timer);
    } else {
      fetchVisits();
    }
  }, [filters, sort, page]);

  return {
    results,
    loading,
    error,
    pagination: {
      currentPage: page,
      totalCount,
      hasNext,
      hasPrevious,
    },
    filterSummary,
    sort,
    setFilters,
    setSort,
    setPage,
  };
}
