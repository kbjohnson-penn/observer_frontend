import type { OMOPTableName, TableInfo } from '@/interfaces/observer-omop.d';

export const TABLE_INFO: Record<OMOPTableName, TableInfo> = {
  PROVIDER: {
    name: 'PROVIDER',
    displayName: 'Providers',
    description: 'Information about providers including demographics',
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
  // General OMOP Terms
  'OMOP': 'Observational Medical Outcomes Partnership - A common data model for healthcare data',
  'concept_id': 'A unique identifier for a medical concept in the OMOP vocabulary',
  'concept_code': 'The actual code used in medical vocabularies (e.g., ICD-10, CPT)',
  'standard_concept': 'Indicates if this is a standard concept (S) or classification concept',
  'domain_id': 'The domain this concept belongs to (e.g., Condition, Drug, Procedure)',
  'vocabulary_id': 'The source vocabulary (e.g., ICD10CM, SNOMED, CPT4)',
  'concept_class_id': 'The classification of the concept within its vocabulary',
  
  // Person/Provider Fields
  'person_id': 'Unique identifier for a patient in the database',
  'provider_id': 'Unique identifier for a healthcare provider',
  'year_of_birth': 'Year the person was born (age calculation)',
  'gender_source_value': 'Gender as recorded in source system (M/F)',
  'gender_source_concept_id': 'OMOP concept ID for gender',
  'race_source_value': 'Race as recorded in source system',
  'race_source_concept_id': 'OMOP concept ID for race',
  'ethnicity_source_value': 'Ethnicity as recorded in source system',
  'ethnicity_source_concept_id': 'OMOP concept ID for ethnicity',
  
  // Visit Fields
  'visit_occurrence_id': 'Unique identifier for a clinical visit or encounter',
  'visit_start_date': 'The date the visit began',
  'visit_start_time': 'The time the visit began',
  'visit_source_value': 'Type of visit (e.g., clinic, hospital, emergency)',
  'visit_source_id': 'Numeric identifier for the visit type',
  
  // Clinical Note Fields
  'note_date': 'Date when the clinical note was written',
  'note_text': 'The actual text content of the clinical note',
  'note_type': 'Type of note (e.g., Progress Notes, Patient Instructions)',
  'note_status': 'Status of the note (e.g., Signed, Draft, Addendum)',
  
  // Condition Fields
  'condition_source_value': 'The diagnosis or condition as written by the provider',
  'condition_concept_id': 'OMOP concept ID for the standardized condition',
  'is_primary_dx': 'Whether this is the primary diagnosis (Y/N)',
  
  // Drug/Medication Fields
  'drug_ordering_date': 'Date when the medication was ordered',
  'drug_exposure_start_datetime': 'When the patient started taking the medication',
  'drug_exposure_end_datetime': 'When the patient stopped taking the medication',
  'quantity': 'Amount of medication prescribed (e.g., 90 tablets)',
  
  // Procedure Fields
  'procedure_ordering_date': 'Date when the procedure was ordered',
  'future_or_stand': 'Whether this is a future procedure (F) or completed (S)',
  
  // Measurement/Vital Signs
  'bp_systolic': 'Systolic blood pressure (top number)',
  'bp_diastolic': 'Diastolic blood pressure (bottom number)',
  'phys_bp': 'Blood pressure reading in standard format (systolic/diastolic)',
  'weight_lb': 'Patient weight in pounds',
  'height': 'Patient height in feet and inches',
  'pulse': 'Heart rate in beats per minute',
  'phys_spo2': 'Oxygen saturation percentage in blood',
  
  // Multimodal/Observation Fields
  'file_type': 'Type of media file (patient_view, provider_view, room_view, transcript)',
  'file_path': 'Location of the media file on the system',
  'observation_date': 'Date when the observation/recording was made',
  'patient_view': 'Video recording from the patient\'s perspective during the visit',
  'provider_view': 'Video recording from the healthcare provider\'s perspective',
  'room_view': 'Video recording showing the entire examination room',
  'transcript': 'Text transcript of the conversation during the visit',
  
  // Survey Fields
  'form_1_timestamp': 'Date and time when the survey was completed',
  'visit_date': 'Date of the clinical visit this survey refers to',
  'patient_overall_health': 'Patient\'s self-assessment of overall health (1-5 scale)',
  'patient_mental_emotional_health': 'Patient\'s mental and emotional health rating',
  'overall_satisfaction_scale_1': 'Overall satisfaction rating (1-5 scale)',
  'overall_satisfaction_scale_2': 'Overall satisfaction rating (1-10 scale)',
  'tech_experience': 'Experience level with technology (1-5 scale)',
  'relationship_with_provider': 'Quality of relationship with healthcare provider',
  'hawthorne_1': 'Hawthorne effect question - awareness of being observed',
  'hawthorne_2': 'Hawthorne effect question - behavior change due to observation',
  'hawthorne_3': 'Hawthorne effect question - impact on visit experience',
  'years_hcp_experience': 'Years of experience as a healthcare provider',
  'communication_method': 'Preferred method of communication with patients',
  'inbasket_messages': 'Number of electronic messages received',
  
  // Audit Log Fields
  'access_time': 'Date and time when the system was accessed',
  'user_id': 'Unique identifier for the user who accessed the system',
  'workstation_id': 'Unique identifier for the computer/workstation used',
  'access_action': 'Type of action performed (e.g., QUERY, UPDATE, DELETE)',
  'metric_id': 'Unique identifier for the specific metric being tracked',
  'metric_name': 'Name of the metric or action being logged',
  'metric_desc': 'Description of the metric or action',
  'metric_type': 'Category of the metric (e.g., APPLICATION EVENT)',
  'metric_group': 'Grouping of related metrics for analysis',
  'event_action_type': 'High-level category of the action (e.g., EXPORT, VIEW)',
  'event_action_subtype': 'More specific categorization of the action',
  
  // Medical Abbreviations and Terms
  'BP': 'Blood Pressure - the force of blood against artery walls',
  'SpO2': 'Oxygen saturation - percentage of oxygen in the blood',
  'LFTs': 'Liver Function Tests - blood tests to check liver health',
  'A1c': 'Hemoglobin A1c - average blood sugar over 2-3 months',
  'LDL': 'Low-Density Lipoprotein - "bad" cholesterol',
  'OSA': 'Obstructive Sleep Apnea - breathing disorder during sleep',
  'CPAP': 'Continuous Positive Airway Pressure - sleep apnea treatment',
  'OA': 'Osteoarthritis - joint disease causing pain and stiffness',
  'PT': 'Physical Therapy - treatment to improve movement and reduce pain',
  'RSV': 'Respiratory Syncytial Virus - common respiratory infection',
  'BMI': 'Body Mass Index - measure of body fat based on height and weight',
  'Pre-DM': 'Pre-diabetes - blood sugar higher than normal but not diabetic yet',
  'CMS-HCC': 'Centers for Medicare & Medicaid Services Hierarchical Condition Category',
  
  // Data Privacy Terms
  'de-identified': 'Personal identifying information has been removed for privacy',
  'restricted': 'Access is limited to authorized researchers only',
  'PHI': 'Protected Health Information - individually identifiable health data'
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