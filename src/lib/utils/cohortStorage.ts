/**
 * Cohort storage utility
 * Currently uses localStorage, designed for easy migration to API
 */

import { Cohort, CohortCreateRequest } from '@/interfaces/cohort';

const STORAGE_KEY = 'observer-research-cohorts';

/**
 * Get all cohorts for the current user
 * TODO: Replace with API call - GET /api/v1/research/cohorts/
 */
export async function getCohorts(): Promise<Cohort[]> {
  try {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const cohorts = JSON.parse(stored) as Cohort[];
    return cohorts;
  } catch (error) {
    console.error('Failed to load cohorts:', error);
    return [];
  }
}

/**
 * Get a single cohort by ID
 * TODO: Replace with API call - GET /api/v1/research/cohorts/{id}/
 */
export async function getCohort(id: string): Promise<Cohort | null> {
  try {
    const cohorts = await getCohorts();
    return cohorts.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Failed to load cohort:', error);
    return null;
  }
}

/**
 * Create a new cohort
 * TODO: Replace with API call - POST /api/v1/research/cohorts/
 */
export async function createCohort(data: CohortCreateRequest): Promise<Cohort> {
  try {
    const now = new Date().toISOString();
    const newCohort: Cohort = {
      id: `cohort-${Date.now()}`, // TODO: Use server-generated ID
      name: data.name,
      description: data.description,
      filters: data.filters,
      visitCount: data.visitCount,
      createdAt: now,
      updatedAt: now,
    };

    const cohorts = await getCohorts();
    const updated = [...cohorts, newCohort];

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (storageError) {
        // Handle quota exceeded error
        if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Please delete some cohorts or export them to free up space.');
        }
        throw storageError;
      }
    }

    return newCohort;
  } catch (error) {
    console.error('Failed to create cohort:', error);
    if (error instanceof Error) {
      throw error; // Preserve original error message
    }
    throw new Error('Failed to create cohort');
  }
}

/**
 * Update an existing cohort
 * TODO: Replace with API call - PATCH /api/v1/research/cohorts/{id}/
 */
export async function updateCohort(id: string, updates: Partial<Cohort>): Promise<Cohort> {
  try {
    const cohorts = await getCohorts();
    const index = cohorts.findIndex(c => c.id === id);

    if (index === -1) {
      throw new Error('Cohort not found');
    }

    const updatedCohort = {
      ...cohorts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    cohorts[index] = updatedCohort;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cohorts));
      } catch (storageError) {
        if (storageError instanceof Error && storageError.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Please delete some cohorts or export them to free up space.');
        }
        throw storageError;
      }
    }

    return updatedCohort;
  } catch (error) {
    console.error('Failed to update cohort:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update cohort');
  }
}

/**
 * Delete a cohort
 * TODO: Replace with API call - DELETE /api/v1/research/cohorts/{id}/
 */
export async function deleteCohort(id: string): Promise<void> {
  try {
    const cohorts = await getCohorts();
    const filtered = cohorts.filter(c => c.id !== id);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Failed to delete cohort:', error);
    throw new Error('Failed to delete cohort');
  }
}

/**
 * Duplicate a cohort
 * TODO: Replace with API call - POST /api/v1/research/cohorts/{id}/duplicate/
 */
export async function duplicateCohort(id: string): Promise<Cohort> {
  try {
    const original = await getCohort(id);
    if (!original) {
      throw new Error('Cohort not found');
    }

    return createCohort({
      name: `${original.name} (Copy)`,
      description: original.description,
      filters: original.filters,
      visitCount: original.visitCount,
    });
  } catch (error) {
    console.error('Failed to duplicate cohort:', error);
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
