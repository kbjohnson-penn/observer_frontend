import { FaUserMd } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Provider } from '@/interfaces/observer-omop';
import { PROVIDER_LABELS } from '@/constants/column-labels.constants';

export const providerConfig: TableConfig<Provider> = {
  id: 'PROVIDER',
  apiKey: 'providers',

  display: {
    name: 'Providers',
    description: 'Provider demographic information',
    icon: FaUserMd,
    color: 'blue',
    category: 'person',
    searchPlaceholder: 'Search providers...',
  },

  columns: {
    defaultVisible: [
      'id',
      'provider_display_id',
      'year_of_birth',
      'gender_source_value',
      'race_source_value',
      'ethnicity_source_value',
    ],
    pinnedColumns: ['id'],
    columnLabels: PROVIDER_LABELS,
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'id', direction: 'asc' }],
  },

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
  },
};
