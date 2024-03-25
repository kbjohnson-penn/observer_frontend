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

export interface DepartmentDataType {
  name: string;
}

export interface MultiModalDataPathsDataType {
  multi_modal_data_id: string;
  [key: string]: string | number | undefined;
}

export interface EncouterDataType {
  case_id: string;
  provider: string;
  patient: string;
  department: string;
  multi_modal_data: string;
  encounter_date_and_time: string;
  patient_satisfaction: number;
  provider_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
}
