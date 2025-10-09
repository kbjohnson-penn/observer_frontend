import { renderHook, waitFor } from '@testing-library/react';
import { useVisitSearch } from '../useVisitSearch';
import { apiClient } from '@/lib/apiClient';
import { VisitSearchResponse } from '@/interfaces/research';

// Mock the apiClient
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useVisitSearch', () => {
  const mockResponse: VisitSearchResponse = {
    count: 100,
    next: 'http://example.com/api?page=2',
    previous: null,
    results: [
      {
        visit_id: 1,
        visit_date: '2024-01-01',
        visit_time: '10:00:00',
        visit_source: 'Clinic',
        visit_source_id: 1,
        tier: 1,
        patient_id: 101,
        patient_age: 45,
        patient_gender: 'M',
        patient_race: 'W',
        patient_ethnicity: 'NH',
        patient_year_of_birth: 1979,
        provider_id: 201,
        provider_age: 50,
        provider_gender: 'F',
        provider_race: 'A',
        provider_ethnicity: 'NH',
        provider_year_of_birth: 1974,
      },
    ],
    filter_summary: {
      total_visits: 500,
      filtered_visits: 100,
      active_filters: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
  });

  it('should fetch visits on mount', async () => {
    const { result } = renderHook(() => useVisitSearch());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/research/private/visits-search/?page=1',
      {
        filters: {},
        sort: { field: 'id', direction: 'asc' },
      }
    );

    expect(result.current.results).toEqual(mockResponse.results);
    expect(result.current.pagination.totalCount).toBe(100);
    expect(result.current.pagination.hasNext).toBe(true);
    expect(result.current.pagination.hasPrevious).toBe(false);
  });

  it('should update filter summary', async () => {
    const { result } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filterSummary).toEqual({
      totalVisits: 500,
      filteredVisits: 100,
      activeFilters: 2,
    });
  });

  it('should handle API errors', async () => {
    mockApiClient.post.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to search visits');
    expect(result.current.results).toEqual([]);
  });

  it('should reset to page 1 when filters change', async () => {
    const { result, rerender } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change page to 2
    result.current.setPage(2);
    rerender();

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/research/private/visits-search/?page=2',
        expect.any(Object)
      );
    });

    // Change filters
    result.current.setFilters({
      visit: { tier_id: [1] },
    });
    rerender();

    // Should reset to page 1
    await waitFor(() => {
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  it('should reset to page 1 when sort changes', async () => {
    const { result, rerender } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change page to 2
    result.current.setPage(2);
    rerender();

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/research/private/visits-search/?page=2',
        expect.any(Object)
      );
    });

    // Change sort
    result.current.setSort({ field: 'visit_start_date', direction: 'desc' });
    rerender();

    // Should reset to page 1
    await waitFor(() => {
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  it('should debounce filter changes', async () => {
    jest.useFakeTimers();

    const { result, rerender } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockApiClient.post.mockClear();

    // Change filters multiple times quickly
    result.current.setFilters({ visit: { tier_id: [1] } });
    rerender();
    result.current.setFilters({ visit: { tier_id: [1, 2] } });
    rerender();
    result.current.setFilters({ visit: { tier_id: [1, 2, 3] } });
    rerender();

    // Should not call API immediately
    expect(mockApiClient.post).not.toHaveBeenCalled();

    // Fast-forward time
    jest.advanceTimersByTime(300);

    // Should call API once after debounce
    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it('should fetch immediately for sort changes (no debounce)', async () => {
    const { result, rerender } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockApiClient.post.mockClear();

    // Change sort
    result.current.setSort({ field: 'visit_start_date', direction: 'desc' });
    rerender();

    // Should call API immediately
    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  it('should fetch immediately for page changes (no debounce)', async () => {
    const { result, rerender } = renderHook(() => useVisitSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockApiClient.post.mockClear();

    // Change page
    result.current.setPage(2);
    rerender();

    // Should call API immediately
    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });
  });
});
