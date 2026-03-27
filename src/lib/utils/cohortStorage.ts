/**
 * Cohort storage utility
 * Uses Observer backend API for persistent storage
 */

import { Cohort, CohortCreateRequest, CohortSource } from '@/interfaces/cohort';
import { apiClient } from '../apiClient';
import { logger } from '../logger';

 

/**
 * Map a raw API cohort object to the frontend Cohort interface.
 */
function mapCohort(c: any): Cohort {
  return {
    id: c.id.toString(),
    name: c.name,
    description: c.description || '',
    source: (c.source as CohortSource) || 'research',
    filters: c.filters,
    encounterIds: c.encounter_ids ?? null,
    encounterIdCount: c.encounter_id_count ?? null,
    searchQuery: c.search_query || '',
    visitCount: c.visit_count,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    userId: c.user_id,
  };
}

/**
 * Get all cohorts for the current user
 * GET /api/v1/accounts/cohorts/
 */
export async function getCohorts(): Promise<Cohort[]> {
  try {
    const response = await apiClient.get('/accounts/cohorts/');
    const cohorts = response.data.cohorts || [];
    return cohorts.map(mapCohort);
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
    return mapCohort(response.data);
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
    const payload: Record<string, unknown> = {
      name: data.name,
      description: data.description || '',
      source: data.source,
      filters: data.filters || {},
      visit_count: data.visitCount,
    };
    if (data.encounterIds) {
      payload.encounter_ids = data.encounterIds;
    }
    if (data.searchQuery) {
      payload.search_query = data.searchQuery;
    }

    const response = await apiClient.post('/accounts/cohorts/', payload);
    return mapCohort(response.data);
  } catch (error) {
    logger.error('Failed to create cohort:', error);
    if (error instanceof Error) {
      throw error;
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
    const payload: Record<string, unknown> = {};
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
    return mapCohort(response.data);
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
    return mapCohort(response.data);
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
