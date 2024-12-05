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
