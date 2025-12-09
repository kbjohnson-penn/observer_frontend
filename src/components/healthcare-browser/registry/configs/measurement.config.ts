import { FaHeartbeat } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Measurement } from '@/interfaces/observer-omop';

export const measurementConfig: TableConfig<Measurement> = {
  id: 'MEASUREMENT',
  apiKey: 'measurements',

  display: {
    name: 'Vital Signs & Labs',
    description: 'Vital signs and laboratory measurements',
    icon: FaHeartbeat,
    color: 'orange',
    category: 'clinical',
  },

  columns: {
    defaultVisible: [
      'id',
      'visit_occurrence_id',
      'bp_systolic',
      'bp_diastolic',
      'pulse',
      'weight_lb',
      'phys_spo2',
    ],
    pinnedColumns: ['id'],
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
