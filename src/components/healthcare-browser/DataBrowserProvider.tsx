'use client';

/**
 * DataBrowserProvider
 *
 * Context provider for the healthcare data browser.
 * Manages global state for all tables including:
 * - Raw API data
 * - Active table selection
 * - Per-table state (visibility, sorting, pagination, filtering)
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { OMOPTableName, SampleDataAPIResponse, OMOPTableData } from '@/interfaces/observer-omop';
import { tableRegistry, TableState, DataBrowserState, TableConfig } from './registry';
import { loadColumnPreferences, saveColumnPreferences } from '@/lib/utils/userPreferences';

// ============================================================================
// Types
// ============================================================================

type DataBrowserAction =
  | { type: 'SET_DATA'; payload: SampleDataAPIResponse }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACTIVE_TABLE'; payload: OMOPTableName }
  | { type: 'UPDATE_TABLE_STATE'; tableId: OMOPTableName; state: Partial<TableState> }
  | { type: 'SET_COLUMN_VISIBILITY'; tableId: OMOPTableName; visibility: Record<string, boolean> }
  | {
      type: 'UPDATE_SINGLE_COLUMN_VISIBILITY';
      tableId: OMOPTableName;
      columnId: string;
      visible: boolean;
    }
  | { type: 'SET_GLOBAL_FILTER'; tableId: OMOPTableName; filter: string }
  | { type: 'SET_SORTING'; tableId: OMOPTableName; sorting: TableState['sorting'] }
  | { type: 'SET_PAGINATION'; tableId: OMOPTableName; pagination: TableState['pagination'] }
  | { type: 'GO_TO_PAGE'; tableId: OMOPTableName; pageIndex: number };

interface DataBrowserContextValue {
  state: DataBrowserState;
  dispatch: React.Dispatch<DataBrowserAction>;
  // Convenience methods
  setActiveTable: (tableId: OMOPTableName) => void;
  getTableData: <TData extends OMOPTableData>(tableId: OMOPTableName) => TData[];
  getTableConfig: (tableId: OMOPTableName) => TableConfig | undefined;
  getTableState: (tableId: OMOPTableName) => TableState;
  // Column visibility
  updateColumnVisibility: (tableId: OMOPTableName, columnId: string, visible: boolean) => void;
  showAllColumns: (tableId: OMOPTableName, columns: string[]) => void;
  hideAllColumns: (tableId: OMOPTableName, columns: string[]) => void;
  // Search
  setGlobalFilter: (tableId: OMOPTableName, filter: string) => void;
  // Sorting
  setSorting: (tableId: OMOPTableName, sorting: TableState['sorting']) => void;
  // Pagination
  setPagination: (tableId: OMOPTableName, pagination: TableState['pagination']) => void;
  goToPage: (tableId: OMOPTableName, pageIndex: number) => void;
  setPageSize: (tableId: OMOPTableName, pageSize: number) => void;
}

interface DataBrowserProviderProps {
  children: React.ReactNode;
  /** Optional pre-loaded sample data */
  sampleData?: SampleDataAPIResponse | null;
}

// ============================================================================
// Context
// ============================================================================

const DataBrowserContext = createContext<DataBrowserContextValue | null>(null);

// ============================================================================
// Reducer
// ============================================================================

function reducer(state: DataBrowserState, action: DataBrowserAction): DataBrowserState {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, rawData: action.payload, isLoading: false, error: null };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_ACTIVE_TABLE':
      return { ...state, activeTable: action.payload };

    case 'UPDATE_TABLE_STATE':
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            ...action.state,
          },
        },
      };

    case 'SET_COLUMN_VISIBILITY':
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            columnVisibility: action.visibility,
          },
        },
      };

    case 'UPDATE_SINGLE_COLUMN_VISIBILITY': {
      const currentVisibility = state.tableStates[action.tableId]?.columnVisibility || {};
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            columnVisibility: {
              ...currentVisibility,
              [action.columnId]: action.visible,
            },
          },
        },
      };
    }

    case 'SET_GLOBAL_FILTER':
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            globalFilter: action.filter,
            // Reset to first page when filter changes
            pagination: {
              ...state.tableStates[action.tableId].pagination,
              pageIndex: 0,
            },
          },
        },
      };

    case 'SET_SORTING':
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            sorting: action.sorting,
          },
        },
      };

    case 'SET_PAGINATION':
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            pagination: action.pagination,
          },
        },
      };

    case 'GO_TO_PAGE': {
      const currentPagination = state.tableStates[action.tableId]?.pagination;
      if (!currentPagination) {
        return state;
      }
      return {
        ...state,
        tableStates: {
          ...state.tableStates,
          [action.tableId]: {
            ...state.tableStates[action.tableId],
            pagination: { ...currentPagination, pageIndex: action.pageIndex },
          },
        },
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Initial State
// ============================================================================

function createInitialState(sampleData?: SampleDataAPIResponse | null): DataBrowserState {
  // Create initial states for all tables from registry
  const tableStates = tableRegistry.createAllInitialTableStates();

  // Load saved column preferences from localStorage
  tableRegistry.getAllIds().forEach((tableId) => {
    const savedVisibility = loadColumnPreferences(tableId);
    if (savedVisibility) {
      tableStates[tableId].columnVisibility = savedVisibility;
    }
  });

  return {
    rawData: sampleData || null,
    isLoading: !sampleData,
    error: null,
    activeTable: 'PERSON', // Default to first table
    tableStates,
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export function DataBrowserProvider({ children, sampleData }: DataBrowserProviderProps) {
  const [state, dispatch] = useReducer(reducer, sampleData, createInitialState);

  // Update data when sampleData prop changes
  useEffect(() => {
    if (sampleData) {
      dispatch({ type: 'SET_DATA', payload: sampleData });
    }
  }, [sampleData]);

  // Track previous column visibility JSON to detect actual content changes
  const prevColumnVisibilityJsonRef = useRef<Record<OMOPTableName, string>>(
    {} as Record<OMOPTableName, string>
  );

  // Persist column visibility changes to localStorage
  useEffect(() => {
    tableRegistry.getAllIds().forEach((tableId) => {
      const currentVisibility = state.tableStates[tableId]?.columnVisibility;
      if (!currentVisibility) {
        return;
      }

      // Deep compare using JSON serialization to avoid unnecessary writes
      const currentJson = JSON.stringify(currentVisibility);
      const prevJson = prevColumnVisibilityJsonRef.current[tableId];

      if (currentJson !== prevJson) {
        saveColumnPreferences(tableId, currentVisibility);
        prevColumnVisibilityJsonRef.current[tableId] = currentJson;
      }
    });
  }, [state.tableStates]);

  // ============================================================================
  // Convenience Methods
  // ============================================================================

  const setActiveTable = useCallback((tableId: OMOPTableName) => {
    dispatch({ type: 'SET_ACTIVE_TABLE', payload: tableId });
  }, []);

  const getTableData = useCallback(
    <TData extends OMOPTableData>(tableId: OMOPTableName): TData[] => {
      if (!state.rawData) {
        return [];
      }
      return tableRegistry.getTableData<TData>(tableId, state.rawData);
    },
    [state.rawData]
  );

  const getTableConfig = useCallback((tableId: OMOPTableName) => {
    return tableRegistry.get(tableId);
  }, []);

  const getTableState = useCallback(
    (tableId: OMOPTableName): TableState => {
      return state.tableStates[tableId] || tableRegistry.createInitialTableState(tableId);
    },
    [state.tableStates]
  );

  // ============================================================================
  // Column Visibility Methods
  // ============================================================================

  const updateColumnVisibility = useCallback(
    (tableId: OMOPTableName, columnId: string, visible: boolean) => {
      dispatch({
        type: 'UPDATE_SINGLE_COLUMN_VISIBILITY',
        tableId,
        columnId,
        visible,
      });
    },
    []
  );

  const showAllColumns = useCallback((tableId: OMOPTableName, columns: string[]) => {
    const newVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      newVisibility[col] = true;
    });

    dispatch({
      type: 'SET_COLUMN_VISIBILITY',
      tableId,
      visibility: newVisibility,
    });
    // Persistence handled by useEffect
  }, []);

  const hideAllColumns = useCallback((tableId: OMOPTableName, columns: string[]) => {
    const config = tableRegistry.get(tableId);
    const pinnedColumns = config?.columns.pinnedColumns || [];

    const newVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      // Keep pinned columns visible
      newVisibility[col] = pinnedColumns.includes(col);
    });

    dispatch({
      type: 'SET_COLUMN_VISIBILITY',
      tableId,
      visibility: newVisibility,
    });
    // Persistence handled by useEffect
  }, []);

  // ============================================================================
  // Filter Methods
  // ============================================================================

  const setGlobalFilter = useCallback((tableId: OMOPTableName, filter: string) => {
    dispatch({ type: 'SET_GLOBAL_FILTER', tableId, filter });
  }, []);

  // ============================================================================
  // Sorting Methods
  // ============================================================================

  const setSorting = useCallback((tableId: OMOPTableName, sorting: TableState['sorting']) => {
    dispatch({ type: 'SET_SORTING', tableId, sorting });
  }, []);

  // ============================================================================
  // Pagination Methods
  // ============================================================================

  const setPagination = useCallback(
    (tableId: OMOPTableName, pagination: TableState['pagination']) => {
      dispatch({ type: 'SET_PAGINATION', tableId, pagination });
    },
    []
  );

  const goToPage = useCallback((tableId: OMOPTableName, pageIndex: number) => {
    dispatch({
      type: 'GO_TO_PAGE',
      tableId,
      pageIndex,
    });
  }, []);

  const setPageSize = useCallback((tableId: OMOPTableName, pageSize: number) => {
    dispatch({
      type: 'SET_PAGINATION',
      tableId,
      pagination: { pageIndex: 0, pageSize }, // Reset to first page when size changes
    });
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo<DataBrowserContextValue>(
    () => ({
      state,
      dispatch,
      setActiveTable,
      getTableData,
      getTableConfig,
      getTableState,
      updateColumnVisibility,
      showAllColumns,
      hideAllColumns,
      setGlobalFilter,
      setSorting,
      setPagination,
      goToPage,
      setPageSize,
    }),
    [
      state,
      setActiveTable,
      getTableData,
      getTableConfig,
      getTableState,
      updateColumnVisibility,
      showAllColumns,
      hideAllColumns,
      setGlobalFilter,
      setSorting,
      setPagination,
      goToPage,
      setPageSize,
    ]
  );

  return <DataBrowserContext.Provider value={value}>{children}</DataBrowserContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useDataBrowser(): DataBrowserContextValue {
  const context = useContext(DataBrowserContext);
  if (!context) {
    throw new Error('useDataBrowser must be used within a DataBrowserProvider');
  }
  return context;
}

export default DataBrowserProvider;
