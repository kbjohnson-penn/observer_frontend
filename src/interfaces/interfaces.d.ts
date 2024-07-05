export interface PatientDataType {
  id: number;
  patient_id: number;
  year_of_birth: string | null;
  sex: string;
  race: string;
  ethnicity: string;
}

export interface ProviderDataType {
  id: number;
  provider_id: number;
  year_of_birth: string | null;
  sex: string;
  race: string;
  ethnicity: string;
}

export interface EncounterSourceDataType {
  name: string;
}

export interface DepartmentDataType {
  name: string;
}

export interface MultiModalDataPathsDataType {
  id: number;
  provider_view: boolean;
  patient_view: boolean;
  room_view: boolean;
  audio: boolean;
  transcript: boolean;
  patient_survey: boolean;
  provider_survey: boolean;
  rias_transcript: boolean;
  rias_codes: boolean;
}

export interface EncounterDataType {
  id: number;
  provider_id: number;
  patient_id: number;
  encounter_source: string;
  department: string;
  multi_modal_data_id: number;
  encounter_date_and_time: string;
  patient_satisfaction: number;
  provider_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
}

export interface EncounterSimCenterDataType {
  id: number;
  provider_id: number;
  patient_id: number;
  encounter_source: string;
  department: string;
  multi_modal_data_id: number;
  encounter_date_and_time: string;
  is_deidentified: boolean;
  is_restricted: boolean;
}

export interface EncounterRIASDataType {
  id: number;
  provider_id: number;
  patient_id: number;
  encounter_source: string;
  department: string;
  multi_modal_data_id: number;
  is_deidentified: boolean;
  is_restricted: boolean;
}

export type CombinedEncounterDataType =
  | EncounterDataType
  | EncounterSimCenterDataType
  | EncounterRIASDataType;

export interface NestedCombinedDataType {
  encounter: EncounterDataType;
  patient: PatientDataType;
  provider: ProviderDataType;
  multi_modal_data: MultiModalDataPathsDataType;
}

export interface FlattenedCombinedDataType {
  id: number;
  provider_id: number;
  patient_id: number;
  multi_modal_data_id: number;
  encounter_source: string;
  department: string;
  encounter_date_and_time: string;
  patient_satisfaction: number;
  provider_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
  patient_year_of_birth: string | null;
  patient_sex: string;
  patient_race: string;
  patient_ethnicity: string;
  provider_year_of_birth: string | null;
  provider_sex: string;
  provider_race: string;
  provider_ethnicity: string;
  provider_view: boolean;
  patient_view: boolean;
  room_view: boolean;
  audio: boolean;
  transcript: boolean;
  patient_survey: boolean;
  provider_survey: boolean;
  rias_transcript: boolean;
  rias_codes: boolean;
}

export type CombinedDataType =
  | NestedCombinedDataType
  | FlattenedCombinedDataType;
