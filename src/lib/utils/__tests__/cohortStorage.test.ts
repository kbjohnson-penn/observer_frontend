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

describe('cohortStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCohorts', () => {
    it('should fetch and transform cohorts successfully', async () => {
      const mockApiResponse = {
        data: {
          cohorts: [
            {
              id: 1,
              name: 'Test Cohort',
              description: 'Test description',
              filters: {
                visit: {},
                person_demographics: {},
                provider_demographics: {},
                clinical: {},
              },
              visit_count: 50,
              created_at: '2024-01-15T10:00:00Z',
              updated_at: '2024-01-15T10:00:00Z',
            },
          ],
          count: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await getCohorts();

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/cohorts/');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Test Cohort',
        description: 'Test description',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 50,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      });
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
      const mockApiResponse = {
        data: {
          cohorts: [
            {
              id: 2,
              name: 'Cohort 2',
              description: '',
              filters: {},
              visit_count: 100,
              created_at: '2024-01-16T12:00:00Z',
              updated_at: '2024-01-16T12:00:00Z',
            },
          ],
          count: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await getCohorts();

      expect(result[0].visitCount).toBe(100);
      expect(result[0].createdAt).toBe('2024-01-16T12:00:00Z');
      expect(result[0].updatedAt).toBe('2024-01-16T12:00:00Z');
    });
  });

  describe('getCohort', () => {
    it('should fetch and transform a single cohort', async () => {
      const mockApiResponse = {
        data: {
          id: 1,
          name: 'Single Cohort',
          description: 'Description',
          filters: { visit: { visit_type: ['Inpatient'] } },
          visit_count: 75,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await getCohort('1');

      expect(apiClient.get).toHaveBeenCalledWith('/accounts/cohorts/1/');
      expect(result).toEqual({
        id: '1',
        name: 'Single Cohort',
        description: 'Description',
        filters: { visit: { visit_type: ['Inpatient'] } },
        visitCount: 75,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      });
    });

    it('should return null on error', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

      const result = await getCohort('999');

      expect(result).toBeNull();
    });

    it('should handle empty description', async () => {
      const mockApiResponse = {
        data: {
          id: 1,
          name: 'No Description Cohort',
          description: null,
          filters: {},
          visit_count: 0,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await getCohort('1');

      expect(result?.description).toBe('');
    });
  });

  describe('createCohort', () => {
    it('should create cohort and transform response', async () => {
      const requestData: CohortCreateRequest = {
        name: 'New Cohort',
        description: 'New description',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 25,
      };

      const mockApiResponse = {
        data: {
          id: 3,
          name: 'New Cohort',
          description: 'New description',
          filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
          visit_count: 25,
          created_at: '2024-01-17T14:00:00Z',
          updated_at: '2024-01-17T14:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await createCohort(requestData);

      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/', {
        name: 'New Cohort',
        description: 'New description',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visit_count: 25,
      });

      expect(result).toEqual({
        id: '3',
        name: 'New Cohort',
        description: 'New description',
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 25,
        createdAt: '2024-01-17T14:00:00Z',
        updatedAt: '2024-01-17T14:00:00Z',
      });
    });

    it('should handle empty description', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Minimal Cohort',
        filters: {},
        visitCount: 0,
      };

      const mockApiResponse = {
        data: {
          id: 4,
          name: 'Minimal Cohort',
          description: '',
          filters: {},
          visit_count: 0,
          created_at: '2024-01-17T14:00:00Z',
          updated_at: '2024-01-17T14:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await createCohort(requestData);

      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/', {
        name: 'Minimal Cohort',
        description: '',
        filters: {},
        visit_count: 0,
      });

      expect(result.description).toBe('');
    });

    it('should throw error on API failure', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Fail Cohort',
        filters: {},
        visitCount: 0,
      };

      const apiError = new Error('Validation failed');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(apiError);

      await expect(createCohort(requestData)).rejects.toThrow('Validation failed');
    });

    it('should throw generic error for non-Error objects', async () => {
      const requestData: CohortCreateRequest = {
        name: 'Fail Cohort',
        filters: {},
        visitCount: 0,
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce('String error');

      await expect(createCohort(requestData)).rejects.toThrow('Failed to create cohort');
    });
  });

  describe('updateCohort', () => {
    it('should update cohort with partial data', async () => {
      const updates = {
        name: 'Updated Name',
      };

      const mockApiResponse = {
        data: {
          id: 1,
          name: 'Updated Name',
          description: 'Original description',
          filters: {},
          visit_count: 50,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await updateCohort('1', updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/accounts/cohorts/1/', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.updatedAt).toBe('2024-01-18T10:00:00Z');
    });

    it('should transform camelCase to snake_case in request', async () => {
      const updates = {
        name: 'New Name',
        description: 'New Desc',
        visitCount: 100,
      };

      const mockApiResponse = {
        data: {
          id: 1,
          name: 'New Name',
          description: 'New Desc',
          filters: {},
          visit_count: 100,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-18T10:00:00Z',
        },
      };

      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      await updateCohort('1', updates);

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
      const mockApiResponse = {
        data: {
          id: 5,
          name: 'Custom Duplicate',
          description: 'Original description',
          filters: { visit: { visit_type: ['Inpatient'] } },
          visit_count: 50,
          created_at: '2024-01-18T15:00:00Z',
          updated_at: '2024-01-18T15:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await duplicateCohort('1', 'Custom Duplicate');

      expect(apiClient.post).toHaveBeenCalledWith('/accounts/cohorts/1/duplicate/', {
        name: 'Custom Duplicate',
      });

      expect(result).toEqual({
        id: '5',
        name: 'Custom Duplicate',
        description: 'Original description',
        filters: { visit: { visit_type: ['Inpatient'] } },
        visitCount: 50,
        createdAt: '2024-01-18T15:00:00Z',
        updatedAt: '2024-01-18T15:00:00Z',
      });
    });

    it('should duplicate cohort without custom name', async () => {
      const mockApiResponse = {
        data: {
          id: 6,
          name: 'Copy of Original',
          description: 'Original description',
          filters: {},
          visit_count: 50,
          created_at: '2024-01-18T15:00:00Z',
          updated_at: '2024-01-18T15:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockApiResponse);

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
      const mockApiResponse = {
        data: {
          cohorts: [
            {
              id: 1,
              name: 'Test',
              description: 'Desc',
              filters: { test: 'data' },
              visit_count: 42,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            },
          ],
          count: 1,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

      const result = await getCohorts();

      expect(result[0]).toHaveProperty('visitCount');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
      expect(result[0]).not.toHaveProperty('visit_count');
      expect(result[0]).not.toHaveProperty('created_at');
      expect(result[0]).not.toHaveProperty('updated_at');
    });

    it('should convert id to string', async () => {
      const mockApiResponse = {
        data: {
          id: 123,
          name: 'Test',
          description: '',
          filters: {},
          visit_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockApiResponse);

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
    let clickSpy: jest.SpyInstance;

    beforeEach(() => {
      // Create a mock link element
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      } as any;

      // Spy on document methods
      createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      clickSpy = mockLink.click as jest.Mock;

      // Mock URL methods
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
        filters: { visit: {}, person_demographics: {}, provider_demographics: {}, clinical: {} },
        visitCount: 50,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      exportCohortToJSON(cohort);

      // Verify link was created
      expect(createElementSpy).toHaveBeenCalledWith('a');

      // Verify link properties
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toMatch(/^cohort-test-cohort-\d+\.json$/);

      // Verify link was added to DOM, clicked, and removed
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      // Verify URL was revoked
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should format filename correctly with spaces replaced by hyphens', () => {
      const cohort: Cohort = {
        id: '1',
        name: 'My Test Cohort With Spaces',
        description: '',
        filters: {},
        visitCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      exportCohortToJSON(cohort);

      expect(mockLink.download).toMatch(/^cohort-my-test-cohort-with-spaces-\d+\.json$/);
    });

    it('should create properly formatted JSON blob', () => {
      const cohort: Cohort = {
        id: '1',
        name: 'Export Test',
        description: 'Export description',
        filters: { visit: { visit_source_value: ['Inpatient'] } },
        visitCount: 25,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      // Mock Blob constructor to capture the data
      const originalBlob = global.Blob;
      const blobData: any[] = [];
      global.Blob = jest.fn((data, options) => {
        blobData.push(...data);
        return new originalBlob(data, options);
      }) as any;

      exportCohortToJSON(cohort);

      // Verify JSON is properly formatted
      const jsonString = blobData[0];
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(cohort);
      expect(jsonString).toContain('\n'); // Should be pretty-printed with indentation

      // Restore original Blob
      global.Blob = originalBlob;
    });

    it('should handle cohorts with special characters in name', () => {
      const cohort: Cohort = {
        id: '1',
        name: 'Test/Cohort:Name*With?Special|Chars',
        description: '',
        filters: {},
        visitCount: 0,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      exportCohortToJSON(cohort);

      // Filename should still be generated (characters replaced)
      expect(mockLink.download).toMatch(/\.json$/);
    });
  });
});
