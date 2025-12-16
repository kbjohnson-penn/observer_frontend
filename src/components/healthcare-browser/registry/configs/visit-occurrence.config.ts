import { FaCalendarAlt } from 'react-icons/fa';
import { TableConfig } from '../types';
import { VisitOccurrence } from '@/interfaces/observer-omop';
import { VISIT_OCCURRENCE_LABELS } from '@/constants/column-labels.constants';

export const visitOccurrenceConfig: TableConfig<VisitOccurrence> = {
  id: 'VISIT_OCCURRENCE',
  apiKey: 'visits',

  display: {
    name: 'Clinical Visits',
    description: 'Clinical encounters and visits',
    icon: FaCalendarAlt,
    color: 'green',
    category: 'clinical',
    searchPlaceholder: 'Search visits...',
  },

  columns: {
    defaultVisible: [
      'id',
      'person_id',
      'provider_id',
      'visit_start_date',
      'visit_start_time',
      'visit_source_value',
    ],
    pinnedColumns: ['id'],
    columnLabels: VISIT_OCCURRENCE_LABELS,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'visit_start_date', direction: 'desc' }],
  },

  relationships: [
    { field: 'person_id', referencesTable: 'PERSON', referencesField: 'id' },
    { field: 'provider_id', referencesTable: 'PROVIDER', referencesField: 'id' },
  ],

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
    enableDrillDown: true,
  },
};
