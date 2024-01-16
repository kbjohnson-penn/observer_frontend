export interface EncouterDataType {
  id: number;
  case_id: string;
  department: number;
  visit_type: string;
  racial_category: string;
  ethnic_category: string;
  gender: string;
  age_range: string;
  is_deidentified: boolean;
  is_restricted: boolean;
  visit_date: string;
}

export interface DepartmentDataType {
  [key: number]: string;
}

export interface EncounterMediaTypeChoicesDataType {
  [key: string]: string;
}
