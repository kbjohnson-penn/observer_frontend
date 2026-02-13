/**
 * Cohort storage utility
 * Uses Observer backend API for persistent storage
 */

import { Cohort, CohortCreateRequest } from '@/interfaces/cohort';
import { apiClient } from '../apiClient';
import { logger } from '../logger';

/**
 * Get all cohorts for the current user
 * GET /api/v1/accounts/cohorts/
 */
export async function getCohorts(): Promise<Cohort[]> {
  try {
    const response = await apiClient.get('/accounts/cohorts/');

    // API returns { cohorts: Cohort[], count: number }
    const cohorts = response.data.cohorts || [];

    // Transform API response to match frontend interface
    return cohorts.map((cohort: any) => ({
      id: cohort.id.toString(),
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters,
      visitCount: cohort.visit_count,
      createdAt: cohort.created_at,
      updatedAt: cohort.updated_at,
    }));
  } catch (error) {
    logger.error('Failed to load cohorts:', error);
    return [];
  }
}

/**
 * Get a single cohort by ID
 * GET /api/v1/accounts/cohorts/{id}/
 */
export async function getCohort(id: string): Promise<Cohort | null> {
  try {
    const response = await apiClient.get(`/accounts/cohorts/${id}/`);
    const cohort = response.data;

    // Transform API response to match frontend interface
    return {
      id: cohort.id.toString(),
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters,
      visitCount: cohort.visit_count,
      createdAt: cohort.created_at,
      updatedAt: cohort.updated_at,
    };
  } catch (error) {
    logger.error('Failed to load cohort:', error);
    return null;
  }
}

/**
 * Create a new cohort
 * POST /api/v1/accounts/cohorts/
 */
export async function createCohort(data: CohortCreateRequest): Promise<Cohort> {
  try {
    // Transform frontend request to API format
    const payload = {
      name: data.name,
      description: data.description || '',
      filters: data.filters,
      visit_count: data.visitCount,
    };

    const response = await apiClient.post('/accounts/cohorts/', payload);
    const cohort = response.data;

    // Transform API response to match frontend interface
    return {
      id: cohort.id.toString(),
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters,
      visitCount: cohort.visit_count,
      createdAt: cohort.created_at,
      updatedAt: cohort.updated_at,
    };
  } catch (error) {
    logger.error('Failed to create cohort:', error);
    if (error instanceof Error) {
      throw error; // Preserve original error message
    }
    throw new Error('Failed to create cohort');
  }
}

/**
 * Update an existing cohort
 * PATCH /api/v1/accounts/cohorts/{id}/
 */
export async function updateCohort(id: string, updates: Partial<Cohort>): Promise<Cohort> {
  try {
    // Transform frontend updates to API format
    const payload: any = {};
    if (updates.name !== undefined) {
      payload.name = updates.name;
    }
    if (updates.description !== undefined) {
      payload.description = updates.description;
    }
    if (updates.filters !== undefined) {
      payload.filters = updates.filters;
    }
    if (updates.visitCount !== undefined) {
      payload.visit_count = updates.visitCount;
    }

    const response = await apiClient.patch(`/accounts/cohorts/${id}/`, payload);
    const cohort = response.data;

    // Transform API response to match frontend interface
    return {
      id: cohort.id.toString(),
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters,
      visitCount: cohort.visit_count,
      createdAt: cohort.created_at,
      updatedAt: cohort.updated_at,
    };
  } catch (error) {
    logger.error('Failed to update cohort:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update cohort');
  }
}

/**
 * Delete a cohort
 * DELETE /api/v1/accounts/cohorts/{id}/
 */
export async function deleteCohort(id: string): Promise<void> {
  try {
    await apiClient.delete(`/accounts/cohorts/${id}/`);
  } catch (error) {
    logger.error('Failed to delete cohort:', error);
    throw new Error('Failed to delete cohort');
  }
}

/**
 * Duplicate a cohort
 * POST /api/v1/accounts/cohorts/{id}/duplicate/
 */
export async function duplicateCohort(id: string, newName?: string): Promise<Cohort> {
  try {
    const payload = newName ? { name: newName } : {};
    const response = await apiClient.post(`/accounts/cohorts/${id}/duplicate/`, payload);
    const cohort = response.data;

    // Transform API response to match frontend interface
    return {
      id: cohort.id.toString(),
      name: cohort.name,
      description: cohort.description || '',
      filters: cohort.filters,
      visitCount: cohort.visit_count,
      createdAt: cohort.created_at,
      updatedAt: cohort.updated_at,
    };
  } catch (error) {
    logger.error('Failed to duplicate cohort:', error);
    throw new Error('Failed to duplicate cohort');
  }
}

/**
 * Export cohort to JSON
 */
export function exportCohortToJSON(cohort: Cohort): void {
  const dataStr = JSON.stringify(cohort, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `cohort-${cohort.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
