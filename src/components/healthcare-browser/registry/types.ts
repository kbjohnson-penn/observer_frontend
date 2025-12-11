/**
 * Table Registry Types
 *
 * Defines the configuration interface for OMOP tables in the healthcare browser.
 * Each table has its own config file that implements TableConfig.
 */

import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { OMOPTableName, CohortDataAPIResponse, OMOPTableData } from '@/interfaces/observer-omop';
import { ColumnLabelDefinition } from '@/constants/column-labels.constants';

/**
 * Table category for grouping in UI
 */
export type TableCategory = 'person' | 'clinical' | 'survey' | 'admin' | 'multimodal';

/**
 * Foreign key relationship definition
 */
export interface ForeignKeyConfig {
  /** The field name in this table */
  field: string;
  /** The table this field references */
  referencesTable: OMOPTableName;
  /** The field in the referenced table */
  referencesField: string;
}

/**
 * Column-specific formatter function
 */
export type ColumnFormatter = (value: unknown, row?: Record<string, unknown>) => ReactNode;

/**
 * Column configuration for a table
 */
export interface ColumnConfig {
  /** Columns visible by default (others hidden but can be shown) */
  defaultVisible: string[];
  /** Columns that cannot be hidden (always visible) */
  pinnedColumns?: string[];
  /** Custom formatters for specific columns */
  formatters?: Record<string, ColumnFormatter>;
  /** Custom tooltips for columns (deprecated - use columnLabels instead) */
  tooltips?: Record<string, string>;
  /** Column order (if different from data order) */
  order?: string[];
  /** Custom labels and descriptions for columns */
  columnLabels?: Record<string, ColumnLabelDefinition>;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Default page size */
  defaultPageSize: number;
  /** Available page size options */
  pageSizeOptions: number[];
}

/**
 * Sorting configuration
 */
export interface SortingConfig {
  /** Default sort when table loads */
  defaultSort?: { column: string; direction: 'asc' | 'desc' }[];
  /** Columns that can be sorted (all if not specified) */
  sortableColumns?: string[];
}

/**
 * Display configuration for table
 */
export interface DisplayConfig {
  /** Human-readable table name */
  name: string;
  /** Description shown in table header */
  description: string;
  /** Icon component for the table */
  icon: IconType;
  /** Chakra UI color scheme */
  color: string;
  /** Table category for grouping */
  category: TableCategory;
  /** Context-specific search placeholder hint (optional) */
  searchPlaceholder?: string;
}

/**
 * Feature flags for table functionality
 */
export interface FeatureConfig {
  /** Enable global search */
  enableSearch?: boolean;
  /** Enable CSV/ZIP export */
  enableExport?: boolean;
  /** Enable column visibility toggle */
  enableColumnToggle?: boolean;
  /** Enable row selection (for future bulk operations) */
  enableRowSelection?: boolean;
  /** Enable drill-down to related tables */
  enableDrillDown?: boolean;
}

/**
 * Main table configuration interface
 *
 * Each OMOP table should have a config implementing this interface.
 *
 * @template TData - The TypeScript interface for this table's data
 */
export interface TableConfig<TData extends OMOPTableData = OMOPTableData> {
  /** Unique table identifier (matches OMOPTableName) */
  id: OMOPTableName;

  /** Key in CohortDataAPIResponse that contains this table's data */
  apiKey: keyof Omit<CohortDataAPIResponse, '_metadata'>;

  /** Display configuration */
  display: DisplayConfig;

  /** Column configuration */
  columns: ColumnConfig;

  /** Pagination settings */
  pagination: PaginationConfig;

  /** Sorting configuration */
  sorting: SortingConfig;

  /** Foreign key relationships (optional) */
  relationships?: ForeignKeyConfig[];

  /** Feature flags (optional, defaults applied) */
  features?: FeatureConfig;
}

/**
 * Default feature configuration
 */
export const DEFAULT_FEATURES: Required<FeatureConfig> = {
  enableSearch: true,
  enableExport: true,
  enableColumnToggle: true,
  enableRowSelection: false,
  enableDrillDown: false,
};

/**
 * Default pagination configuration
 */
export const DEFAULT_PAGINATION: PaginationConfig = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};

/**
 * Type for the API key to table name mapping
 */
export type ApiKeyMapping = Record<OMOPTableName, keyof Omit<CohortDataAPIResponse, '_metadata'>>;

/**
 * Table state managed per table
 */
export interface TableState {
  /** Column visibility state */
  columnVisibility: Record<string, boolean>;
  /** Current global filter/search term */
  globalFilter: string;
  /** Current sorting state */
  sorting: { id: string; desc: boolean }[];
  /** Current pagination state */
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
}

/**
 * Data browser state
 */
export interface DataBrowserState {
  /** Raw API response data */
  rawData: CohortDataAPIResponse | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Currently active table */
  activeTable: OMOPTableName;
  /** Per-table state */
  tableStates: Record<OMOPTableName, TableState>;
}
