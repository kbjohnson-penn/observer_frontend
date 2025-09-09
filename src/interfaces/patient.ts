export interface PatientDataType {
  id: number;
  patient_id: number;
  year_of_birth: string | null;
  sex: string;
  race: string;
  ethnicity: string;
}

export interface PublicPatientDataType {
  id: number;
  year_of_birth: string;
  sex: string;
  race: string;
  ethnicity: string;
}

// Patient interface from encounter.ts
export interface Patient {
  id: number;
  name?: string;
  patient_id: string;
}