/**
 * Tests for cohortStorage utility
 * Tests API integration for cohort CRUD operations
 */

import { apiClient } from '../../apiClient';
import {
  getCohorts,
  getCohort,
  createCohort,
  updateCohort,
  deleteCohort,
  duplicateCohort,
  exportCohortToJSON,
} from '../cohortStorage';
import type { Cohort, CohortCreateRequest } from '@/interfaces/cohort';

// Mock apiClient
jest.mock('../../apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

/**
 * Helper to build a mock API cohort response with sensible defaults.
 */
function mockApiCohort(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Test Cohort',
    description: 'Test description',
    source: 'research',
    filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
    encounter_ids: null,
    encounter_id_count: null,
    search_query: '',
    visit_count: 50,
    user_id: undefined,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}

/**
 * Expected frontend Cohort shape from the helper above.
 */
function expectedCohort(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    name: 'Test Cohort',
    description: 'Test description',
    source: 'research',
    filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
    encounterIds: null,
    encounterIdCount: null,
    searchQuery: '',
    visitCount: 50,
    userId: undefined,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    ...overrides,
  };
}

describe('cohortStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCohorts', () => {
    it('should fetch and transform cohorts successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { cohorts: [mockApiCohort()], count: 1 },
      });

      const result = await getCohorts();

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/cohorts/');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedCohort());
    });

    it('should return empty array on error', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const result = await getCohorts();
      expect(result).toEqual([]);
    });

    it('should handle empty cohorts response', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { cohorts: [], count: 0 },
      });
      const result = await getCohorts();
      expect(result).toEqual([]);
    });

    it('should transform snake_case to camelCase', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          cohorts: [
            mockApiCohort({
              id: 2,
              visit_count: 100,
              created_at: '2024-01-16T12:00:00Z',
              updated_at: '2024-01-16T12:00:00Z',
            }),
          ],
          count: 1,
        },
      });

      const result = await getCohorts();
      expect(result[0].visitCount).toBe(100);
      expect(result[0].createdAt).toBe('2024-01-16T12:00:00Z');
    });
  });

  describe('getCohort', () => {
    it('should fetch and transform a single cohort', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({
          name: 'Single Cohort',
          description: 'Description',
          filters: { visit: { visit_type: ['Inpatient'] } },
          visit_count: 75,
        }),
      });

      const result = await getCohort('1');

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/cohorts/1/');
      expect(result).toEqual(
        expectedCohort({
          name: 'Single Cohort',
          description: 'Description',
          filters: { visit: { visit_type: ['Inpatient'] } },
          visitCount: 75,
        })
      );
    });

    it('should return null on error', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'));
      const result = await getCohort('999');
      expect(result).toBeNull();
    });

    it('should handle empty description', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({ description: null }),
      });
      const result = await getCohort('1');
      expect(result?.description).toBe('');
    });
  });

  describe('createCohort', () => {
    it('should create cohort and transform response', async () => {
      const requestData: CohortCreateRequest = {
        name: 'New Cohort',
        description: 'New description',
        source: 'research',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 25,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({
          id: 3,
          name: 'New Cohort',
          description: 'New description',
          visit_count: 25,
          created_at: '2024-01-17T14:00:00Z',
          updated_at: '2024-01-17T14:00:00Z',
        }),
      });

      const result = await createCohort(requestData);

      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/', {
        name: 'New Cohort',
        description: 'New description',
        source: 'research',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visit_count: 25,
      });

      expect(result).toEqual(
        expectedCohort({
          id: '3',
          name: 'New Cohort',
          description: 'New description',
          visitCount: 25,
          createdAt: '2024-01-17T14:00:00Z',
          updatedAt: '2024-01-17T14:00:00Z',
        })
      );
    });

    it('should create search-source cohort with encounter_ids', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Selected Encounters',
        source: 'search',
        encounterIds: ['1', '2', '3'],
        searchQuery: 'diabetes',
        visitCount: 3,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({
          id: 10,
          name: 'Selected Encounters',
          source: 'search',
          filters: {},
          encounter_ids: ['1', '2', '3'],
          search_query: 'diabetes',
          visit_count: 3,
        }),
      });

      const result = await createCohort(requestData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/accounts/cohorts/',
        expect.objectContaining({
          source: 'search',
          encounter_ids: ['1', '2', '3'],
          search_query: 'diabetes',
        })
      );

      expect(result.source).toBe('search');
      expect(result.encounterIds).toEqual(['1', '2', '3']);
      expect(result.searchQuery).toBe('diabetes');
    });

    it('should handle empty description', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Minimal Cohort',
        source: 'research',
        filters: {},
        visitCount: 0,
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({
          id: 4,
          name: 'Minimal Cohort',
          description: '',
          filters: {},
          visit_count: 0,
        }),
      });

      const result = await createCohort(requestData);
      expect(result.description).toBe('');
    });

    it('should throw error on API failure', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Fail Cohort',
        source: 'research',
        filters: {},
        visitCount: 0,
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Validation failed'));
      await expect(createCohort(requestData)).rejects.toThrow('Validation failed');
    });

    it('should throw generic error for non-Error objects', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Fail Cohort',
        source: 'research',
        filters: {},
        visitCount: 0,
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce('String error');
      await expect(createCohort(requestData)).rejects.toThrow('Failed to create cohort');
    });
  });

  describe('updateCohort', () => {
    it('should update cohort with partial data', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({ name: 'Updated Name', updated_at: '2024-01-18T10:00:00Z' }),
      });

      const result = await updateCohort('1', { name: 'Updated Name' });

      expect(apiClient.patch).toHaveBeenCalledWith('/accounts/cohorts/1/', {
        name: 'Updated Name',
      });
      expect(result.name).toBe('Updated Name');
      expect(result.updatedAt).toBe('2024-01-18T10:00:00Z');
    });

    it('should transform camelCase to snake_case in request', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({ name: 'New Name', description: 'New Desc', visit_count: 100 }),
      });

      await updateCohort('1', { name: 'New Name', description: 'New Desc', visitCount: 100 });

      expect(apiClient.patch).toHaveBeenCalledWith('/accounts/cohorts/1/', {
        name: 'New Name',
        description: 'New Desc',
        visit_count: 100,
      });
    });

    it('should throw error on API failure', async () => {
      (apiClient.patch as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));
      await expect(updateCohort('1', { name: 'Fail' })).rejects.toThrow('Update failed');
    });

    it('should throw generic error for non-Error objects', async () => {
      (apiClient.patch as jest.Mock).mockRejectedValueOnce('String error');
      await expect(updateCohort('1', { name: 'Fail' })).rejects.toThrow('Failed to update cohort');
    });
  });

  describe('deleteCohort', () => {
    it('should delete cohort successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({});
      await deleteCohort('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/accounts/cohorts/1/');
    });

    it('should throw error on API failure', async () => {
      (apiClient.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
      await expect(deleteCohort('1')).rejects.toThrow('Failed to delete cohort');
    });
  });

  describe('duplicateCohort', () => {
    it('should duplicate cohort with custom name', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({
          id: 5,
          name: 'Custom Duplicate',
          filters: { visit: { visit_type: ['Inpatient'] } },
          created_at: '2024-01-18T15:00:00Z',
          updated_at: '2024-01-18T15:00:00Z',
        }),
      });

      const result = await duplicateCohort('1', 'Custom Duplicate');

      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/1/duplicate/', {
        name: 'Custom Duplicate',
      });
      expect(result).toEqual(
        expectedCohort({
          id: '5',
          name: 'Custom Duplicate',
          filters: { visit: { visit_type: ['Inpatient'] } },
          createdAt: '2024-01-18T15:00:00Z',
          updatedAt: '2024-01-18T15:00:00Z',
        })
      );
    });

    it('should duplicate cohort without custom name', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({ id: 6, name: 'Copy of Original' }),
      });

      const result = await duplicateCohort('1');
      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/1/duplicate/', {});
      expect(result.name).toBe('Copy of Original');
    });

    it('should throw error on API failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Duplicate failed'));
      await expect(duplicateCohort('1')).rejects.toThrow('Failed to duplicate cohort');
    });
  });

  describe('Data transformation', () => {
    it('should correctly transform all snake_case fields to camelCase', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: {
          cohorts: [
            mockApiCohort({
              id: 1,
              visit_count: 42,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            }),
          ],
          count: 1,
        },
      });

      const result = await getCohorts();
      expect(result[0]).toHaveProperty('visitCount');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
      expect(result[0]).toHaveProperty('source');
      expect(result[0]).toHaveProperty('searchQuery');
      expect(result[0]).not.toHaveProperty('visit_count');
      expect(result[0]).not.toHaveProperty('created_at');
      expect(result[0]).not.toHaveProperty('updated_at');
    });

    it('should convert id to string', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockApiCohort({ id: 123 }),
      });
      const result = await getCohort('123');
      expect(result?.id).toBe('123');
      expect(typeof result?.id).toBe('string');
    });
  });

  describe('exportCohortToJSON', () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      mockLink = { href: '', download: '', click: jest.fn() } as unknown as HTMLAnchorElement;
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should create and download a JSON file', () => {
      const cohort: Cohort = {
        id: '1',
        name: 'Test Cohort',
        description: 'Test description',
        source: 'research',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 50,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      exportCohortToJSON(cohort);
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/^cohort-test-cohort-\d+\.json$/);
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should format filename correctly with spaces replaced by hyphens', () => {
      const cohort: Cohort = {
        id: '1',
        name: 'My Test Cohort With Spaces',
        description: '',
        source: 'research',
        filters: {},
        visitCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      exportCohortToJSON(cohort);
      expect(mockLink.download).toMatch(/^cohort-my-test-cohort-with-spaces-\d+\.json$/);
    });
  });
});
