import { PublicPatientDataType, Patient } from './patient';
import { PublicProviderDataType, Provider } from './provider';
import { PublicMultiModalDataType, MultiModalData } from './mmd';
import { Department } from './department';

// Private API interfaces (different structure from public interfaces in interfaces.d.ts)
export interface EncounterDataType {
  id: number;
  case_id: string | null;
  encounter_source: number;
  department: number;
  provider: number;
  patient: number;
  encounter_date_and_time: string;
  provider_satisfaction: number;
  patient_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
  type: string;
  encounterfile_ids: number[];
  tier: number;
}

export interface EncounterSourceDataType {
  id: number;
  name: string;
}

export interface EncounterFileDataType {
  id: number;
  file_type: string;
  file_name: string;
  file_path: string;
  timestamp: string;
  encounter: number;
}

export interface PublicEncounterDataType {
  id: number;
  provider_id: number | string;
  patient_id: number | string;
  encounter_source: string;
  department: string;
  multi_modal_data_id: number | string;
  encounter_date_and_time: string;
  patient_satisfaction: number | string;
  provider_satisfaction: number | string;
  is_deidentified: boolean | string;
  is_restricted: boolean | string;
}

export interface PublicEncounterSourceDataType {
  name: string;
}

export interface NestedCombinedDataType {
  encounter: PublicEncounterDataType;
  patient: PublicPatientDataType;
  provider: PublicProviderDataType;
  multi_modal_data: PublicMultiModalDataType;
}

export interface FlattenedCombinedDataType {
  [key: string]: any; // Allow additional properties
}

export type CombinedDataType = NestedCombinedDataType | FlattenedCombinedDataType;

// Interfaces moved from encounter.ts

export interface EncounterSource {
  id: number;
  name: string;
}

export interface Tier {
  id: number;
  tier_name: string;
  level: number;
}

export interface EncounterFile {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  is_processed: boolean;
}

// Updated interface to match actual API response
export interface Encounter {
  id: number;
  case_id: string;
  encounter_source: number; // ID reference, not full object
  department: number; // ID reference, not full object
  provider: number; // ID reference, not full object
  patient: number; // ID reference, not full object
  encounter_date_and_time: string;
  provider_satisfaction?: number;
  patient_satisfaction?: number;
  is_deidentified: boolean;
  is_restricted: boolean;
  type: string;
  encounterfile_ids: number[];
  tier: number; // ID reference, not full object
  multi_modal_data: number; // ID reference, not full object
}

// Full object types for when we fetch related data
export interface EncounterWithDetails {
  id: number;
  case_id: string;
  encounter_source: EncounterSource;
  department: Department;
  provider: Provider;
  patient: Patient;
  encounter_date_and_time: string;
  provider_satisfaction?: number;
  patient_satisfaction?: number;
  is_deidentified: boolean;
  is_restricted: boolean;
  type: string;
  encounterfile_ids: number[];
  tier: Tier;
  multi_modal_data: MultiModalData;
}

export interface EncounterListResponse {
  results: Encounter[];
  count: number;
  next?: string;
  previous?: string;
}
