import { renderHook, waitFor, act } from '@testing-library/react';
import { useDatasetExplorer } from '../useDatasetExplorer';
import { apiClient } from '@/lib/apiClient';
import { SampleDataAPIResponse } from '@/interfaces/observer-omop';

// Mock the apiClient
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useDatasetExplorer', () => {
  const mockApiResponse: SampleDataAPIResponse = {
    persons: [
      {
        person_id: 1,
        gender_concept_id: 8507,
        year_of_birth: 1980,
        race_concept_id: 8527,
        ethnicity_concept_id: 38003563,
      },
      {
        person_id: 2,
        gender_concept_id: 8532,
        year_of_birth: 1975,
        race_concept_id: 8516,
        ethnicity_concept_id: 38003564,
      },
    ],
    providers: [
      {
        provider_id: 1,
        provider_name: 'Dr. Smith',
        gender_concept_id: 8507,
        year_of_birth: 1970,
        specialty_concept_id: 38004453,
      },
    ],
    visits: [
      {
        visit_occurrence_id: 1,
        person_id: 1,
        visit_concept_id: 9201,
        visit_start_date: '2024-01-01',
        visit_start_datetime: '2024-01-01T10:00:00',
        visit_type_concept_id: 44818518,
      },
      {
        visit_occurrence_id: 2,
        person_id: 2,
        visit_concept_id: 9202,
        visit_start_date: '2024-01-02',
        visit_start_datetime: '2024-01-02T14:00:00',
        visit_type_concept_id: 44818519,
      },
    ],
    notes: [],
    conditions: [],
    drugs: [],
    procedures: [],
    measurements: [],
    observations: [
      {
        observation_id: 1,
        person_id: 1,
        observation_concept_id: 4219336,
        observation_date: '2024-01-01',
        file_type: 'patient_view',
        file_path: 'video1.mp4',
      },
      {
        observation_id: 2,
        person_id: 1,
        observation_concept_id: 4219336,
        observation_date: '2024-01-01',
        file_type: 'provider_view',
        file_path: 'video2.mp4',
      },
      {
        observation_id: 3,
        person_id: 1,
        observation_concept_id: 4219336,
        observation_date: '2024-01-01',
        file_type: 'room_view',
        file_path: 'video3.mp4',
      },
      {
        observation_id: 4,
        person_id: 1,
        observation_concept_id: 4219336,
        observation_date: '2024-01-01',
        file_type: 'transcript',
        file_path: 'transcript.json',
      },
    ],
    patient_surveys: [],
    provider_surveys: [],
    audit_logs: [],
    concepts: [],
    _metadata: {
      description: 'Sample OMOP dataset',
      source: 'Test data',
      count: {
        persons: 2,
        providers: 1,
        visits: 2,
        observations: 4,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({ data: mockApiResponse });
  });

  it('should load stats on mount', async () => {
    const { result } = renderHook(() => useDatasetExplorer());

    expect(result.current.statsLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/public/sample-data/', {
      timeout: 10000,
    });

    expect(result.current.stats).toEqual({
      totalTables: 13,
      totalRecords: 9, // 2 persons + 1 provider + 2 visits + 4 observations
      totalVisits: 2,
      totalVideos: 3,
    });

    expect(result.current.error).toBeNull();
  });

  it('should load video sources from observations', async () => {
    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1';

    expect(result.current.videoSources).toEqual({
      patient: `${baseUrl}/public/video/video1.mp4/`,
      provider: `${baseUrl}/public/video/video2.mp4/`,
      room: `${baseUrl}/public/video/video3.mp4/`,
    });
  });

  it('should load transcript source from observations', async () => {
    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1';

    expect(result.current.transcriptSource).toBe(`${baseUrl}/public/video/transcript.json/`);
  });

  it('should handle API errors', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.stats).toEqual({
      totalTables: 0,
      totalRecords: 0,
      totalVisits: 0,
      totalVideos: 0,
    });
  });

  it('should handle API response errors', async () => {
    mockApiClient.get.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Server error',
        },
      },
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
  });

  it('should initialize with default collapsible states', () => {
    const { result } = renderHook(() => useDatasetExplorer());

    expect(result.current.collapsibleStates).toEqual({
      showOverview: true,
      showDataBrowser: true,
      showMediaViewers: true,
    });
  });

  it('should toggle collapsible sections', async () => {
    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.collapsibleStates.showOverview).toBe(true);

    act(() => {
      result.current.toggleCollapsible('showOverview');
    });

    expect(result.current.collapsibleStates.showOverview).toBe(false);
    expect(result.current.collapsibleStates.showDataBrowser).toBe(true);
    expect(result.current.collapsibleStates.showMediaViewers).toBe(true);

    act(() => {
      result.current.toggleCollapsible('showDataBrowser');
    });

    expect(result.current.collapsibleStates.showOverview).toBe(false);
    expect(result.current.collapsibleStates.showDataBrowser).toBe(false);
    expect(result.current.collapsibleStates.showMediaViewers).toBe(true);
  });

  it('should handle empty observations array', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        ...mockApiResponse,
        observations: [],
      },
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.videoSources).toEqual({
      patient: '',
      provider: '',
      room: '',
    });
    expect(result.current.transcriptSource).toBe('');
    expect(result.current.stats.totalVideos).toBe(0);
  });

  it('should handle missing data arrays in API response', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {},
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.stats).toEqual({
      totalTables: 13,
      totalRecords: 0,
      totalVisits: 0,
      totalVideos: 0,
    });
  });

  it('should calculate correct stats with partial data', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        persons: [{ person_id: 1 }],
        visits: [{ visit_occurrence_id: 1 }, { visit_occurrence_id: 2 }],
        observations: [
          { file_type: 'patient_view', file_path: 'video1.mp4' },
          { file_type: 'other', file_path: 'other.mp4' },
        ],
      },
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.stats).toEqual({
      totalTables: 13,
      totalRecords: 5, // 1 person + 2 visits + 2 observations
      totalVisits: 2,
      totalVideos: 1,
    });
  });

  it('should handle timeout errors', async () => {
    mockApiClient.get.mockRejectedValueOnce({
      message: 'timeout of 10000ms exceeded',
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    expect(result.current.error).toBe('timeout of 10000ms exceeded');
  });

  it('should handle multiple observations of same type', async () => {
    mockApiClient.get.mockResolvedValueOnce({
      data: {
        ...mockApiResponse,
        observations: [
          { observation_id: 1, file_type: 'patient_view', file_path: 'video1.mp4' },
          { observation_id: 2, file_type: 'patient_view', file_path: 'video2.mp4' },
          { observation_id: 3, file_type: 'provider_view', file_path: 'video3.mp4' },
        ],
      },
    });

    const { result } = renderHook(() => useDatasetExplorer());

    await waitFor(() => {
      expect(result.current.statsLoading).toBe(false);
    });

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1';

    expect(result.current.videoSources.patient).toBe(`${baseUrl}/public/video/video2.mp4/`);
    expect(result.current.stats.totalVideos).toBe(3);
  });
});
