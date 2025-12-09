import { FaBook } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Concept } from '@/interfaces/observer-omop';

export const conceptConfig: TableConfig<Concept> = {
  id: 'CONCEPT',
  apiKey: 'concepts',

  display: {
    name: 'OMOP Concepts',
    description: 'Medical terminology and concept definitions',
    icon: FaBook,
    color: 'slate',
    category: 'admin',
  },

  columns: {
    defaultVisible: [
      'concept_id',
      'concept_name',
      'domain_id',
      'vocabulary_id',
      'concept_code',
      'standard_concept',
    ],
    pinnedColumns: ['concept_id'],
  },

  pagination: {
    // Larger page size for reference data
    defaultPageSize: 50,
    pageSizeOptions: [20, 50, 100, 200],
  },

  sorting: {
    defaultSort: [{ column: 'concept_id', direction: 'asc' }],
  },

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
  },
};
