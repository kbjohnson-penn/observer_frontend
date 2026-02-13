import { FaVideo } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Observation } from '@/interfaces/observer-omop';
import { OBSERVATION_LABELS } from '@/constants/column-labels.constants';

export const observationConfig: TableConfig<Observation> = {
  id: 'OBSERVATION',
  apiKey: 'observations',

  display: {
    name: 'Multimodal Data Files',
    description: 'Video, audio, and transcript file paths',
    icon: FaVideo,
    color: 'cyan',
    category: 'multimodal',
    searchPlaceholder: 'Search files...',
  },

  columns: {
    defaultVisible: ['id', 'visit_occurrence_id', 'file_type', 'file_path', 'observation_date'],
    pinnedColumns: ['id'],
    columnLabels: OBSERVATION_LABELS,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'observation_date', direction: 'desc' }],
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
