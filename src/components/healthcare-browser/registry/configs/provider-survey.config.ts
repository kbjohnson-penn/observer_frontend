import { FaClipboardCheck } from 'react-icons/fa';
import { TableConfig } from '../types';
import { ProviderSurvey } from '@/interfaces/observer-omop';
import { PROVIDER_SURVEY_LABELS } from '@/constants/column-labels.constants';

export const providerSurveyConfig: TableConfig<ProviderSurvey> = {
  id: 'PROVIDER_SURVEY',
  apiKey: 'provider_surveys',

  display: {
    name: 'Provider Surveys',
    description: 'Provider satisfaction and experience surveys',
    icon: FaClipboardCheck,
    color: 'violet',
    category: 'survey',
    searchPlaceholder: 'Search provider surveys...',
  },

  columns: {
    // Survey tables have many columns - show key ones by default
    defaultVisible: [
      'id',
      'visit_occurrence_id',
      'visit_date',
      'overall_satisfaction_scale_1',
      'overall_satisfaction_scale_2',
      'years_hcp_experience',
    ],
    pinnedColumns: ['id'],
    columnLabels: PROVIDER_SURVEY_LABELS,
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
