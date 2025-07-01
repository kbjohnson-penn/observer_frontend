import {
  Provider,
  Person,
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
  OMOPTableName
} from '@/interfaces/observer-omop';

// Sample data for demonstration
export const sampleData: Record<OMOPTableName, any[]> = {
  PROVIDER: [
    {
      id: 16,
      year_of_birth: 1978,
      gender_source_value: 'M',
      gender_source_concept_id: 8507,
      race_source_value: 'W',
      race_source_concept_id: 8527,
      ethnicity_source_value: 'NH',
      ethnicity_source_concept_id: 38003564
    }
  ] as Provider[],

  PERSON: [
    {
      id: 101,
      year_of_birth: 1961,
      gender_source_value: 'M',
      gender_source_concept_id: 8507,
      race_source_value: 'B',
      race_source_concept_id: 8516,
      ethnicity_source_value: 'NH',
      ethnicity_source_concept_id: 38003564
    }
  ] as Person[],

  VISIT_OCCURRENCE: [
    {
      id: 103,
      person_id: 101,
      provider_id: 16,
      visit_start_date: '2025-03-15',
      visit_start_time: '00:00:00',
      visit_source_value: 'clinic',
      visit_source_id: 1
    }
  ] as VisitOccurrence[],

  NOTE: [
    {
      id: 1,
      person_id: 101,
      provider_id: 16,
      visit_occurrence_id: 103,
      note_date: '2025-03-15',
      note_text: 'RSV vaccine at your **LOCATION**    Increase rosuvastatin to 20 mg; repeat lipid panel and LFTs in 8 weeks (fasting)    See urologist',
      note_type: 'Patient Instructions',
      note_status: 'Addendum'
    },
    {
      id: 2,
      person_id: 101,
      provider_id: 16,
      visit_occurrence_id: 103,
      note_date: '2025-03-15',
      note_text: 'HISTORY, ASSESSMENT, AND PLAN    **NAME** is a 63 y.o. male, known patient, here for the following issues:    Pre-DM, obesity  On max dose Zepbound  Side effects: none  Weight loss: 15 lbs  Strength training: yes  A1c is improving; will continue Zepbound, goal weight 220    Urinary urgency and frequency  **NAME** see urology    Hyperlipidemia/aortic athero  LDL 90; goal under 70; recommend increase statin to 20 mg    OSA-on cpap and following with sleep med    Left knee OA-has done a few rounds of PT; he is improving    Asthma-albuterol prn (flonase for nose); consider RSV vax      Current outpatient prescriptions:  1) Albuterol 108 (90 base) mcg/act inhaler, inhale 2 puffs every 6 hours as needed for shortness of breath.    2) Alprazolam (xanax) 0.25 mg tablet, take 1 tablet by mouth if needed (flying) for up to 1 dose. do not use concurrently with other sedating medications    3) Fluticasone 50 mcg/act nasal spray, administer 1 spray into both nostrils daily.    4) Rosuvastatin 10 mg tablet, take 1 tablet by mouth daily at bedtime.    5) Spacer/aero-holding chambers xx devi, use as directed with albuterol inhaler.    6) Zepbound 15 mg/0.5ml subcutaneous solution auto-injector (tirzepatide-weight management), inject 15 mg under the skin once a week. start after completing 4 weeks of previous dose; only increase if tolerating.          Allergy List:  1) Eggs - GI Upset, Vomiting and Wheezing  2) Doxycycline - Other reaction(s): GI intolerance  3) Vibegron - Itching  ____________________________________________________________________  Physical Examination:   BP 118/79 | Pulse 86 | Temp (Src) 97.7 °F (36.5 °C) (Temporal) | Ht 5\' 10"" (1.778 m) | Wt 234 lb 6.4 oz (106.3 kg) | SpO2 98% | BMI 33.63 kg/m2   Cor rrr no m  Lungs clear  Ext no edema  ____________________________________________________________________    DATA:    BP Readings from Last 5 Encounters:   **DATE** 11**DATE**   **DATE** 11**DATE**   **DATE** 12**DATE**    **DATE** 1**DATE**   **DATE** 1**DATE**     Wt Readings from Last 5 Encounters:   **DATE** 234 lb 6.4 oz (106.3 kg)   **DATE** 236 lb 12.8 oz (107.4 kg)   **DATE** 238 lb (108 kg)   **DATE** 238 lb (108 kg)   **DATE** 234 lb (106.1 kg)     ____________________________________________________________________    Return to the office in 12 months or sooner as needed      **NAME**, MD  **DATE**  10:20 AM',
      note_type: 'Progress Notes',
      note_status: 'Signed'
    }
  ] as Note[],

  CONDITION_OCCURRENCE: [
    {
      id: 1,
      visit_occurrence_id: 103,
      is_primary_dx: 'N',
      condition_source_value: 'Elevated hemoglobin A1c',
      condition_concept_id: 45592429,
      concept_code: 'R73.09'
    },
    {
      id: 2,
      visit_occurrence_id: 103,
      is_primary_dx: 'N',
      condition_source_value: 'Hypercholesterolemia',
      condition_concept_id: 37200312,
      concept_code: 'E78.00'
    },
    {
      id: 3,
      visit_occurrence_id: 103,
      is_primary_dx: 'N',
      condition_source_value: 'Mild intermittent asthma without complication',
      condition_concept_id: 45548116,
      concept_code: 'J45.20'
    },
    {
      id: 4,
      visit_occurrence_id: 103,
      is_primary_dx: 'N',
      condition_source_value: 'OSA (obstructive sleep apnea)',
      condition_concept_id: 45552539,
      concept_code: 'G47.33'
    },
    {
      id: 5,
      visit_occurrence_id: 103,
      is_primary_dx: 'Y',
      condition_source_value: 'Aortic atherosclerosis (CMS-HCC)',
      condition_concept_id: 35207841,
      concept_code: 'I70.0'
    }
  ] as ConditionOccurrence[],

  DRUG_EXPOSURE: [
    {
      id: 1,
      visit_occurrence_id: 103,
      drug_ordering_date: '2025-03-15T04:00:00Z',
      drug_exposure_start_datetime: '2025-03-15T04:00:00Z',
      drug_exposure_end_datetime: '2026-03-15T04:00:00Z',
      description: 'ROSUVASTATIN CALCIUM 20 MG PO TABS',
      quantity: '90 tablet'
    }
  ] as DrugExposure[],

  PROCEDURE_OCCURRENCE: [
    {
      id: 1,
      visit_occurrence_id: 103,
      procedure_ordering_date: '2025-03-15T04:00:00Z',
      name: 'Lab',
      description: 'HEPATIC FUNCTION PANEL',
      future_or_stand: 'F'
    },
    {
      id: 2,
      visit_occurrence_id: 103,
      procedure_ordering_date: '2025-03-15T04:00:00Z',
      name: 'Lab',
      description: 'LIPID SCREEN',
      future_or_stand: 'F'
    }
  ] as ProcedureOccurrence[],

  MEASUREMENT: [
    {
      id: 1,
      visit_occurrence_id: 103,
      bp_systolic: 118,
      bp_diastolic: 79,
      phys_bp: '118/79',
      weight_lb: 234.4,
      height: "5' 10\"",
      pulse: 86,
      phys_spo2: 98
    }
  ] as Measurement[],

  OBSERVATION: [
    {
      id: 1,
      visit_occurrence_id: 103,
      file_type: 'patient_view',
      file_path: '/data/clinic/103/patient_view.mp4',
      observation_date: '2025-03-15'
    },
    {
      id: 2,
      visit_occurrence_id: 103,
      file_type: 'provider_view',
      file_path: '/data/clinic/103/provider_view.mp4',
      observation_date: '2025-03-15'
    },
    {
      id: 3,
      visit_occurrence_id: 103,
      file_type: 'room_view',
      file_path: '/data/clinic/103/room_view.mp4',
      observation_date: '2025-03-15'
    },
    {
      id: 4,
      visit_occurrence_id: 103,
      file_type: 'transcript',
      file_path: '/data/clinic/103/transcript.xlsx',
      observation_date: '2025-03-15'
    }
  ] as Observation[],

  PATIENT_SURVEY: [
    {
      id: 1,
      visit_occurrence_id: 103,
      form_1_timestamp: '2025-03-15 19:00:00',
      visit_date: '2025-03-15',
      patient_overall_health: 2,
      patient_mental_emotional_health: 1,
      patient_age: 5,
      patient_education: 5,
      overall_satisfaction_scale_1: 5,
      overall_satisfaction_scale_2: 10,
      tech_experience_1: 1,
      tech_experience_2: 1,
      relationship_with_provider_1: 3,
      relationship_with_provider_2: 1,
      hawthorne_1: 1,
      hawthorne_2: 3,
      hawthorne_3: 3,
      hawthorne_4: 0,
      visit_related_1: 1,
      visit_related_2: 1,
      visit_related_3: 1,
      visit_related_4: 1,
      visit_related_5: 1,
      visit_related_6: 1,
      hawthorne_5: 3,
      open_ended_interaction: 'The collaborative approach we took to managing my weight loss',
      open_ended_change: 'I\'m more thorough physical exam',
      open_ended_experience: 'Data-driven'
    }
  ] as PatientSurvey[],

  PROVIDER_SURVEY: [
    {
      id: 1,
      visit_occurrence_id: 103,
      form_1_timestamp: '2025-03-15 19:00:00',
      visit_date: '2025-03-15',
      years_hcp_experience: 5,
      tech_experience: 1,
      communication_method___1: 1,
      communication_method___2: 0,
      communication_method___3: 0,
      communication_method___4: 0,
      communication_method___5: 0,
      communication_other: '',
      inbasket_messages: 4,
      overall_satisfaction_scale_1: 5,
      overall_satisfaction_scale_2: 10,
      patient_related_1: 1,
      patient_related_2: 1,
      patient_related_3: 1,
      visit_related_1: 1,
      visit_related_2: 1,
      visit_related_4: 1,
      hawthorne_1: 2,
      hawthorne_2: 2,
      hawthorne_3: 3,
      open_ended_1: 'no',
      open_ended_2: 'no'
    }
  ] as ProviderSurvey[],

  AUDIT_LOGS: [
    {
      id: 1,
      visit_occurrence_id: 103,
      access_time: '2025-03-14T02:13:26Z',
      user_id: 'LCRKrysbFUcKn6sQoL698B',
      workstation_id: 'gYuaVsfxmenFVm6hLNPxAP',
      access_action: 'QUERY',
      metric_id: 14200,
      metric_name: 'Printing occurred',
      metric_desc: 'E_PRINT',
      metric_type: 'E-APPLICATION EVENT',
      metric_group: 'EVENT AREA - WORKFLOW',
      event_action_type: 'EXPORT',
      event_action_subtype: ''
    },
    {
      id: 2,
      visit_occurrence_id: 103,
      access_time: '2025-03-14T02:24:58Z',
      user_id: 'LCRKrysbFUcKn6sQoL698B',
      workstation_id: 'gYuaVsfxmenFVm6hLNPxAP',
      access_action: 'QUERY',
      metric_id: 14200,
      metric_name: 'Printing occurred',
      metric_desc: 'E_PRINT',
      metric_type: 'E-APPLICATION EVENT',
      metric_group: 'EVENT AREA - WORKFLOW',
      event_action_type: 'EXPORT',
      event_action_subtype: ''
    }
  ] as AuditLogs[],

  CONCEPT: [
    {
      concept_id: 8507,
      concept_name: 'MALE',
      domain_id: 'Gender',
      vocabulary_id: 'Gender',
      concept_class_id: 'Gender',
      standard_concept: 'S',
      concept_code: 'M'
    },
    {
      concept_id: 8532,
      concept_name: 'FEMALE',
      domain_id: 'Gender',
      vocabulary_id: 'Gender',
      concept_class_id: 'Gender',
      standard_concept: 'S',
      concept_code: 'F'
    },
    {
      concept_id: 8516,
      concept_name: 'Black or African American',
      domain_id: 'Race',
      vocabulary_id: 'Race',
      concept_class_id: 'Race',
      standard_concept: 'S',
      concept_code: '3'
    },
    {
      concept_id: 8527,
      concept_name: 'White',
      domain_id: 'Race',
      vocabulary_id: 'Race',
      concept_class_id: 'Race',
      standard_concept: 'S',
      concept_code: '5'
    },
    {
      concept_id: 38003564,
      concept_name: 'Not Hispanic or Latino',
      domain_id: 'Ethnicity',
      vocabulary_id: 'Ethnicity',
      concept_class_id: 'Ethnicity',
      standard_concept: 'S',
      concept_code: 'Not Hispanic'
    },
    {
      concept_id: 45592429,
      concept_name: 'Other abnormal glucose',
      domain_id: 'Measurement',
      vocabulary_id: 'ICD10CM',
      concept_class_id: '5-char billing code',
      standard_concept: '',
      concept_code: 'R73.09'
    },
    {
      concept_id: 37200312,
      concept_name: 'Pure hypercholesterolemia, unspecified',
      domain_id: 'Condition',
      vocabulary_id: 'ICD10CM',
      concept_class_id: '5-char billing code',
      standard_concept: '',
      concept_code: 'E78.00'
    },
    {
      concept_id: 45548116,
      concept_name: 'Mild intermittent asthma, uncomplicated',
      domain_id: 'Condition',
      vocabulary_id: 'ICD10CM',
      concept_class_id: '5-char billing code',
      standard_concept: '',
      concept_code: 'J45.20'
    },
    {
      concept_id: 45552539,
      concept_name: 'Obstructive sleep apnea (adult) (pediatric)',
      domain_id: 'Condition',
      vocabulary_id: 'ICD10CM',
      concept_class_id: '5-char billing code',
      standard_concept: '',
      concept_code: 'G47.33'
    },
    {
      concept_id: 35207841,
      concept_name: 'Atherosclerosis of aorta',
      domain_id: 'Condition',
      vocabulary_id: 'ICD10CM',
      concept_class_id: '4-char billing code',
      standard_concept: '',
      concept_code: 'I70.0'
    }
  ] as Concept[]
};