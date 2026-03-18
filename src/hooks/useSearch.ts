import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import {
  EncounterSearchFilters,
  EncounterSearchSort,
  EncounterSearchHit,
  EncounterSearchResponse,
  SearchAggregations,
} from '@/interfaces/search';
import { logger } from '@/lib/logger';
import { useDebounce } from './useDebounce';

interface UseEncounterSearchReturn {
  results: EncounterSearchHit[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  aggregations: SearchAggregations | null;
  query: string;
  sort: EncounterSearchSort;
  setQuery: (query: string) => void;
  setFilters: (filters: EncounterSearchFilters) => void;
  setSort: (sort: EncounterSearchSort) => void;
  setPage: (page: number) => void;
}

const DEFAULT_AGGREGATIONS: SearchAggregations = {
  departments: [],
  patient_genders: [],
  patient_races: [],
  patient_ethnicities: [],
  provider_genders: [],
  provider_races: [],
  provider_ethnicities: [],
  tier_distribution: [],
  note_types: [],
  file_types: [],
};

const DEFAULT_SORT: EncounterSearchSort = { _score: 'desc' };

/**
 * Hook for encounter search using the Observer Elasticsearch API.
 * - No auto-fetch on empty query + empty filters (shows empty state on page load)
 * - Query/filter changes are debounced 300ms
 * - Sort and page changes are immediate
 */
export function useEncounterSearch(): UseEncounterSearchReturn {
  const [results, setResults] = useState<EncounterSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aggregations, setAggregations] = useState<SearchAggregations | null>(null);

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<EncounterSearchFilters>({});
  const [sort, setSort] = useState<EncounterSearchSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const debouncedQuery = useDebounce(query, 300);
  const debouncedFilters = useDebounce(filters, 300);

  // Reset to page 1 when debounced query, filters, or sort change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, debouncedFilters, sort]);

  useEffect(() => {
    const hasQuery = debouncedQuery.trim().length > 0;
    const hasFilters = Object.keys(debouncedFilters).length > 0;

    if (!hasQuery && !hasFilters) {
      setResults([]);
      setTotalCount(0);
      setHasNext(false);
      setHasPrevious(false);
      setAggregations(DEFAULT_AGGREGATIONS);
      return;
    }

    let cancelled = false;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post<EncounterSearchResponse>(
          '/search/private/encounters/',
          {
            query: debouncedQuery,
            filters: debouncedFilters,
            sort,
            page,
            page_size: 20,
          }
        );

        if (cancelled) {
          return;
        }

        setResults(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(response.data.next !== null);
        setHasPrevious(response.data.previous !== null);
        setAggregations(response.data.aggregations);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError('Search failed. Please try again.');
        logger.error('Encounter search error:', err);
        setResults([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, debouncedFilters, sort, page]);

  const handleSetQuery = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleSetFilters = useCallback((f: EncounterSearchFilters) => {
    setFilters(f);
  }, []);

  return {
    results,
    loading,
    error,
    pagination: { currentPage: page, totalCount, hasNext, hasPrevious },
    aggregations,
    query,
    sort,
    setQuery: handleSetQuery,
    setFilters: handleSetFilters,
    setSort,
    setPage,
  };
}
