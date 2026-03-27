/**
 * TypeScript interfaces for the Observer encounter search API.
 * All fields sourced from research DB (de-identified OMOP dataset) — no PHI.
 */

export interface EncounterSearchFilters {
  department?: string[];
  date_from?: string;
  date_to?: string;
  icd_codes?: string[];
  cpt_codes?: string[];
  drug_names?: string[];
  note_types?: string[];
  patient_gender?: string[];
  patient_race?: string[];
  patient_ethnicity?: string[];
  provider_gender?: string[];
  provider_race?: string[];
  provider_ethnicity?: string[];
  has_transcript?: boolean;
  has_audio?: boolean;
  has_provider_view?: boolean;
  has_patient_view?: boolean;
  has_room_view?: boolean;
  has_notes?: boolean;
}

export type EncounterSearchSort = Partial<
  Record<'visit_date' | '_score' | 'tier_level', 'asc' | 'desc'>
>;

export interface EncounterSearchRequest {
  query?: string;
  filters?: EncounterSearchFilters;
  page?: number;
  page_size?: number;
  sort?: EncounterSearchSort;
  search_type?: 'keyword' | 'semantic';
}

export interface EncounterSearchHit {
  encounter_id: string;
  visit_source_value: string | null;
  visit_source_id: number | null;
  visit_date: string | null;
  department: string | null;
  // Patient demographics (de-identified — no name)
  patient_gender: string | null;
  patient_race: string | null;
  patient_ethnicity: string | null;
  patient_year_of_birth: number | null;
  // Provider demographics (de-identified — no name)
  provider_gender: string | null;
  provider_race: string | null;
  provider_ethnicity: string | null;
  provider_year_of_birth: number | null;
  // Multimodal flags
  has_transcript: boolean;
  has_audio: boolean;
  has_provider_view: boolean;
  has_patient_view: boolean;
  has_room_view: boolean;
  file_types: string[];
  // Clinical data
  icd_codes: string[];
  cpt_codes: string[];
  drug_names: string[];
  drug_count: number;
  has_notes: boolean;
  note_types: string[];
  note_count: number;
  // Access control
  tier_level: number;
  highlights: Record<string, string[]>;
  matched_in: string[];
}

export interface SearchAggregationBucket {
  key: string;
  count: number;
}

export interface SearchAggregations {
  departments: SearchAggregationBucket[];
  patient_genders: SearchAggregationBucket[];
  patient_races: SearchAggregationBucket[];
  patient_ethnicities: SearchAggregationBucket[];
  provider_genders: SearchAggregationBucket[];
  provider_races: SearchAggregationBucket[];
  provider_ethnicities: SearchAggregationBucket[];
  tier_distribution: SearchAggregationBucket[];
  note_types: SearchAggregationBucket[];
  file_types: SearchAggregationBucket[];
}

export interface EncounterSearchResponse {
  count: number;
  page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: EncounterSearchHit[];
  aggregations: SearchAggregations;
}
