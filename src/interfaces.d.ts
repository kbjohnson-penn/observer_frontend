export interface EncouterDataType {
  id: number;
  case_id: string;
  department: number;
  visit_type: string;
  is_deidentified: boolean;
  is_restricted: boolean;
  visit_date: string;
}

export interface DepartmentDataType {
  department_id: number;
  department_name: string;
}

export interface EncounterMediaTypeChoicesDataType {
    [key: string]: string;
}
