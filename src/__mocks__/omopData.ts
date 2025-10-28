/**
 * Mock OMOP Data for Testing
 * Provides realistic test data for all OMOP tables
 */

import {
  Person,
  Provider,
  VisitOccurrence,
  Note,
  ConditionOccurrence,
  DrugExposure,
  ProcedureOccurrence,
  Measurement,
  Observation,
  PatientSurvey,
  ProviderSurvey,
  AuditLogs,
  Concept,
  SampleDataAPIResponse,
} from '@/interfaces/observer-omop';

export const mockPersons: Person[] = [
  {
    id: 1,
    person_display_id: 101,
    year_of_birth: 1985,
    gender_source_value: 'M',
    gender_source_concept_id: 8507,
    race_source_value: 'White',
    race_source_concept_id: 8527,
    ethnicity_source_value: 'Not Hispanic',
    ethnicity_source_concept_id: 38003564,
  },
  {
    id: 2,
    person_display_id: 102,
    year_of_birth: 1990,
    gender_source_value: 'F',
    gender_source_concept_id: 8532,
    race_source_value: 'Black',
    race_source_concept_id: 8516,
    ethnicity_source_value: 'Hispanic',
    ethnicity_source_concept_id: 38003563,
  },
  {
    id: 3,
    person_display_id: 103,
    year_of_birth: 1978,
    gender_source_value: 'F',
    gender_source_concept_id: 8532,
    race_source_value: 'Asian',
    race_source_concept_id: 8515,
    ethnicity_source_value: 'Not Hispanic',
    ethnicity_source_concept_id: 38003564,
  },
];

export const mockProviders: Provider[] = [
  {
    id: 1,
    provider_display_id: 201,
    year_of_birth: 1975,
    gender_source_value: 'F',
    gender_source_concept_id: 8532,
    race_source_value: 'White',
    race_source_concept_id: 8527,
    ethnicity_source_value: 'Not Hispanic',
    ethnicity_source_concept_id: 38003564,
  },
  {
    id: 2,
    provider_display_id: 202,
    year_of_birth: 1980,
    gender_source_value: 'M',
    gender_source_concept_id: 8507,
    race_source_value: 'Asian',
    race_source_concept_id: 8515,
    ethnicity_source_value: 'Not Hispanic',
    ethnicity_source_concept_id: 38003564,
  },
];

export const mockVisits: VisitOccurrence[] = [
  {
    id: 1,
    person_id: 1,
    provider_id: 1,
    visit_start_date: '2024-01-15',
    visit_start_time: '09:30:00',
    visit_source_value: 'Office Visit',
    visit_source_id: 1,
  },
  {
    id: 2,
    person_id: 2,
    provider_id: 1,
    visit_start_date: '2024-01-16',
    visit_start_time: '14:00:00',
    visit_source_value: 'Telehealth',
    visit_source_id: 2,
  },
  {
    id: 3,
    person_id: 1,
    provider_id: 2,
    visit_start_date: '2024-02-20',
    visit_start_time: '10:15:00',
    visit_source_value: 'Emergency',
    visit_source_id: 3,
  },
];

export const mockNotes: Note[] = [
  {
    id: 1,
    person_id: 1,
    provider_id: 1,
    visit_occurrence_id: 1,
    note_date: '2024-01-15',
    note_text: 'Patient presents with mild headache and fatigue.',
    note_type: 'Progress Note',
    note_status: 'Final',
  },
  {
    id: 2,
    person_id: 2,
    provider_id: 1,
    visit_occurrence_id: 2,
    note_date: '2024-01-16',
    note_text: 'Follow-up visit for chronic condition management.',
    note_type: 'Progress Note',
    note_status: 'Final',
  },
];

export const mockConditions: ConditionOccurrence[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    is_primary_dx: 'Y',
    condition_source_value: 'Hypertension',
    condition_concept_id: 320128,
    concept_code: 'I10',
  },
  {
    id: 2,
    visit_occurrence_id: 2,
    is_primary_dx: 'N',
    condition_source_value: 'Type 2 Diabetes',
    condition_concept_id: 201826,
    concept_code: 'E11',
  },
];

export const mockDrugs: DrugExposure[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    drug_ordering_date: '2024-01-15',
    drug_exposure_start_datetime: '2024-01-15 09:30:00',
    drug_exposure_end_datetime: '2024-02-15 09:30:00',
    description: 'Lisinopril 10mg',
    quantity: '30',
  },
];

export const mockProcedures: ProcedureOccurrence[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    procedure_ordering_date: '2024-01-15',
    name: 'Blood Pressure Check',
    description: 'Routine vital signs assessment',
    future_or_stand: 'Completed',
  },
];

export const mockMeasurements: Measurement[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    bp_systolic: 130,
    bp_diastolic: 85,
    phys_bp: '130/85',
    weight_lb: 180,
    height: '5\'10"',
    pulse: 72,
    phys_spo2: 98,
  },
];

export const mockObservations: Observation[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    file_type: 'audio',
    file_path: '/media/audio/visit_1.mp3',
    observation_date: '2024-01-15',
  },
];

export const mockPatientSurveys: PatientSurvey[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    form_1_timestamp: '2024-01-15 09:00:00',
    visit_date: '2024-01-15',
    form_1_q1: 'Good',
    form_1_q2: 'Improving',
  },
];

export const mockProviderSurveys: ProviderSurvey[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    form_1_timestamp: '2024-01-15 10:00:00',
    visit_date: '2024-01-15',
    form_1_q1: 'Thorough examination completed',
  },
];

export const mockAuditLogs: AuditLogs[] = [
  {
    id: 1,
    visit_occurrence_id: 1,
    action: 'CREATE',
    timestamp: '2024-01-15 09:30:00',
    user_id: 1,
    details: 'Visit record created',
  },
];

export const mockConcepts: Concept[] = [
  {
    id: 1,
    concept_id: 320128,
    concept_name: 'Hypertension',
    domain_id: 'Condition',
    vocabulary_id: 'SNOMED',
    concept_class_id: 'Clinical Finding',
    concept_code: 'I10',
  },
];

export const mockSampleData: SampleDataAPIResponse = {
  persons: mockPersons,
  providers: mockProviders,
  visits: mockVisits,
  notes: mockNotes,
  conditions: mockConditions,
  drugs: mockDrugs,
  procedures: mockProcedures,
  measurements: mockMeasurements,
  observations: mockObservations,
  patient_surveys: mockPatientSurveys,
  provider_surveys: mockProviderSurveys,
  audit_logs: mockAuditLogs,
  concepts: mockConcepts,
  _metadata: {
    description: 'Mock sample data for testing',
    source: 'test',
    count: {
      persons: mockPersons.length,
      providers: mockProviders.length,
      visits: mockVisits.length,
      notes: mockNotes.length,
      conditions: mockConditions.length,
      drugs: mockDrugs.length,
      procedures: mockProcedures.length,
      measurements: mockMeasurements.length,
      observations: mockObservations.length,
      patient_surveys: mockPatientSurveys.length,
      provider_surveys: mockProviderSurveys.length,
      audit_logs: mockAuditLogs.length,
      concepts: mockConcepts.length,
    },
  },
};

// Helper to generate large datasets for pagination testing
export const generateMockPersons = (count: number): Person[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    person_display_id: 100 + i,
    year_of_birth: 1950 + (i % 50),
    gender_source_value: i % 2 === 0 ? 'M' : 'F',
    gender_source_concept_id: i % 2 === 0 ? 8507 : 8532,
    race_source_value: ['White', 'Black', 'Asian', 'Other'][i % 4],
    race_source_concept_id: 8527,
    ethnicity_source_value: i % 3 === 0 ? 'Hispanic' : 'Not Hispanic',
    ethnicity_source_concept_id: i % 3 === 0 ? 38003563 : 38003564,
  }));
};
