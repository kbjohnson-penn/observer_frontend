import { PublicPatientDataType } from "@/interfaces/patient";
import { PublicProviderDataType } from "@/interfaces/provider";
import { PublicMultiModalDataType } from "@/interfaces/mmd";

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

export type CombinedDataType =
  | NestedCombinedDataType
  | FlattenedCombinedDataType;
