import type { OMOPTableName, TableInfo } from '@/interfaces/observer-omop.d';

export const TABLE_INFO: Record<OMOPTableName, TableInfo> = {
  PROVIDER: {
    name: 'PROVIDER',
    displayName: 'Healthcare Providers',
    description: 'Information about healthcare providers including demographics',
    color: 'blue',
    category: 'person'
  },
  PERSON: {
    name: 'PERSON',
    displayName: 'Patients',
    description: 'Patient demographic information',
    color: 'teal',
    category: 'person'
  },
  VISIT_OCCURRENCE: {
    name: 'VISIT_OCCURRENCE',
    displayName: 'Clinical Visits',
    description: 'Healthcare encounters and visits',
    color: 'green',
    category: 'clinical',
    foreignKeys: [
      { field: 'person_id', referencesTable: 'PERSON', referencesField: 'id' },
      { field: 'provider_id', referencesTable: 'PROVIDER', referencesField: 'id' }
    ]
  },
  NOTE: {
    name: 'NOTE',
    displayName: 'Clinical Notes',
    description: 'Clinical notes and documentation',
    color: 'yellow',
    category: 'clinical',
    foreignKeys: [
      { field: 'person_id', referencesTable: 'PERSON', referencesField: 'id' },
      { field: 'provider_id', referencesTable: 'PROVIDER', referencesField: 'id' },
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  CONDITION_OCCURRENCE: {
    name: 'CONDITION_OCCURRENCE',
    displayName: 'Conditions & Diagnoses',
    description: 'Medical conditions and diagnoses recorded during visits',
    color: 'red',
    category: 'clinical',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  DRUG_EXPOSURE: {
    name: 'DRUG_EXPOSURE',
    displayName: 'Medications',
    description: 'Drug prescriptions and medication records',
    color: 'purple',
    category: 'clinical',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  PROCEDURE_OCCURRENCE: {
    name: 'PROCEDURE_OCCURRENCE',
    displayName: 'Procedures',
    description: 'Medical procedures performed',
    color: 'pink',
    category: 'clinical',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  MEASUREMENT: {
    name: 'MEASUREMENT',
    displayName: 'Vital Signs & Labs',
    description: 'Vital signs and laboratory measurements',
    color: 'orange',
    category: 'clinical',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  OBSERVATION: {
    name: 'OBSERVATION',
    displayName: 'Multimodal Data Files',
    description: 'Video, audio, and transcript file paths',
    color: 'cyan',
    category: 'multimodal',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  PATIENT_SURVEY: {
    name: 'PATIENT_SURVEY',
    displayName: 'Patient Surveys',
    description: 'Patient satisfaction and experience surveys',
    color: 'indigo',
    category: 'survey',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  PROVIDER_SURVEY: {
    name: 'PROVIDER_SURVEY',
    displayName: 'Provider Surveys',
    description: 'Provider satisfaction and experience surveys',
    color: 'violet',
    category: 'survey',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  AUDIT_LOGS: {
    name: 'AUDIT_LOGS',
    displayName: 'Audit Logs',
    description: 'System access and action logs',
    color: 'gray',
    category: 'admin',
    foreignKeys: [
      { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' }
    ]
  },
  CONCEPT: {
    name: 'CONCEPT',
    displayName: 'OMOP Concepts',
    description: 'Medical terminology and concept definitions',
    color: 'slate',
    category: 'admin'
  }
};

// Medical terminology definitions for tooltips
export const MEDICAL_TERMS: Record<string, string> = {
  'OMOP': 'Observational Medical Outcomes Partnership - A common data model for healthcare data',
  'concept_id': 'A unique identifier for a medical concept in the OMOP vocabulary',
  'visit_occurrence': 'A clinical encounter between a patient and healthcare provider',
  'condition_occurrence': 'A diagnosis or medical condition recorded during a visit',
  'drug_exposure': 'A medication prescribed or administered to a patient',
  'procedure_occurrence': 'A medical procedure performed on a patient',
  'measurement': 'A clinical measurement like vital signs or lab results',
  'observation': 'Clinical observations or external data files',
  'primary_dx': 'Primary diagnosis - the main reason for the visit',
  'BP': 'Blood Pressure',
  'SpO2': 'Oxygen saturation level in blood',
  'provider_view': 'Video recording from the provider\'s perspective',
  'patient_view': 'Video recording from the patient\'s perspective',
  'room_view': 'Video recording showing the entire examination room',
  'affect': 'Emotional state or mood observed during interaction',
  'proficiency': 'Level of skill or competence demonstrated',
  'hawthorne': 'Hawthorne effect - behavioral changes due to observation awareness',
  'de-identified': 'Personal identifying information has been removed',
  'restricted': 'Access is limited to authorized researchers'
};

// Helper functions
export function getTableDisplayName(tableName: OMOPTableName): string {
  return TABLE_INFO[tableName]?.displayName || tableName;
}

export function getTableColor(tableName: OMOPTableName): string {
  return TABLE_INFO[tableName]?.color || 'gray';
}

export function getTablesByCategory(category: TableInfo['category']): OMOPTableName[] {
  return Object.keys(TABLE_INFO)
    .filter(key => TABLE_INFO[key as OMOPTableName].category === category) as OMOPTableName[];
}