/**
 * Dataset documentation structured data matching the Observer Dataset Documentation PDF.
 * Used to render the web version of the documentation at /documentation/dataset.
 */

export interface ColumnDefinition {
  name: string;
  type: string;
  description: string;
}

export interface TableDefinition {
  name: string;
  displayName: string;
  description: string;
  columns: ColumnDefinition[];
}

// --- Table definitions ---

export const CORE_CLINICAL_TABLES: TableDefinition[] = [
  {
    name: 'PROVIDER',
    displayName: 'Provider',
    description: 'Stores demographic information about healthcare providers.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique provider identifier (PK)' },
      { name: 'year_of_birth', type: 'INTEGER', description: 'Year of birth' },
      { name: 'gender_source_value', type: 'TEXT', description: 'Gender as recorded in source' },
      {
        name: 'gender_source_concept_id',
        type: 'INTEGER',
        description: 'FK to CONCEPT for gender',
      },
      { name: 'race_source_value', type: 'TEXT', description: 'Race as recorded in source' },
      { name: 'race_source_concept_id', type: 'INTEGER', description: 'FK to CONCEPT for race' },
      {
        name: 'ethnicity_source_value',
        type: 'TEXT',
        description: 'Ethnicity as recorded in source',
      },
      {
        name: 'ethnicity_source_concept_id',
        type: 'INTEGER',
        description: 'FK to CONCEPT for ethnicity',
      },
    ],
  },
  {
    name: 'PERSON',
    displayName: 'Person',
    description: 'Contains demographic information for patients.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique patient identifier (PK)' },
      { name: 'year_of_birth', type: 'INTEGER', description: 'Year of birth' },
      { name: 'gender_source_value', type: 'TEXT', description: 'Gender as recorded in source' },
      {
        name: 'gender_source_concept_id',
        type: 'INTEGER',
        description: 'FK to CONCEPT for gender',
      },
      { name: 'race_source_value', type: 'TEXT', description: 'Race as recorded in source' },
      { name: 'race_source_concept_id', type: 'INTEGER', description: 'FK to CONCEPT for race' },
      {
        name: 'ethnicity_source_value',
        type: 'TEXT',
        description: 'Ethnicity as recorded in source',
      },
      {
        name: 'ethnicity_source_concept_id',
        type: 'INTEGER',
        description: 'FK to CONCEPT for ethnicity',
      },
    ],
  },
  {
    name: 'VISIT_OCCURRENCE',
    displayName: 'Visit Occurrence',
    description: 'Represents an individual outpatient encounter.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique visit identifier (PK)' },
      { name: 'person_id', type: 'INTEGER', description: 'FK to PERSON' },
      { name: 'provider_id', type: 'INTEGER', description: 'FK to PROVIDER' },
      { name: 'visit_start_date', type: 'TEXT', description: 'Date of the visit' },
      { name: 'visit_start_time', type: 'TEXT', description: 'Time of the visit' },
      {
        name: 'visit_source_value',
        type: 'TEXT',
        description: 'Visit type as recorded in source',
      },
      { name: 'visit_source_id', type: 'INTEGER', description: 'Source system visit identifier' },
    ],
  },
  {
    name: 'NOTE',
    displayName: 'Note',
    description: 'Stores clinical notes associated with a visit.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique note identifier' },
      { name: 'person_id', type: 'INTEGER', description: 'FK to PERSON' },
      { name: 'provider_id', type: 'INTEGER', description: 'FK to PROVIDER' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      { name: 'note_date', type: 'TEXT', description: 'Date the note was written' },
      { name: 'note_text', type: 'TEXT', description: 'Full text of the clinical note' },
      { name: 'note_type', type: 'TEXT', description: 'Type of clinical note' },
      { name: 'note_status', type: 'TEXT', description: 'Status of the note' },
    ],
  },
  {
    name: 'CONDITION_OCCURRENCE',
    displayName: 'Condition Occurrence',
    description: 'Captures diagnoses recorded during a visit.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique condition identifier' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      {
        name: 'is_primary_dx',
        type: 'TEXT',
        description: 'Whether this is the primary diagnosis',
      },
      {
        name: 'condition_source_value',
        type: 'TEXT',
        description: 'Condition as recorded in source',
      },
      {
        name: 'condition_concept_id',
        type: 'INTEGER',
        description: 'FK to CONCEPT for condition',
      },
      { name: 'concept_code', type: 'TEXT', description: 'Standardized concept code (e.g. ICD)' },
    ],
  },
  {
    name: 'DRUG_EXPOSURE',
    displayName: 'Drug Exposure',
    description: 'Records medications ordered or administered.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique drug exposure identifier' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      { name: 'drug_ordering_date', type: 'TEXT', description: 'Date the drug was ordered' },
      {
        name: 'drug_exposure_start_datetime',
        type: 'TEXT',
        description: 'Start of drug exposure',
      },
      { name: 'drug_exposure_end_datetime', type: 'TEXT', description: 'End of drug exposure' },
      { name: 'description', type: 'TEXT', description: 'Description of the medication' },
      { name: 'quantity', type: 'TEXT', description: 'Quantity prescribed' },
    ],
  },
  {
    name: 'PROCEDURE_OCCURRENCE',
    displayName: 'Procedure Occurrence',
    description: 'Documents clinical procedures performed or ordered.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique procedure identifier' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      {
        name: 'procedure_ordering_date',
        type: 'TEXT',
        description: 'Date the procedure was ordered',
      },
      { name: 'name', type: 'TEXT', description: 'Name of the procedure' },
      { name: 'description', type: 'TEXT', description: 'Description of the procedure' },
      {
        name: 'future_or_stand',
        type: 'TEXT',
        description: 'Whether the procedure is future or standing',
      },
    ],
  },
  {
    name: 'MEASUREMENT',
    displayName: 'Measurement',
    description: 'Stores quantitative clinical measurements.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique measurement identifier' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      { name: 'bp_systolic', type: 'INTEGER', description: 'Systolic blood pressure' },
      { name: 'bp_diastolic', type: 'INTEGER', description: 'Diastolic blood pressure' },
      { name: 'phys_bp', type: 'TEXT', description: 'Physical blood pressure reading' },
      { name: 'weight_lb', type: 'REAL', description: 'Weight in pounds' },
      { name: 'height', type: 'TEXT', description: 'Height' },
      { name: 'pulse', type: 'INTEGER', description: 'Pulse rate' },
      { name: 'phys_spo2', type: 'INTEGER', description: 'SpO2 oxygen saturation' },
    ],
  },
];

export const MULTIMEDIA_TABLE: TableDefinition = {
  name: 'OBSERVATION',
  displayName: 'Observation',
  description: 'Stores file references to multimedia and derived artifacts associated with visits.',
  columns: [
    { name: 'id', type: 'INTEGER', description: 'Unique observation identifier' },
    { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
    {
      name: 'file_type',
      type: 'TEXT',
      description: 'Type of file (e.g. video, audio, transcript)',
    },
    { name: 'file_path', type: 'TEXT', description: 'Path to the file' },
    { name: 'observation_date', type: 'TEXT', description: 'Date of the observation' },
  ],
};

export const SURVEY_TABLES: TableDefinition[] = [
  {
    name: 'PATIENT_SURVEY',
    displayName: 'Patient Survey',
    description:
      'Stores patient-reported outcomes and visit experience data. Responses include general health, technology comfort, satisfaction, Hawthorne effect measures, and open-ended feedback. Most coded responses use ordinal mappings documented per column.',
    columns: [],
  },
  {
    name: 'PROVIDER_SURVEY',
    displayName: 'Provider Survey',
    description:
      'Captures provider perspectives on visit quality, communication, workload, and technology use, including multiple-choice, Likert-scale, and open-ended responses.',
    columns: [],
  },
];

export const AUDIT_VOCABULARY_TABLES: TableDefinition[] = [
  {
    name: 'AUDIT_LOGS',
    displayName: 'Audit Logs',
    description: 'Tracks access and usage events related to visit data.',
    columns: [
      { name: 'id', type: 'INTEGER', description: 'Unique audit log identifier' },
      { name: 'visit_occurrence_id', type: 'INTEGER', description: 'FK to VISIT_OCCURRENCE' },
      { name: 'access_time', type: 'TEXT', description: 'Time of the access event' },
      { name: 'user_id', type: 'TEXT', description: 'Identifier of the user' },
      { name: 'workstation_id', type: 'TEXT', description: 'Identifier of the workstation' },
      { name: 'access_action', type: 'TEXT', description: 'Type of access action performed' },
    ],
  },
  {
    name: 'CONCEPT',
    displayName: 'Concept',
    description: 'Defines standardized clinical concepts derived from controlled vocabularies.',
    columns: [
      { name: 'concept_id', type: 'INTEGER', description: 'Unique concept identifier' },
      { name: 'concept_name', type: 'TEXT', description: 'Human-readable concept name' },
      { name: 'domain_name', type: 'TEXT', description: 'Domain of the concept' },
      { name: 'vocabulary_name', type: 'TEXT', description: 'Source vocabulary name' },
      { name: 'concept_class_name', type: 'TEXT', description: 'Class of the concept' },
      {
        name: 'standard_concept',
        type: 'TEXT',
        description: 'Whether this is a standard concept',
      },
      { name: 'concept_code', type: 'TEXT', description: 'Code from the source vocabulary' },
    ],
  },
];

export const DOCUMENTATION_NOTES = [
  'All identifiers are de-identified and non-reversible.',
  'Multimedia files are stored externally and referenced by path.',
  'The schema is designed to align closely with OMOP CDM while supporting multimodal research use cases.',
];
