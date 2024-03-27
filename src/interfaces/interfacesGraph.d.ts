export interface Node {
  id: number;
  labels: string[];
  properties:
    | MultiModalDataPathNodeProperties
    | ProviderNodeProperties
    | EncounterNodeProperties
    | PatientNodeProperties
    | DepartmentNodeProperties;
}

export interface MultiModalDataPathNodeProperties {
  room_view?: string;
  transcript?: string;
  provider_view?: string;
  multi_modal_data_id: string;
}

export interface ProviderNodeProperties {
  race: string;
  ethnicity: string;
  date_of_birth: string;
  sex: string;
  provider_id: string;
}

export interface EncounterNodeProperties {
  patient_satisfaction: number;
  is_deidentified: boolean;
  is_restricted: boolean;
  case_id: string;
  encounter_date_and_time: string;
  provider_satisfaction: number;
}

export interface PatientNodeProperties {
  race: string;
  ethnicity: string;
  date_of_birth: string;
  patient_id: string;
  sex: string;
}

export interface DepartmentNodeProperties {
  name: string;
}

export interface Edge {
  source: number;
  target: number;
  type: string;
  properties: Record<string, unknown>;
}

export interface ApiResponse {
  nodes: Node[];
  edges: Edge[];
}
