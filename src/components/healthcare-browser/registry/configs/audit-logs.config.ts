import { FaHistory } from 'react-icons/fa';
import { TableConfig } from '../types';
import { AuditLogs } from '@/interfaces/observer-omop';
import { AUDIT_LOGS_LABELS } from '@/constants/column-labels.constants';

export const auditLogsConfig: TableConfig<AuditLogs> = {
  id: 'AUDIT_LOGS',
  apiKey: 'audit_logs',

  display: {
    name: 'Audit Logs',
    description: 'System access and action logs',
    icon: FaHistory,
    color: 'gray',
    category: 'admin',
    searchPlaceholder: 'Search logs...',
  },

  columns: {
    defaultVisible: [
      'id',
      'access_time',
      'user_id',
      'access_action',
      'metric_name',
      'visit_occurrence_id',
    ],
    pinnedColumns: ['id'],
    columnLabels: AUDIT_LOGS_LABELS,
  },

  pagination: {
    // Larger page size for logs (typically many rows)
    defaultPageSize: 50,
    pageSizeOptions: [20, 50, 100, 200],
  },

  sorting: {
    defaultSort: [{ column: 'access_time', direction: 'desc' }],
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
