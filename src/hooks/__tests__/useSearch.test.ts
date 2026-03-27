import { renderHook, waitFor, act } from '@testing-library/react';
import { useEncounterSearch } from '../useSearch';
import { apiClient } from '@/lib/apiClient';
import { EncounterSearchResponse } from '@/interfaces/search';

jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockHit = {
  encounter_id: '1',
  visit_source_value: 'clinic',
  visit_source_id: 1,
  visit_date: '2024-01-15',
  department: 'Internal Medicine',
  patient_gender: 'M',
  patient_race: 'B',
  patient_ethnicity: 'NH',
  patient_year_of_birth: 1965,
  provider_gender: 'F',
  provider_race: 'W',
  provider_ethnicity: 'NH',
  provider_year_of_birth: 1980,
  has_transcript: true,
  has_audio: false,
  has_provider_view: false,
  has_patient_view: false,
  has_room_view: false,
  file_types: ['transcript'],
  icd_codes: ['Z00.00'],
  cpt_codes: [],
  drug_names: ['metformin'],
  drug_count: 1,
  has_notes: true,
  note_types: ['Progress Notes'],
  note_count: 2,
  tier_level: 1,
  highlights: {},
  matched_in: [],
};

const mockResponse: EncounterSearchResponse = {
  count: 42,
  page: 1,
  page_size: 20,
  next: 'http://example.com/api?page=2',
  previous: null,
  results: [mockHit],
  aggregations: {
    departments: [],
    patient_genders: [{ key: 'M', count: 30 }],
    patient_races: [],
    patient_ethnicities: [],
    provider_genders: [],
    provider_races: [],
    provider_ethnicities: [],
    tier_distribution: [],
    note_types: [],
    file_types: [],
  },
};

describe('useEncounterSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with empty state and does not fetch on mount', () => {
    const { result } = renderHook(() => useEncounterSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    // aggregations start as DEFAULT_AGGREGATIONS (empty arrays), not null
    expect(result.current.aggregations).not.toBeNull();
    expect(result.current.pagination.totalCount).toBe(0);
    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  async function triggerSearch(
    result: ReturnType<typeof renderHook<ReturnType<typeof useEncounterSearch>, unknown>>['result'],
    query: string
  ) {
    act(() => {
      result.current.setQuery(query);
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
  }

  it('fetches when query is set', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    const { result } = renderHook(() => useEncounterSearch());

    await triggerSearch(result, 'metformin');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/search/private/encounters/',
      expect.objectContaining({ query: 'metformin' })
    );
    expect(result.current.results).toEqual([mockHit]);
  });

  it('sets pagination correctly after fetch', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    const { result } = renderHook(() => useEncounterSearch());

    await triggerSearch(result, 'test');

    expect(result.current.pagination.totalCount).toBe(42);
    expect(result.current.pagination.hasNext).toBe(true);
    expect(result.current.pagination.hasPrevious).toBe(false);
    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('sets aggregations after fetch', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    const { result } = renderHook(() => useEncounterSearch());

    await triggerSearch(result, 'test');

    expect(result.current.aggregations?.patient_genders).toEqual([{ key: 'M', count: 30 }]);
  });

  it('sets error on API failure', async () => {
    mockApiClient.post.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useEncounterSearch());

    act(() => {
      result.current.setQuery('test');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch when query is empty and no filters', async () => {
    const { result } = renderHook(() => useEncounterSearch());

    act(() => {
      result.current.setQuery('   ');
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    expect(mockApiClient.post).not.toHaveBeenCalled();
  });

  it('fetches when filters are set with empty query', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    const { result } = renderHook(() => useEncounterSearch());

    act(() => {
      result.current.setFilters({ has_transcript: true });
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockApiClient.post).toHaveBeenCalled();
  });

  it('resets to page 1 when filters change', async () => {
    mockApiClient.post.mockResolvedValue({ data: mockResponse });
    const { result } = renderHook(() => useEncounterSearch());

    await triggerSearch(result, 'test');

    act(() => {
      result.current.setPage(3);
    });
    await waitFor(() => expect(result.current.pagination.currentPage).toBe(3));

    act(() => {
      result.current.setFilters({ patient_gender: ['M'] });
    });
    await act(async () => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pagination.currentPage).toBe(1);
  });
});
