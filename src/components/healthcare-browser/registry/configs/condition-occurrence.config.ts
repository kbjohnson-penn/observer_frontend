import { FaDiagnoses } from 'react-icons/fa';
import { TableConfig } from '../types';
import { ConditionOccurrence } from '@/interfaces/observer-omop';
import { CONDITION_OCCURRENCE_LABELS } from '@/constants/column-labels.constants';

export const conditionOccurrenceConfig: TableConfig<ConditionOccurrence> = {
  id: 'CONDITION_OCCURRENCE',
  apiKey: 'conditions',

  display: {
    name: 'Conditions & Diagnoses',
    description: 'Medical conditions and diagnoses recorded during visits',
    icon: FaDiagnoses,
    color: 'red',
    category: 'clinical',
    searchPlaceholder: 'Search conditions...',
  },

  columns: {
    defaultVisible: [
      'id',
      'visit_occurrence_id',
      'condition_source_value',
      'is_primary_dx',
      'concept_code',
    ],
    pinnedColumns: ['id'],
    columnLabels: CONDITION_OCCURRENCE_LABELS,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'id', direction: 'asc' }],
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
