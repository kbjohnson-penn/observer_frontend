import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { FilterOptions } from '@/interfaces/research';
import { logger } from '@/lib/logger';

interface UseFilterOptionsReturn {
  filterOptions: FilterOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch filter options from the research API
 * Fetches available filter values based on user's tier access
 * Cached on backend for 5 minutes
 */
export function useFilterOptions(): UseFilterOptionsReturn {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/research/private/filter-options/');
      setFilterOptions(response.data);
    } catch (err) {
      setError('Failed to load filter options');
      logger.error('Filter options fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  return {
    filterOptions,
    loading,
    error,
    refetch: fetchFilterOptions,
  };
}
