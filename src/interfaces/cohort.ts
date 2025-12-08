/**
 * Cohort-related TypeScript interfaces
 * Designed for future server-side API integration
 */

import { VisitSearchFilters } from './research';

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  filters: VisitSearchFilters;
  visitCount: number;
  createdAt: string; // ISO date string for serialization
  updatedAt: string; // ISO date string
  userId?: number; // For server-side ownership
}

export interface CohortCreateRequest {
  name: string;
  description?: string;
  filters: VisitSearchFilters;
  visitCount: number;
}

export interface CohortUpdateRequest {
  name?: string;
  description?: string;
  filters?: VisitSearchFilters;
}

export interface CohortListResponse {
  cohorts: Cohort[];
  count: number;
}

export interface CohortFilterSummary {
  visitFilters: number;
  personDemographicFilters: number;
  providerDemographicFilters: number;
  clinicalFilters: number;
  totalActiveFilters: number;
}

/**
 * Detailed filter summary with actual filter values for display
 */
export interface DetailedFilterSummary {
  visit: {
    tiers: number[];
    visitSources: string[];
    dateFrom: string | null;
    dateTo: string | null;
  };
  personDemographics: {
    gender: string[];
    race: string[];
    ethnicity: string[];
    yearOfBirthFrom: number | null;
    yearOfBirthTo: number | null;
  };
  providerDemographics: {
    gender: string[];
    race: string[];
    ethnicity: string[];
    yearOfBirthFrom: number | null;
    yearOfBirthTo: number | null;
  };
  clinical: {
    hasConditions: boolean;
    hasLabs: boolean;
    hasDrugs: boolean;
    hasProcedures: boolean;
    hasNotes: boolean;
    hasObservations: boolean;
    hasMeasurements: boolean;
  };
  totalActiveFilters: number;
}

/**
 * Helper to check if a clinical filter object has any non-empty values.
 * Empty objects {} or objects with only empty arrays should return false.
 */
function hasNonEmptyFilterValues(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return Object.values(obj).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return hasNonEmptyFilterValues(value);
    }
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Calculates filter summary from VisitSearchFilters
 */
export function getCohortFilterSummary(
  filters: VisitSearchFilters | null | undefined
): CohortFilterSummary {
  let visitFilters = 0;
  let personDemographicFilters = 0;
  let providerDemographicFilters = 0;
  let clinicalFilters = 0;

  // Guard against undefined or null filters
  if (!filters) {
    return {
      visitFilters: 0,
      personDemographicFilters: 0,
      providerDemographicFilters: 0,
      clinicalFilters: 0,
      totalActiveFilters: 0,
    };
  }

  // Count visit filters
  if (filters.visit) {
    if (filters.visit.tier_id && filters.visit.tier_id.length > 0) {
      visitFilters++;
    }
    if (filters.visit.visit_source_value && filters.visit.visit_source_value.length > 0) {
      visitFilters++;
    }
    if (filters.visit.date_from) {
      visitFilters++;
    }
    if (filters.visit.date_to) {
      visitFilters++;
    }
  }

  // Count person demographic filters
  if (filters.person_demographics) {
    if (filters.person_demographics.gender && filters.person_demographics.gender.length > 0) {
      personDemographicFilters++;
    }
    if (filters.person_demographics.race && filters.person_demographics.race.length > 0) {
      personDemographicFilters++;
    }
    if (filters.person_demographics.ethnicity && filters.person_demographics.ethnicity.length > 0) {
      personDemographicFilters++;
    }
    if (
      filters.person_demographics.year_of_birth_from ||
      filters.person_demographics.year_of_birth_to
    ) {
      personDemographicFilters++;
    }
  }

  // Count provider demographic filters
  if (filters.provider_demographics) {
    if (filters.provider_demographics.gender && filters.provider_demographics.gender.length > 0) {
      providerDemographicFilters++;
    }
    if (filters.provider_demographics.race && filters.provider_demographics.race.length > 0) {
      providerDemographicFilters++;
    }
    if (
      filters.provider_demographics.ethnicity &&
      filters.provider_demographics.ethnicity.length > 0
    ) {
      providerDemographicFilters++;
    }
    if (
      filters.provider_demographics.year_of_birth_from ||
      filters.provider_demographics.year_of_birth_to
    ) {
      providerDemographicFilters++;
    }
  }

  // Count clinical filters - use hasNonEmptyFilterValues to handle empty objects
  if (filters.clinical) {
    if (hasNonEmptyFilterValues(filters.clinical.conditions)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.labs)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.drugs)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.procedures)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.notes)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.observations)) {
      clinicalFilters++;
    }
    if (hasNonEmptyFilterValues(filters.clinical.measurements)) {
      clinicalFilters++;
    }
  }

  return {
    visitFilters,
    personDemographicFilters,
    providerDemographicFilters,
    clinicalFilters,
    totalActiveFilters:
      visitFilters + personDemographicFilters + providerDemographicFilters + clinicalFilters,
  };
}

/**
 * Gets detailed filter values for display in UI
 * Returns actual filter values instead of just counts
 */
export function getDetailedFilterSummary(
  filters: VisitSearchFilters | null | undefined
): DetailedFilterSummary {
  const emptyResult: DetailedFilterSummary = {
    visit: {
      tiers: [],
      visitSources: [],
      dateFrom: null,
      dateTo: null,
    },
    personDemographics: {
      gender: [],
      race: [],
      ethnicity: [],
      yearOfBirthFrom: null,
      yearOfBirthTo: null,
    },
    providerDemographics: {
      gender: [],
      race: [],
      ethnicity: [],
      yearOfBirthFrom: null,
      yearOfBirthTo: null,
    },
    clinical: {
      hasConditions: false,
      hasLabs: false,
      hasDrugs: false,
      hasProcedures: false,
      hasNotes: false,
      hasObservations: false,
      hasMeasurements: false,
    },
    totalActiveFilters: 0,
  };

  if (!filters) {
    return emptyResult;
  }

  let totalActiveFilters = 0;

  // Extract visit filters
  const visit = {
    tiers: filters.visit?.tier_id?.length ? [...filters.visit.tier_id] : [],
    visitSources: filters.visit?.visit_source_value?.length
      ? [...filters.visit.visit_source_value]
      : [],
    dateFrom: filters.visit?.date_from || null,
    dateTo: filters.visit?.date_to || null,
  };

  if (visit.tiers.length > 0) {
    totalActiveFilters++;
  }
  if (visit.visitSources.length > 0) {
    totalActiveFilters++;
  }
  if (visit.dateFrom) {
    totalActiveFilters++;
  }
  if (visit.dateTo) {
    totalActiveFilters++;
  }

  // Extract person demographic filters
  const personDemographics = {
    gender: filters.person_demographics?.gender?.length
      ? [...filters.person_demographics.gender]
      : [],
    race: filters.person_demographics?.race?.length ? [...filters.person_demographics.race] : [],
    ethnicity: filters.person_demographics?.ethnicity?.length
      ? [...filters.person_demographics.ethnicity]
      : [],
    yearOfBirthFrom: filters.person_demographics?.year_of_birth_from ?? null,
    yearOfBirthTo: filters.person_demographics?.year_of_birth_to ?? null,
  };

  if (personDemographics.gender.length > 0) {
    totalActiveFilters++;
  }
  if (personDemographics.race.length > 0) {
    totalActiveFilters++;
  }
  if (personDemographics.ethnicity.length > 0) {
    totalActiveFilters++;
  }
  if (personDemographics.yearOfBirthFrom !== null || personDemographics.yearOfBirthTo !== null) {
    totalActiveFilters++;
  }

  // Extract provider demographic filters
  const providerDemographics = {
    gender: filters.provider_demographics?.gender?.length
      ? [...filters.provider_demographics.gender]
      : [],
    race: filters.provider_demographics?.race?.length
      ? [...filters.provider_demographics.race]
      : [],
    ethnicity: filters.provider_demographics?.ethnicity?.length
      ? [...filters.provider_demographics.ethnicity]
      : [],
    yearOfBirthFrom: filters.provider_demographics?.year_of_birth_from ?? null,
    yearOfBirthTo: filters.provider_demographics?.year_of_birth_to ?? null,
  };

  if (providerDemographics.gender.length > 0) {
    totalActiveFilters++;
  }
  if (providerDemographics.race.length > 0) {
    totalActiveFilters++;
  }
  if (providerDemographics.ethnicity.length > 0) {
    totalActiveFilters++;
  }
  if (
    providerDemographics.yearOfBirthFrom !== null ||
    providerDemographics.yearOfBirthTo !== null
  ) {
    totalActiveFilters++;
  }

  // Extract clinical filters - use hasNonEmptyFilterValues to handle empty objects
  const clinical = {
    hasConditions: hasNonEmptyFilterValues(filters.clinical?.conditions),
    hasLabs: hasNonEmptyFilterValues(filters.clinical?.labs),
    hasDrugs: hasNonEmptyFilterValues(filters.clinical?.drugs),
    hasProcedures: hasNonEmptyFilterValues(filters.clinical?.procedures),
    hasNotes: hasNonEmptyFilterValues(filters.clinical?.notes),
    hasObservations: hasNonEmptyFilterValues(filters.clinical?.observations),
    hasMeasurements: hasNonEmptyFilterValues(filters.clinical?.measurements),
  };

  if (clinical.hasConditions) {
    totalActiveFilters++;
  }
  if (clinical.hasLabs) {
    totalActiveFilters++;
  }
  if (clinical.hasDrugs) {
    totalActiveFilters++;
  }
  if (clinical.hasProcedures) {
    totalActiveFilters++;
  }
  if (clinical.hasNotes) {
    totalActiveFilters++;
  }
  if (clinical.hasObservations) {
    totalActiveFilters++;
  }
  if (clinical.hasMeasurements) {
    totalActiveFilters++;
  }

  return {
    visit,
    personDemographics,
    providerDemographics,
    clinical,
    totalActiveFilters,
  };
}
