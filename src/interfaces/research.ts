/**
 * TypeScript interface definitions for Research API
 * Backend endpoints: /api/v1/research/private/filter-options/ and /api/v1/research/private/visits-search/
 */

// ============================================================================
// Filter Options API Types
// ============================================================================

export interface FilterOptions {
  demographics: {
    genders: string[];
    races: string[];
    ethnicities: string[];
    year_of_birth_range: {
      min: number | null;
      max: number | null;
    };
  };
  visit_options: {
    tiers: number[];
    visit_sources: string[];
    date_range: {
      earliest: string | null;
      latest: string | null;
    };
  };
  clinical_options: {
    conditions: {
      available_codes: string[];
      available_values: string[];
      total_visits: number;
    };
    labs: {
      procedure_names: string[];
      result_flags: string[];
      order_statuses: string[];
      total_visits: number;
    };
    drugs: {
      common_drugs: string[];
      total_visits: number;
    };
    procedures: {
      common_names: string[];
      future_or_stand_options: string[];
      total_visits: number;
    };
    notes: {
      note_types: string[];
      note_statuses: string[];
      total_visits: number;
    };
    observations: {
      file_types: string[];
      total_visits: number;
    };
    measurements: {
      total_visits: number;
      bp_systolic_range: {
        min: number;
        max: number;
      };
      weight_range: {
        min: number;
        max: number;
      };
    };
  };
  total_accessible_visits: number;
}

// ============================================================================
// Visit Search API Types - Request
// ============================================================================

export interface VisitSearchFilters {
  visit?: {
    tier_id?: number[];
    date_from?: string;
    date_to?: string;
    visit_source_value?: string[];
  };
  person_demographics?: {
    gender?: string[];
    race?: string[];
    ethnicity?: string[];
    year_of_birth_from?: number;
    year_of_birth_to?: number;
  };
  provider_demographics?: {
    gender?: string[];
    race?: string[];
    ethnicity?: string[];
    year_of_birth_from?: number;
    year_of_birth_to?: number;
  };
  clinical?: {
    notes?: {
      note_types?: string[];
      note_statuses?: string[];
    };
    labs?: {
      procedure_names?: string[];
      result_flags?: string[];
      order_statuses?: string[];
    };
    conditions?: {
      condition_codes?: string[];
      condition_values?: string[];
    };
    drugs?: {
      drug_names?: string[];
    };
    procedures?: {
      procedure_names?: string[];
      future_or_stand?: string[];
    };
    observations?: {
      file_types?: string[];
    };
    measurements?: {
      bp_systolic_min?: number;
      bp_systolic_max?: number;
      weight_lb_min?: number;
      weight_lb_max?: number;
    };
  };
}

export interface VisitSearchSort {
  field: 'id' | 'visit_start_date' | 'tier_id' | 'visit_source_value' | 'person_id' | 'provider_id';
  direction: 'asc' | 'desc';
}

export interface VisitSearchRequest {
  filters?: VisitSearchFilters;
  sort?: VisitSearchSort;
  page?: number;
  page_size?: number;
}

// ============================================================================
// Visit Search API Types - Response
// ============================================================================

export interface VisitSearchResult {
  // Visit information
  visit_id: number;
  visit_date: string;
  visit_time: string | null;
  visit_source: string;
  visit_source_id: number;
  tier: number;

  // Person demographics
  patient_id: number;
  patient_age: number | null;
  patient_gender: string | null;
  patient_race: string | null;
  patient_ethnicity: string | null;
  patient_year_of_birth: number | null;

  // Provider demographics
  provider_id: number;
  provider_age: number | null;
  provider_gender: string | null;
  provider_race: string | null;
  provider_ethnicity: string | null;
  provider_year_of_birth: number | null;

  // Clinical counts (commented out in backend - all return 0)
  // condition_count: number;
  // drug_count: number;
  // procedure_count: number;
  // note_count: number;
  // lab_count: number;
  // observation_count: number;
  // measurement_count: number;
}

export interface VisitSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VisitSearchResult[];
  filter_summary: {
    total_visits: number;
    filtered_visits: number;
    active_filters: number;
  };
}
