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
