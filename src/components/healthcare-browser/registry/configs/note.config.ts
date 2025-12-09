import { FaStickyNote } from 'react-icons/fa';
import { TableConfig } from '../types';
import { Note } from '@/interfaces/observer-omop';

export const noteConfig: TableConfig<Note> = {
  id: 'NOTE',
  apiKey: 'notes',

  display: {
    name: 'Clinical Notes',
    description: 'Clinical notes and documentation',
    icon: FaStickyNote,
    color: 'yellow',
    category: 'clinical',
  },

  columns: {
    defaultVisible: ['id', 'note_date', 'note_type', 'note_status', 'visit_occurrence_id'],
    pinnedColumns: ['id'],
  },

  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  sorting: {
    defaultSort: [{ column: 'note_date', direction: 'desc' }],
  },

  relationships: [
    { field: 'person_id', referencesTable: 'PERSON', referencesField: 'id' },
    { field: 'provider_id', referencesTable: 'PROVIDER', referencesField: 'id' },
    { field: 'visit_occurrence_id', referencesTable: 'VISIT_OCCURRENCE', referencesField: 'id' },
  ],

  features: {
    enableSearch: true,
    enableExport: true,
    enableColumnToggle: true,
  },
};
