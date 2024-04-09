export interface PatientDataType {
  patient_id: string;
  date_of_birth: string;
  sex: string;
  race: string;
  ethnicity: string;
}

export interface ProviderDataType {
  provider_id: string;
  date_of_birth: string;
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
  multi_modal_data_id: string;
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
  case_id: string;
  provider: string;
  patient: string;
  encounter_source: string;
  department: string;
  multi_modal_data: string;
  encounter_date_and_time: string;
  patient_satisfaction: number;
  provider_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
}

export interface NestedCombinedDataType extends EncounterDataType {
  patient: PatientDataType;
  provider: ProviderDataType;
  multi_modal_data: MultiModalDataPathsDataType;
}

export interface FlattenedCombinedDataType extends EncounterDataType {
  patient_patient_id: string;
  patient_date_of_birth: string;
  patient_sex: string;
  patient_race: string;
  patient_ethnicity: string;
  provider_provider_id: string;
  provider_date_of_birth: string;
  provider_sex: string;
  provider_race: string;
  provider_ethnicity: string;
  multi_modal_data_id: string;
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
