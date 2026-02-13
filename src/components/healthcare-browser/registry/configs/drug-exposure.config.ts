import { FaPills } from 'react-icons/fa';
import { TableConfig } from '../types';
import { DrugExposure } from '@/interfaces/observer-omop';
import { DRUG_EXPOSURE_LABELS } from '@/constants/column-labels.constants';

export const drugExposureConfig: TableConfig<DrugExposure> = {
  id: 'DRUG_EXPOSURE',
  apiKey: 'drugs',

  display: {
    name: 'Medications',
    description: 'Drug prescriptions and medication records',
    icon: FaPills,
    color: 'purple',
    category: 'clinical',
    searchPlaceholder: 'Search medications...',
  },

  columns: {
    defaultVisible: ['id', 'visit_occurrence_id', 'description', 'drug_ordering_date', 'quantity'],
    pinnedColumns: ['id'],
    columnLabels: DRUG_EXPOSURE_LABELS,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'drug_ordering_date', direction: 'desc' }],
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
