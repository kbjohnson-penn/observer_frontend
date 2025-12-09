import { FaUsers } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Person } from '@/interfaces/observer-omop';

export const personConfig: TableConfig<Person> = {
  id: 'PERSON',
  apiKey: 'persons',

  display: {
    name: 'Patients',
    description: 'Patient demographic information',
    icon: FaUsers,
    color: 'teal',
    category: 'person',
  },

  columns: {
    defaultVisible: [
      'id',
      'person_display_id',
      'year_of_birth',
      'gender_source_value',
      'race_source_value',
      'ethnicity_source_value',
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

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
  },
};
