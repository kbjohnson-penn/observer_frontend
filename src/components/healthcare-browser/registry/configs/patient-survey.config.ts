import { FaClipboardList } from 'react-icons/fa';
import { TableConfig } from '../types';
import { PatientSurvey } from '@/interfaces/observer-omop';
import { PATIENT_SURVEY_LABELS } from '@/constants/column-labels.constants';

export const patientSurveyConfig: TableConfig<PatientSurvey> = {
  id: 'PATIENT_SURVEY',
  apiKey: 'patient_surveys',

  display: {
    name: 'Patient Surveys',
    description: 'Patient satisfaction and experience surveys',
    icon: FaClipboardList,
    color: 'indigo',
    category: 'survey',
    searchPlaceholder: 'Search patient surveys...',
  },

  columns: {
    // Survey tables have many columns - show key ones by default
    defaultVisible: [
      'id',
      'visit_occurrence_id',
      'visit_date',
      'overall_satisfaction_scale_1',
      'overall_satisfaction_scale_2',
      'patient_overall_health',
    ],
    pinnedColumns: ['id'],
    columnLabels: PATIENT_SURVEY_LABELS,
  },

  pagination: {
    // Smaller page size for surveys (many columns)
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
  },

  sorting: {
    defaultSort: [{ column: 'visit_date', direction: 'desc' }],
  },

  relationships: [
    { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' },
  ],

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
  },
};
