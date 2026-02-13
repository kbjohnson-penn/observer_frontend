'use client';

/**
 * useTableInstance Hook
 *
 * Central hook for creating TanStack Table instances with full pagination support.
 * Uses getPaginationRowModel() so pagination is handled entirely by TanStack.
 */

import { useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  VisibilityState,
  PaginationState,
  Table,
  FilterFn,
  Row,
} from '@tanstack/react-table';
import { OMOPTableName, OMOPTableData } from '@/interfaces/observer-omop';
import { TableConfig, TableState } from '@/components/healthcare-browser/registry';
import { useDataBrowser } from '@/components/healthcare-browser/DataBrowserProvider';
import { expandDemographic } from '@/lib/utils/utils';

// ============================================================================
// Types
// ============================================================================

interface UseTableInstanceOptions {
  tableId: OMOPTableName;
}

interface UseTableInstanceReturn<TData extends OMOPTableData> {
  /** The TanStack Table instance */
  table: Table<TData>;
  /** The table configuration from registry */
  config: TableConfig<TData> | undefined;
  /** Current table state (visibility, sorting, pagination, filter) */
  tableState: TableState;
  /** Paginated rows (already sliced by TanStack) */
  paginatedRows: Row<TData>[];
  /** Total row count after filtering */
  filteredRowCount: number;
  /** Total page count */
  pageCount: number;
  /** Current page index (0-based) */
  pageIndex: number;
  /** Current page size */
  pageSize: number;
  /** Whether there's a next page */
  canNextPage: boolean;
  /** Whether there's a previous page */
  canPreviousPage: boolean;
  /** Go to a specific page (0-based index) */
  goToPage: (pageIndex: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Current global filter value */
  globalFilter: string;
  /** Set global filter */
  setGlobalFilter: (filter: string) => void;
  /** Current sorting state */
  sorting: SortingState;
  /** Set sorting state */
  setSorting: (sorting: SortingState) => void;
  /** Column visibility state */
  columnVisibility: VisibilityState;
  /** Toggle a single column's visibility */
  toggleColumnVisibility: (columnId: string, visible: boolean) => void;
  /** Show all columns */
  showAllColumns: () => void;
  /** Hide all columns (except pinned) */
  hideAllColumns: () => void;
  /** All column IDs */
  allColumnIds: string[];
}

// ============================================================================
// Demographic Column Mapping
// ============================================================================

const DEMOGRAPHIC_COLUMNS: Record<string, 'gender' | 'race' | 'ethnicity'> = {
  gender_source_value: 'gender',
  race_source_value: 'race',
  ethnicity_source_value: 'ethnicity',
};

// ============================================================================
// Global Filter Function
// ============================================================================

/**
 * Custom global filter that searches across all visible columns.
 * Works with any data type that extends OMOPTableData.
 * Searches both raw values AND formatted/expanded values (e.g., demographic codes).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalFilterFn: FilterFn<any> = (row, _columnId: string, filterValue: string): boolean => {
  if (!filterValue) {
    return true;
  }

  const searchLower = filterValue.toLowerCase();
  const visibleCells = row.getVisibleCells();

  return visibleCells.some((cell) => {
    const value = cell.getValue();
    if (value === null || value === undefined) {
      return false;
    }

    const rawValue = String(value).toLowerCase();
    const columnId = cell.column.id;

    // Also search the formatted/expanded value for demographic columns
    const formattedValue = formatCellValue(value, columnId).toLowerCase();

    return rawValue.includes(searchLower) || formattedValue.includes(searchLower);
  });
};

// ============================================================================
// Column Generation
// ============================================================================

/**
 * Formats a cell value, expanding demographic codes
 */
function formatCellValue(value: unknown, columnName: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  const demographicType = DEMOGRAPHIC_COLUMNS[columnName];
  if (demographicType) {
    return expandDemographic(String(value), demographicType);
  }

  return String(value);
}

/**
 * Column meta type for medical term tooltips
 */
interface ColumnMeta {
  tooltip?: string;
}

/**
 * Generate column definitions from data
 */
function generateColumns<TData extends OMOPTableData>(
  data: TData[],
  config?: TableConfig<TData>
): ColumnDef<TData, unknown>[] {
  if (!data.length) {
    return [];
  }

  const sampleRow = data[0];
  const keys = Object.keys(sampleRow) as (keyof TData)[];
  const columnLabels = config?.columns?.columnLabels || {};

  return keys.map((key) => {
    const keyString = String(key);

    // Get custom label from table config, fallback to auto-generated Title Case
    const customLabel = columnLabels[keyString];
    const header =
      customLabel?.label || keyString.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const description = customLabel?.description;

    return {
      id: keyString,
      accessorKey: key,
      header,
      cell: ({ getValue }) => {
        const value = getValue();
        return formatCellValue(value, keyString);
      },
      meta: {
        tooltip: description,
      } as ColumnMeta,
      enableSorting: true,
      enableGlobalFilter: true,
    };
  });
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTableInstance<TData extends OMOPTableData = OMOPTableData>({
  tableId,
}: UseTableInstanceOptions): UseTableInstanceReturn<TData> {
  // Get context and config
  const {
    dispatch,
    getTableData,
    getTableConfig,
    getTableState,
    updateColumnVisibility,
    showAllColumns: contextShowAll,
    hideAllColumns: contextHideAll,
    setGlobalFilter: contextSetFilter,
    setSorting: contextSetSorting,
    setPagination: contextSetPagination,
  } = useDataBrowser();

  const config = getTableConfig(tableId) as TableConfig<TData> | undefined;
  const tableState = getTableState(tableId);
  const data = getTableData<TData>(tableId);

  // Generate columns from data
  const columns = useMemo(() => generateColumns<TData>(data, config), [data, config]);

  // Get all column IDs
  const allColumnIds = useMemo(() => columns.map((col) => col.id as string), [columns]);

  // TableState.sorting is already in TanStack format: { id: string; desc: boolean }[]
  const sorting: SortingState = tableState.sorting;

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: tableState.pagination.pageIndex,
      pageSize: tableState.pagination.pageSize,
    }),
    [tableState.pagination]
  );

  const columnVisibility: VisibilityState = tableState.columnVisibility;
  const globalFilter = tableState.globalFilter;

  // Handlers that sync to context
  const handleSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      // TableState.sorting uses same format as TanStack: { id: string; desc: boolean }[]
      contextSetSorting(tableId, newSorting);
    },
    [tableId, sorting, contextSetSorting]
  );

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      contextSetPagination(tableId, newPagination);
    },
    [tableId, pagination, contextSetPagination]
  );

  const handleColumnVisibilityChange = useCallback(
    (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      // Dispatch a single action with the complete new visibility state
      dispatch({
        type: 'SET_COLUMN_VISIBILITY',
        tableId,
        visibility: newVisibility,
      });
    },
    [tableId, columnVisibility, dispatch]
  );

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      contextSetFilter(tableId, value);
    },
    [tableId, contextSetFilter]
  );

  // Create TanStack Table instance with FULL pagination support
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      pagination,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onPaginationChange: handlePaginationChange,
    // Core row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // NEW: TanStack handles pagination!
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    // Enable features
    enableMultiSort: true,
    autoResetAll: false,
    // Manual pagination is OFF - TanStack manages it
    manualPagination: false,
  });

  // ============================================================================
  // Derived State & Actions
  // ============================================================================

  // Paginated rows - already sliced by TanStack!
  const paginatedRows = table.getRowModel().rows;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const canNextPage = table.getCanNextPage();
  const canPreviousPage = table.getCanPreviousPage();

  // Navigation actions
  const goToPage = useCallback(
    (pageIndex: number) => {
      table.setPageIndex(pageIndex);
    },
    [table]
  );

  const nextPage = useCallback(() => {
    table.nextPage();
  }, [table]);

  const previousPage = useCallback(() => {
    table.previousPage();
  }, [table]);

  const setPageSize = useCallback(
    (size: number) => {
      table.setPageSize(size);
    },
    [table]
  );

  // Column visibility actions
  const toggleColumnVisibility = useCallback(
    (columnId: string, visible: boolean) => {
      updateColumnVisibility(tableId, columnId, visible);
    },
    [tableId, updateColumnVisibility]
  );

  const showAllColumns = useCallback(() => {
    contextShowAll(tableId, allColumnIds);
  }, [tableId, allColumnIds, contextShowAll]);

  const hideAllColumns = useCallback(() => {
    contextHideAll(tableId, allColumnIds);
  }, [tableId, allColumnIds, contextHideAll]);

  // Sorting & filter setters
  const setSorting = useCallback(
    (newSorting: SortingState) => {
      handleSortingChange(newSorting);
    },
    [handleSortingChange]
  );

  const setGlobalFilter = useCallback(
    (filter: string) => {
      handleGlobalFilterChange(filter);
    },
    [handleGlobalFilterChange]
  );

  return {
    table,
    config,
    tableState,
    paginatedRows,
    filteredRowCount,
    pageCount,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    canNextPage,
    canPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
    columnVisibility,
    toggleColumnVisibility,
    showAllColumns,
    hideAllColumns,
    allColumnIds,
  };
}

export default useTableInstance;
