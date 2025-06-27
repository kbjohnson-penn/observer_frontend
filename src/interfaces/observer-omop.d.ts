// Observer Dataset OMOP-inspired interfaces based on observer_db_documentation.md

export interface Provider {
  id: number;
  provider_display_id: number;
  year_of_birth: number;
  gender_source_value: string;
  gender_source_concept_id: number;
  race_source_value: string;
  race_source_concept_id: number;
  ethnicity_source_value: string;
  ethnicity_source_concept_id: number;
}

export interface Person {
  id: number;
  person_display_id: number;
  year_of_birth: number;
  gender_source_value: string;
  gender_source_concept_id: number;
  race_source_value: string;
  race_source_concept_id: number;
  ethnicity_source_value: string;
  ethnicity_source_concept_id: number;
}

export interface VisitOccurrence {
  id: number;
  person_id: number;
  provider_id: number;
  visit_start_date: string;
  visit_start_time: string;
  visit_source_value: string;
  visit_source_id: number;
}

export interface Note {
  id: number;
  person_id: number;
  provider_id: number;
  visit_occurrence_id: number;
  note_date: string;
  note_text: string;
  note_type: string;
  note_status: string;
}

export interface ConditionOccurrence {
  id: number;
  visit_occurrence_id: number;
  is_primary_dx: string;
  condition_source_value: string;
  condition_concept_id: number;
  concept_code: string;
}

export interface DrugExposure {
  id: number;
  visit_occurrence_id: number;
  drug_ordering_date: string;
  drug_exposure_start_datetime: string;
  drug_exposure_end_datetime: string;
  description: string;
  quantity: string;
}

export interface ProcedureOccurrence {
  id: number;
  visit_occurrence_id: number;
  procedure_ordering_date: string;
  name: string;
  description: string;
  future_or_stand: string;
}

export interface Measurement {
  id: number;
  visit_occurrence_id: number;
  bp_systolic: number;
  bp_diastolic: number;
  phys_bp: string;
  weight_lb: number;
  height: string;
  pulse: number;
  phys_spo2: number;
}

export interface Observation {
  id: number;
  visit_occurrence_id: number;
  file_type: string;
  file_path: string;
  observation_date: string;
}

export interface PatientSurvey {
  id: number;
  visit_occurrence_id: number;
  form_1_timestamp: string;
  visit_date: string;
  patient_overall_health: number;
  patient_mental_emotional_health: number;
  patient_age: number;
  patient_education: number;
  overall_satisfaction_scale_1: number;
  overall_satisfaction_scale_2: number;
  tech_experience_1: number;
  tech_experience_2: number;
  relationship_with_provider_1: number;
  relationship_with_provider_2: number;
  hawthorne_1: number;
  hawthorne_2: number;
  hawthorne_3: number;
  hawthorne_4: number;
  visit_related_1: number;
  visit_related_2: number;
  visit_related_3: number;
  visit_related_4: number;
  visit_related_5: number;
  visit_related_6: number;
  hawthorne_5: number;
  open_ended_interaction: string;
  open_ended_change: string;
  open_ended_experience: string;
}

export interface ProviderSurvey {
  id: number;
  visit_occurrence_id: number;
  form_1_timestamp: string;
  visit_date: string;
  years_hcp_experience: number;
  tech_experience: number;
  communication_method___1: number;
  communication_method___2: number;
  communication_method___3: number;
  communication_method___4: number;
  communication_method___5: number;
  communication_other: string;
  inbasket_messages: number;
  overall_satisfaction_scale_1: number;
  overall_satisfaction_scale_2: number;
  patient_related_1: number;
  patient_related_2: number;
  patient_related_3: number;
  visit_related_1: number;
  visit_related_2: number;
  visit_related_4: number;
  hawthorne_1: number;
  hawthorne_2: number;
  hawthorne_3: number;
  open_ended_1: string;
  open_ended_2: string;
}

export interface AuditLogs {
  id: number;
  visit_occurrence_id: number;
  access_time: string;
  user_id: string;
  workstation_id: string;
  access_action: string;
  metric_id: number;
  metric_name: string;
  metric_desc: string;
  metric_type: string;
  metric_group: string;
  event_action_type: string;
  event_action_subtype: string;
}

export interface Concept {
  concept_id: number;
  concept_name: string;
  domain_id: string;
  concept_class_id: string;
  vocabulary_id: string;
}

// Type for table names
export type OMOPTableName = 
  | 'PROVIDER'
  | 'PERSON'
  | 'VISIT_OCCURRENCE'
  | 'NOTE'
  | 'CONDITION_OCCURRENCE'
  | 'DRUG_EXPOSURE'
  | 'PROCEDURE_OCCURRENCE'
  | 'MEASUREMENT'
  | 'OBSERVATION'
  | 'PATIENT_SURVEY'
  | 'PROVIDER_SURVEY'
  | 'AUDIT_LOGS'
  | 'CONCEPT';

// Table Information Interface
export interface TableInfo {
  name: OMOPTableName;
  displayName: string;
  description: string;
  color: string;
  category: 'person' | 'clinical' | 'survey' | 'admin' | 'multimodal';
  foreignKeys?: {
    field: string;
    referencesTable: OMOPTableName;
    referencesField: string;
  }[];
}

// Union type for all table data
export type OMOPTableData = 
  | Provider
  | Person
  | VisitOccurrence
  | Note
  | ConditionOccurrence
  | DrugExposure
  | ProcedureOccurrence
  | Measurement
  | Observation
  | PatientSurvey
  | ProviderSurvey
  | AuditLogs
  | Concept;