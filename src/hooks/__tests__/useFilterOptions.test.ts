import { renderHook, waitFor } from '@testing-library/react';
import { useFilterOptions } from '../useFilterOptions';
import { apiClient } from '@/lib/apiClient';
import { FilterOptions } from '@/interfaces/research';

// Mock the apiClient
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useFilterOptions', () => {
  const mockFilterOptions: FilterOptions = {
    visit_options: {
      tiers: [1, 2, 3],
      visit_sources: ['Inpatient', 'Outpatient', 'Emergency'],
      date_range: {
        earliest: '2020-01-01',
        latest: '2024-12-31',
      },
    },
    demographics: {
      genders: ['M', 'F', 'UN'],
      races: ['W', 'B', 'A', 'AI', 'NHPI', 'M', 'UN'],
      ethnicities: ['H', 'NH', 'UN'],
      year_of_birth_range: {
        min: 1920,
        max: 2024,
      },
    },
    clinical_options: {
      conditions: {
        available_codes: [],
        available_values: [],
        total_visits: 0,
      },
      labs: {
        procedure_names: [],
        result_flags: [],
        order_statuses: [],
        total_visits: 0,
      },
      drugs: {
        common_drugs: [],
        total_visits: 0,
      },
      procedures: {
        common_names: [],
        future_or_stand_options: [],
        total_visits: 0,
      },
      notes: {
        note_types: [],
        note_statuses: [],
        total_visits: 0,
      },
      observations: {
        file_types: [],
        total_visits: 0,
      },
      measurements: {
        total_visits: 0,
        bp_systolic_range: {
          min: 0,
          max: 0,
        },
        weight_range: {
          min: 0,
          max: 0,
        },
      },
    },
    total_accessible_visits: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({ data: mockFilterOptions });
  });

  it('should fetch filter options on mount', async () => {
    const { result } = renderHook(() => useFilterOptions());

    expect(result.current.loading).toBe(true);
    expect(result.current.filterOptions).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/research/private/filter-options/');
    expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    expect(result.current.filterOptions).toEqual(mockFilterOptions);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useFilterOptions());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load filter options');
    expect(result.current.filterOptions).toBeNull();
  });

  it('should return filter options data correctly', async () => {
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filterOptions?.visit_options.tiers).toHaveLength(3);
    expect(result.current.filterOptions?.visit_options.visit_sources).toContain('Inpatient');
    expect(result.current.filterOptions?.demographics.genders).toContain('M');
    expect(result.current.filterOptions?.demographics.races).toContain('W');
  });

  it('should provide refetch function', async () => {
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApiClient.get).toHaveBeenCalledTimes(1);

    // Call refetch
    await result.current.refetch();

    expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    expect(result.current.filterOptions).toEqual(mockFilterOptions);
  });

  it('should reset error state on successful refetch', async () => {
    // First call fails
    mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load filter options');

    // Second call (refetch) succeeds
    mockApiClient.get.mockResolvedValueOnce({ data: mockFilterOptions });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    await waitFor(() => {
      expect(result.current.filterOptions).toEqual(mockFilterOptions);
    });
  });

  it('should set loading state correctly during refetch', async () => {
    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Start refetch
    result.current.refetch();

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filterOptions).toEqual(mockFilterOptions);
  });

  it('should handle empty filter options', async () => {
    const emptyOptions: FilterOptions = {
      visit_options: {
        tiers: [],
        visit_sources: [],
        date_range: {
          earliest: null,
          latest: null,
        },
      },
      demographics: {
        genders: [],
        races: [],
        ethnicities: [],
        year_of_birth_range: {
          min: null,
          max: null,
        },
      },
      clinical_options: {
        conditions: {
          available_codes: [],
          available_values: [],
          total_visits: 0,
        },
        labs: {
          procedure_names: [],
          result_flags: [],
          order_statuses: [],
          total_visits: 0,
        },
        drugs: {
          common_drugs: [],
          total_visits: 0,
        },
        procedures: {
          common_names: [],
          future_or_stand_options: [],
          total_visits: 0,
        },
        notes: {
          note_types: [],
          note_statuses: [],
          total_visits: 0,
        },
        observations: {
          file_types: [],
          total_visits: 0,
        },
        measurements: {
          total_visits: 0,
          bp_systolic_range: {
            min: 0,
            max: 0,
          },
          weight_range: {
            min: 0,
            max: 0,
          },
        },
      },
      total_accessible_visits: 0,
    };

    mockApiClient.get.mockResolvedValueOnce({ data: emptyOptions });

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filterOptions).toEqual(emptyOptions);
    expect(result.current.filterOptions?.visit_options.tiers).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
