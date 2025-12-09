import { FaProcedures } from 'react-icons/fa';
import { TableConfig } from '../types';
import { ProcedureOccurrence } from '@/interfaces/observer-omop';

export const procedureOccurrenceConfig: TableConfig<ProcedureOccurrence> = {
  id: 'PROCEDURE_OCCURRENCE',
  apiKey: 'procedures',

  display: {
    name: 'Procedures',
    description: 'Medical procedures performed',
    icon: FaProcedures,
    color: 'pink',
    category: 'clinical',
  },

  columns: {
    defaultVisible: [
      'id',
      'visit_occurrence_id',
      'name',
      'procedure_ordering_date',
      'future_or_stand',
    ],
    pinnedColumns: ['id'],
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'procedure_ordering_date', direction: 'desc' }],
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
