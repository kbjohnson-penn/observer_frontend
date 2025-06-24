export interface PublicMultiModalDataType {
  id: number;
  provider_view: boolean;
  patient_view: boolean;
  room_view: boolean;
  audio: boolean;
  transcript: boolean;
  patient_survey: boolean;
  provider_survey: boolean;
  patient_annotation: boolean;
  provider_annotation: boolean;
}

// MultiModalData interface from encounter.ts
export interface MultiModalData {
  id: number;
  has_video: boolean;
  has_audio: boolean;
  has_imaging: boolean;
  has_clinical_notes: boolean;
  has_surveys: boolean;
  has_telemetry: boolean;
  has_lab_results: boolean;
  has_medications: boolean;
}
