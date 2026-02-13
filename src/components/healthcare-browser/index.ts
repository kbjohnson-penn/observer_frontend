/**
 * Healthcare Browser Component
 *
 * Central export point for the healthcare data browser.
 */

// Main Component
export { default as HealthcareDataBrowser } from './HealthcareDataBrowser';

// Provider
export { DataBrowserProvider, useDataBrowser } from './DataBrowserProvider';

// Sub-components
export { default as DataTable } from './DataTable';
export { default as TableTabs } from './TableTabs';

// Registry
export {
  tableRegistry,
  type TableConfig,
  type TableCategory,
  type ColumnConfig,
  type TableState,
  type DataBrowserState,
} from './registry';

// Hooks
export { useTableInstance } from '@/hooks/useTableInstance';
