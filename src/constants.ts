export const RACIAL_CATEGORIES: { [key: string]: string } = {
  AI: 'American Indian or Alaska Native',
  A: 'Asian',
  NHPI: 'Native Hawaiian or Other Pacific Islander',
  W: 'White',
  B: 'Black or African American',
  M: 'More than One Race',
  UN: 'Unknown',
};

export const ETHNIC_CATEGORIES: { [key: string]: string } = {
  NH: 'Not Hispanic or Latino',
  H: 'Hispanic or Latino',
  UN: 'Unknown or Not Reported Ethnicity',
};

export const GENDER_CATEGORIES: { [key: string]: string } = {
  M: 'Male',
  F: 'Female',
  UN: 'Unknown or Not Reported',
};

export const DEPARTMENT_COLORS: { [key: string]: string } = {
  SimCenter: '#8ED081',
  Oncology: '#B4D2BA',
  'Primary Care': '#DCE2AA',
  Neurology: '#FFD700',
  'Family Medicine': '#B57F50',
  Cardiology: '#FFC0CB',
  Orthopedics: '#4B543B',
};

export const SOURCE_OPTIONS = [
  { value: 'Simcenter', label: 'Simulation Center' },
  { value: 'Clinic', label: 'Clinic' },
  { value: 'Pennpersonalizedcare', label: 'Penn Personalized Care' },
];

export const DEIDENTIFIED_OPTIONS = [
  { value: null, label: 'All' },
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];

export const RACE_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'AI', label: 'American Indian or Alaska Native' },
  { value: 'A', label: 'Asian' },
  { value: 'NHPI', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'B', label: 'Black or African American' },
  { value: 'W', label: 'White' },
  { value: 'M', label: 'More than One Race' },
  { value: 'UN', label: 'Unknown or Not Reported' },
];

export const ACCESS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

export const MULTI_MODAL_DATA_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'provider_view', label: 'Provider View' },
  { value: 'patient_view', label: 'Patient View' },
  { value: 'room_view', label: 'Room View' },
  { value: 'audio', label: 'Audio' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'patient_survey', label: 'Patient Survey' },
  { value: 'provider_survey', label: 'Provider Survey' },
  { value: 'patient_annotation', label: 'Patient Annotation' },
  { value: 'provider_annotation', label: 'Provider Annotation' },
];

export const MULTI_MODAL_DATA_PATHS_COLORS: { [key: string]: string } = {
  provider_view: '#0088FE',
  patient_view: '#00C49F',
  room_view: '#FFBB28',
  audio: '#D84315',
  transcript: '#6A1B9A',
  patient_survey: '#00838F',
  provider_survey: '#3E2723',
  patient_annotation: '#FFD600',
  provider_annotation: '#FF6D00',
  // rias_transcript: "#FF8042",
  // rias_codes: "#F1C40F",
};

export const NODE_COLORS: { [key: string]: string } = {
  MultiModalDataPathNode: '#9d82ca',
  ProviderNode: '#EC7063',
  EncounterNode: '#2ECC71',
  PatientNode: '#3498DB',
  DepartmentNode: '#F1C40F',
};

export const EXPORT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export const CSV_COLUMN_ORDER = [
  'id',
  'provider_id',
  'patient_id',
  'encounter_source',
  'department',
  'encounter_date_and_time',
  'patient_satisfaction',
  'provider_satisfaction',
  'is_deidentified',
  'is_restricted',
  'patient_year_of_birth',
  'patient_sex',
  'patient_race',
  'patient_ethnicity',
  'provider_year_of_birth',
  'provider_sex',
  'provider_race',
  'provider_ethnicity',
  'provider_view',
  'patient_view',
  'room_view',
  'audio',
  'transcript',
  'patient_survey',
  'provider_survey',
  'patient_annotation',
  'provider_annotation',
];
