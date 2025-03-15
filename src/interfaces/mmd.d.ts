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
  timestamp: string;
}
