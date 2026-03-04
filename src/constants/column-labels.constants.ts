export interface ColumnLabelDefinition {
  label: string; // Display name for column header
  description?: string; // Tooltip text for additional context
}

export type ColumnLabelsMap = Record<string, ColumnLabelDefinition>;

// =============================================================================
// SURVEY TABLES (from survey.csv)
// =============================================================================

export const PROVIDER_SURVEY_LABELS: ColumnLabelsMap = {
  id: { label: 'ID', description: 'Unique survey record identifier' },
  visit_occurrence_id: { label: 'Visit ID', description: 'Associated clinical visit' },
  visit_date: { label: 'Visit Date', description: 'Date of the clinical visit' },
  form_1_timestamp: { label: 'Survey Timestamp', description: 'When the survey was completed' },

  years_hcp_experience: {
    label: 'Years of Experience',
    description: 'How many years have you been practicing as a healthcare provider?',
  },
  tech_experience: {
    label: 'Tech Comfort Level',
    description: 'How would you rate your comfort level with using technology in healthcare?',
  },
  communication_method___1: {
    label: 'Prefers In-Person',
    description: 'Preferred method: In-person consultations',
  },
  communication_method___2: {
    label: 'Prefers Phone',
    description: 'Preferred method: Phone calls',
  },
  communication_method___3: {
    label: 'Prefers Email',
    description: 'Preferred method: Email',
  },
  communication_method___4: {
    label: 'Prefers Telehealth',
    description: 'Preferred method: Telehealth/video calls',
  },
  communication_method___5: {
    label: 'Other Method',
    description: 'Preferred method: Other (please specify)',
  },
  communication_other: {
    label: 'Other Method Details',
    description: 'Specification of other communication method',
  },
  inbasket_messages: {
    label: 'Weekly Messages',
    description: 'Average in-basket messages received per week',
  },
  overall_satisfaction_scale_1: {
    label: 'Overall Satisfaction',
    description: 'Overall satisfaction with the visit (rating scale)',
  },
  overall_satisfaction_scale_2: {
    label: 'Goal Achievement',
    description: 'Satisfaction with achieving goals for the patient (1-10 scale)',
  },
  patient_related_1: {
    label: 'Patient Understanding',
    description: 'Did the patient appear to understand your explanations?',
  },
  patient_related_2: {
    label: 'Patient Engagement',
    description: 'Did the patient appear to be engaged during the visit?',
  },
  patient_related_3: {
    label: 'Patient Respect',
    description: 'Did the patient show respect for what you had to say?',
  },
  visit_related_1: {
    label: 'Time Sufficient',
    description: 'Did you spend enough time talking with the patient?',
  },
  visit_related_2: {
    label: 'Care Satisfaction',
    description: 'Are you pleased with the care you and staff provided?',
  },
  visit_related_4: {
    label: 'Concerns Addressed',
    description: 'Were you able to address all patient concerns adequately?',
  },
  hawthorne_1: {
    label: 'Recording Comfort',
    description: 'Were you comfortable with recording devices during the visit?',
  },
  hawthorne_2: {
    label: 'Recording Awareness',
    description: 'Were you aware of the recording devices during the visit?',
  },
  hawthorne_3: {
    label: 'Recording Impact',
    description: 'Impact of recording devices on your perception of the visit',
  },
  open_ended_1: {
    label: 'Teachable Moment',
    description: "Any teachable moment you'd like trainees to see?",
  },
  open_ended_2: {
    label: 'Moment to Redo',
    description: 'Any moment you wish you could do over?',
  },
};

export const PATIENT_SURVEY_LABELS: ColumnLabelsMap = {
  id: { label: 'ID', description: 'Unique survey record identifier' },
  visit_occurrence_id: { label: 'Visit ID', description: 'Associated clinical visit' },
  visit_date: { label: 'Visit Date', description: 'Date of the clinical visit' },
  form_1_timestamp: { label: 'Survey Timestamp', description: 'When the survey was completed' },

  patient_overall_health: {
    label: 'Overall Health',
    description: 'How would you rate your overall health?',
  },
  patient_mental_emotional_health: {
    label: 'Mental/Emotional Health',
    description: 'How would you rate your overall mental and emotional health?',
  },
  patient_age: {
    label: 'Age',
    description: 'What is your age?',
  },
  patient_education: {
    label: 'Education Level',
    description: 'Highest grade or level of education completed',
  },
  overall_satisfaction_scale_1: {
    label: 'Overall Satisfaction',
    description: 'Overall satisfaction with your most recent visit (rating scale)',
  },
  overall_satisfaction_scale_2: {
    label: 'Visit Rating',
    description: 'Rate your most recent visit (1=worst, 10=best)',
  },
  tech_experience_1: {
    label: 'Telehealth Experience',
    description: 'Previous experience with telehealth or healthcare technology',
  },
  tech_experience_2: {
    label: 'MyChart Comfort',
    description: 'Do you feel comfortable using My Penn Medicine (MyChart)?',
  },
  relationship_with_provider_1: {
    label: 'Provider Relationship',
    description: 'How long have you had a relationship with your provider?',
  },
  relationship_with_provider_2: {
    label: 'Usual Provider',
    description: 'Is this your usual provider for check-ups and health problems?',
  },
  hawthorne_1: {
    label: 'Recording Comfort',
    description: 'Were you comfortable with recording devices during the visit?',
  },
  hawthorne_2: {
    label: 'Recording Influence',
    description: 'Did recording devices influence your behavior or responses?',
  },
  hawthorne_3: {
    label: 'Computer Impact',
    description: "Did provider's computer use affect your communication?",
  },
  hawthorne_4: {
    label: 'Unvoiced Concerns',
    description: 'Were there questions or concerns you did not bring up?',
  },
  hawthorne_5: {
    label: 'Recording Perception',
    description: 'Overall impact of recording devices on your visit perception',
  },
  visit_related_1: {
    label: 'Easy to Understand',
    description: 'Did your provider explain things in an easy-to-understand way?',
  },
  visit_related_2: {
    label: 'Listened Carefully',
    description: 'Did your provider listen carefully to you?',
  },
  visit_related_3: {
    label: 'Showed Respect',
    description: 'Did your provider show respect for what you had to say?',
  },
  visit_related_4: {
    label: 'Involved in Decisions',
    description: 'Did your provider involve you in decision-making about your care?',
  },
  visit_related_5: {
    label: 'Sufficient Time',
    description: 'Did your provider spend enough time talking with you?',
  },
  visit_related_6: {
    label: 'Confidence in Care',
    description: 'Do you feel confident in the care provided?',
  },
  open_ended_interaction: {
    label: 'Best Part',
    description: 'The best part of interaction with provider and why',
  },
  open_ended_change: {
    label: 'What to Change',
    description: 'If you could change one thing about the visit',
  },
  open_ended_experience: {
    label: 'Experience in One Word',
    description: 'Describe overall experience in one word',
  },
};

// =============================================================================
// CLINICAL TABLES
// =============================================================================

export const VISIT_OCCURRENCE_LABELS: ColumnLabelsMap = {
  id: { label: 'Visit ID', description: 'Unique identifier for this clinical visit' },
  person_id: { label: 'Patient ID', description: 'Patient associated with this visit' },
  provider_id: { label: 'Provider ID', description: 'Healthcare provider for this visit' },
  visit_start_date: { label: 'Visit Date', description: 'Date when the visit occurred' },
  visit_start_time: { label: 'Visit Time', description: 'Time when the visit started' },
  visit_source_value: {
    label: 'Visit Type',
    description: 'Type of visit (e.g., Office Visit, Telehealth)',
  },
  visit_source_id: {
    label: 'Visit Source ID',
    description: 'Source system identifier for visit type',
  },
};

export const CONDITION_OCCURRENCE_LABELS: ColumnLabelsMap = {
  id: { label: 'Condition ID', description: 'Unique identifier for this condition record' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit where condition was documented',
  },
  is_primary_dx: {
    label: 'Primary Diagnosis',
    description: 'Whether this is the primary diagnosis (Y/N)',
  },
  condition_source_value: {
    label: 'Diagnosis',
    description: 'Diagnosis or condition as written by the provider',
  },
  condition_concept_id: {
    label: 'OMOP Condition ID',
    description:
      'OMOP standard identifier for this condition, enabling consistent analysis across coding systems',
  },
  concept_code: {
    label: 'Concept Code',
    description: 'Code from medical vocabulary (e.g., ICD-10: "E11.9" for Type 2 Diabetes)',
  },
};

export const DRUG_EXPOSURE_LABELS: ColumnLabelsMap = {
  id: { label: 'Drug ID', description: 'Unique identifier for this drug record' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit where drug was prescribed',
  },
  drug_ordering_date: { label: 'Order Date', description: 'Date when medication was ordered' },
  drug_exposure_start_datetime: {
    label: 'Start Date/Time',
    description: 'When medication exposure began',
  },
  drug_exposure_end_datetime: {
    label: 'End Date/Time',
    description: 'When medication exposure ended',
  },
  description: { label: 'Medication', description: 'Name and description of the medication' },
  quantity: { label: 'Quantity', description: 'Amount of medication prescribed' },
};

export const PROCEDURE_OCCURRENCE_LABELS: ColumnLabelsMap = {
  id: { label: 'Procedure ID', description: 'Unique identifier for this procedure record' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit where procedure was performed',
  },
  procedure_ordering_date: { label: 'Order Date', description: 'Date when procedure was ordered' },
  name: { label: 'Procedure Name', description: 'Name of the procedure' },
  description: { label: 'Description', description: 'Detailed description of the procedure' },
  future_or_stand: {
    label: 'Status',
    description: 'Procedure status (future/standing order/completed)',
  },
};

export const MEASUREMENT_LABELS: ColumnLabelsMap = {
  id: { label: 'Measurement ID', description: 'Unique identifier for this measurement record' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit where measurements were taken',
  },
  bp_systolic: { label: 'Systolic BP', description: 'Systolic blood pressure (mmHg)' },
  bp_diastolic: { label: 'Diastolic BP', description: 'Diastolic blood pressure (mmHg)' },
  phys_bp: { label: 'BP Reading', description: 'Complete blood pressure reading as recorded' },
  weight_lb: { label: 'Weight (lbs)', description: 'Patient weight in pounds' },
  height: { label: 'Height', description: 'Patient height' },
  pulse: { label: 'Pulse', description: 'Heart rate (beats per minute)' },
  phys_spo2: { label: 'SpO2', description: 'Blood oxygen saturation percentage' },
};

export const NOTE_LABELS: ColumnLabelsMap = {
  id: { label: 'Note ID', description: 'Unique identifier for this clinical note' },
  person_id: { label: 'Patient ID', description: 'Patient this note is about' },
  provider_id: { label: 'Provider ID', description: 'Provider who wrote this note' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit associated with this note',
  },
  note_date: { label: 'Note Date', description: 'Date when the note was written' },
  note_text: { label: 'Note Content', description: 'Full text of the clinical note' },
  note_type: {
    label: 'Note Type',
    description: 'Type of clinical note (e.g., Progress Note, H&P)',
  },
  note_status: {
    label: 'Status',
    description: 'Note status (e.g., signed, unsigned, addended)',
  },
};

export const OBSERVATION_LABELS: ColumnLabelsMap = {
  id: { label: 'Observation ID', description: 'Unique identifier for this observation record' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit associated with this observation',
  },
  file_type: {
    label: 'File Type',
    description: 'Type of multimodal file (video, audio, transcript)',
  },
  file_path: { label: 'File Path', description: 'Storage location of the observation file' },
  observation_date: { label: 'Date', description: 'Date when observation was recorded' },
};

// =============================================================================
// PERSON TABLES
// =============================================================================

export const PERSON_LABELS: ColumnLabelsMap = {
  id: { label: 'Patient ID', description: 'Unique identifier for this patient' },
  person_display_id: { label: 'Display ID', description: 'Patient identifier shown to users' },
  year_of_birth: { label: 'Birth Year', description: 'Year the patient was born' },
  gender_source_value: { label: 'Gender', description: 'Patient gender as recorded' },
  gender_source_concept_id: {
    label: 'Gender Concept ID',
    description: 'OMOP concept ID for gender',
  },
  race_source_value: { label: 'Race', description: 'Patient race as recorded' },
  race_source_concept_id: { label: 'Race Concept ID', description: 'OMOP concept ID for race' },
  ethnicity_source_value: { label: 'Ethnicity', description: 'Patient ethnicity as recorded' },
  ethnicity_source_concept_id: {
    label: 'Ethnicity Concept ID',
    description: 'OMOP concept ID for ethnicity',
  },
};

export const PROVIDER_LABELS: ColumnLabelsMap = {
  id: { label: 'Provider ID', description: 'Unique identifier for this healthcare provider' },
  provider_display_id: { label: 'Display ID', description: 'Provider identifier shown to users' },
  year_of_birth: { label: 'Birth Year', description: 'Year the provider was born' },
  gender_source_value: { label: 'Gender', description: 'Provider gender as recorded' },
  gender_source_concept_id: {
    label: 'Gender Concept ID',
    description: 'OMOP concept ID for gender',
  },
  race_source_value: { label: 'Race', description: 'Provider race as recorded' },
  race_source_concept_id: { label: 'Race Concept ID', description: 'OMOP concept ID for race' },
  ethnicity_source_value: { label: 'Ethnicity', description: 'Provider ethnicity as recorded' },
  ethnicity_source_concept_id: {
    label: 'Ethnicity Concept ID',
    description: 'OMOP concept ID for ethnicity',
  },
};

// =============================================================================
// ADMIN TABLES
// =============================================================================

export const AUDIT_LOGS_LABELS: ColumnLabelsMap = {
  id: { label: 'Log ID', description: 'Unique identifier for this audit log entry' },
  visit_occurrence_id: {
    label: 'Visit ID',
    description: 'Clinical visit associated with this access event',
  },
  access_time: { label: 'Access Time', description: 'When the access occurred' },
  user_id: { label: 'User ID', description: 'User who performed the action' },
  workstation_id: {
    label: 'Workstation',
    description: 'Computer/workstation where access occurred',
  },
  access_action: { label: 'Action', description: 'Type of access action performed' },
  metric_id: { label: 'Metric ID', description: 'Identifier for the metric accessed' },
  metric_name: { label: 'Metric Name', description: 'Name of the metric accessed' },
  metric_desc: { label: 'Metric Description', description: 'Description of the metric' },
  metric_type: { label: 'Metric Type', description: 'Category type of the metric' },
  metric_group: { label: 'Metric Group', description: 'Group or category for the metric' },
  event_action_type: { label: 'Event Type', description: 'Type of event action' },
  event_action_subtype: { label: 'Event Subtype', description: 'Subtype of event action' },
};

export const CONCEPT_LABELS: ColumnLabelsMap = {
  concept_id: {
    label: 'Concept ID',
    description:
      'OMOP standard identifier that links to the global medical vocabulary (e.g., 201826 = Type 2 Diabetes across all systems)',
  },
  concept_name: {
    label: 'Concept Name',
    description: 'Human-readable name of the medical concept',
  },
  domain_id: {
    label: 'Domain',
    description: 'Domain this concept belongs to (e.g., Condition, Drug, Procedure)',
  },
  concept_class_id: {
    label: 'Concept Class',
    description: 'Classification of the concept within its domain',
  },
  vocabulary_id: {
    label: 'Vocabulary',
    description: 'Source vocabulary (e.g., SNOMED, ICD10, RxNorm)',
  },
  standard_concept: {
    label: 'Standard',
    description: 'Whether this is a standard concept (S) or maps to a standard concept',
  },
  concept_code: {
    label: 'Concept Code',
    description:
      'The actual code used in medical vocabularies (e.g., ICD-10: "E11.9" for Type 2 Diabetes, CPT: "99213" for office visit)',
  },
};

// =============================================================================
// COMMON FIELD LABELS (used across multiple tables)
// =============================================================================

export const COMMON_LABELS: ColumnLabelsMap = {
  id: { label: 'ID', description: 'Unique record identifier' },
  visit_occurrence_id: { label: 'Visit ID', description: 'Associated clinical visit' },
  person_id: { label: 'Patient ID', description: 'Patient identifier' },
  provider_id: { label: 'Provider ID', description: 'Healthcare provider identifier' },
};
