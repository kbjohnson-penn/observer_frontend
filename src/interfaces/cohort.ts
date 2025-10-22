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
 * Calculates filter summary from VisitSearchFilters
 */
export function getCohortFilterSummary(filters: VisitSearchFilters): CohortFilterSummary {
  let visitFilters = 0;
  let personDemographicFilters = 0;
  let providerDemographicFilters = 0;
  let clinicalFilters = 0;

  // Count visit filters
  if (filters.visit) {
    if (filters.visit.tier_id && filters.visit.tier_id.length > 0) {visitFilters++;}
    if (filters.visit.visit_source_value) {visitFilters++;}
    if (filters.visit.date_from) {visitFilters++;}
    if (filters.visit.date_to) {visitFilters++;}
  }

  // Count person demographic filters
  if (filters.person_demographics) {
    if (filters.person_demographics.gender && filters.person_demographics.gender.length > 0) {personDemographicFilters++;}
    if (filters.person_demographics.race && filters.person_demographics.race.length > 0) {personDemographicFilters++;}
    if (filters.person_demographics.ethnicity && filters.person_demographics.ethnicity.length > 0) {personDemographicFilters++;}
    if (filters.person_demographics.year_of_birth_from || filters.person_demographics.year_of_birth_to) {personDemographicFilters++;}
  }

  // Count provider demographic filters
  if (filters.provider_demographics) {
    if (filters.provider_demographics.gender && filters.provider_demographics.gender.length > 0) {providerDemographicFilters++;}
    if (filters.provider_demographics.race && filters.provider_demographics.race.length > 0) {providerDemographicFilters++;}
    if (filters.provider_demographics.ethnicity && filters.provider_demographics.ethnicity.length > 0) {providerDemographicFilters++;}
    if (filters.provider_demographics.year_of_birth_from || filters.provider_demographics.year_of_birth_to) {providerDemographicFilters++;}
  }

  // Count clinical filters (future expansion)
  if (filters.clinical) {
    if (filters.clinical.conditions) {clinicalFilters++;}
    if (filters.clinical.labs) {clinicalFilters++;}
    if (filters.clinical.drugs) {clinicalFilters++;}
    if (filters.clinical.procedures) {clinicalFilters++;}
    if (filters.clinical.notes) {clinicalFilters++;}
    if (filters.clinical.observations) {clinicalFilters++;}
    if (filters.clinical.measurements) {clinicalFilters++;}
  }

  return {
    visitFilters,
    personDemographicFilters,
    providerDemographicFilters,
    clinicalFilters,
    totalActiveFilters: visitFilters + personDemographicFilters + providerDemographicFilters + clinicalFilters,
  };
}
