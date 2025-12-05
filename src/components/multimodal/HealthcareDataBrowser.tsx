'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Text, Flex, Tabs, IconButton, Skeleton, Stack, HStack } from '@chakra-ui/react';
import {
  FaUsers,
  FaStethoscope,
  FaChartBar,
  FaCog,
  FaPlay,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { OMOPTableName, SampleDataAPIResponse, OMOPTableData } from '@/interfaces/observer-omop';
import { TABLE_INFO } from '@/constants/table-info.constants';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';
import TableHeader from './TableHeader';
import DataTable from './DataTable';
import COLORS, { SCROLLBAR_COLORS } from '@/constants/colors';
import JSZip from 'jszip';
import {
  ColumnVisibility,
  loadColumnPreferences,
  saveColumnPreferences,
  getDefaultColumnVisibility,
} from '@/lib/utils/userPreferences';

/**
 * Props for the HealthcareDataBrowser component
 */
interface HealthcareDataBrowserProps {
  /** Optional CSS class name for styling */
  className?: string;
  /** Pre-loaded sample data from OMOP CDM tables. If not provided, data will be fetched from API */
  sampleData?: SampleDataAPIResponse | null;
}

/**
 * Internal interface representing a data table with its metadata and data
 */
interface DataTable {
  /** OMOP CDM table name (e.g., 'PERSON', 'VISIT_OCCURRENCE') */
  name: OMOPTableName;
  /** Human-readable display name for the table */
  displayName: string;
  /** Description of what data the table contains */
  description: string;
  /** Array of rows from the table */
  data: OMOPTableData[];
  /** Filtered subset of data based on search term */
  filteredData?: OMOPTableData[];
}

/**
 * HealthcareDataBrowser Component
 *
 * A comprehensive data browser for exploring OMOP Common Data Model (CDM) tables.
 * Supports table switching, search/filter, pagination, sorting, column management,
 * and CSV export capabilities.
 *
 * Features:
 * - Tab-based navigation between OMOP tables
 * - Global search across all columns
 * - Pagination with configurable page size
 * - Column sorting (ascending/descending)
 * - Column visibility toggle
 * - CSV export (single table or all tables as ZIP)
 * - Persistent user preferences for column visibility
 *
 * @component
 * @example
 * // With pre-loaded data
 * <HealthcareDataBrowser sampleData={omopData} />
 *
 * @example
 * // Fetch data from API
 * <HealthcareDataBrowser />
 */
const HealthcareDataBrowser: React.FC<HealthcareDataBrowserProps> = ({ className, sampleData }) => {
  const [tables, setTables] = useState<DataTable[]>([]);
  const [activeTable, setActiveTable] = useState<OMOPTableName>('PERSON');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});
  const [pageSize] = useState(20);
  const [sortConfigs, setSortConfigs] = useState<
    Record<string, { field: string; direction: 'asc' | 'desc' }>
  >({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, ColumnVisibility>>({});
  const urlsToCleanup = useRef<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load all OMOP tables with sample data from props
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use sampleData from props if available, otherwise fetch it
      let apiData = sampleData;

      if (!apiData) {
        // Only fetch if no sampleData prop provided (for backward compatibility)
        const response = await apiClient.get<SampleDataAPIResponse>('/public/sample-data/', {
          timeout: 10000,
        });
        apiData = response.data;
      }

      // Map API response to OMOP table structure
      const loadedSampleData: Record<OMOPTableName, OMOPTableData[]> = {
        PERSON: apiData.persons || [],
        PROVIDER: apiData.providers || [],
        VISIT_OCCURRENCE: apiData.visits || [],
        NOTE: apiData.notes || [],
        CONDITION_OCCURRENCE: apiData.conditions || [],
        DRUG_EXPOSURE: apiData.drugs || [],
        PROCEDURE_OCCURRENCE: apiData.procedures || [],
        MEASUREMENT: apiData.measurements || [],
        OBSERVATION: apiData.observations || [],
        PATIENT_SURVEY: apiData.patient_surveys || [],
        PROVIDER_SURVEY: apiData.provider_surveys || [],
        AUDIT_LOGS: apiData.audit_logs || [],
        CONCEPT: apiData.concepts || [],
      };

      const allTables: DataTable[] = Object.keys(TABLE_INFO).map((tableName) => {
        const info = TABLE_INFO[tableName as OMOPTableName];
        return {
          name: tableName as OMOPTableName,
          displayName: info.displayName,
          description: info.description,
          data: loadedSampleData[tableName as OMOPTableName] || [],
        };
      });

      setTables(allTables);
    } catch (err: any) {
      // Handle API errors with user-friendly messages
      let errorMessage = 'Failed to load data from API';

      // Check for specific error types
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          errorMessage =
            'Sample data is currently unavailable. Please check back later or contact support.';
        } else if (status === 401 || status === 403) {
          errorMessage = 'Authentication required to view this content. Please log in to continue.';
        } else if (status >= 500) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else {
          errorMessage = err.response?.data?.error || err.message || errorMessage;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      setTables([]); // Clear tables on error
      logger.error('HealthcareDataBrowser: Failed to load data', {
        error: err,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [sampleData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup URLs on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach((url) => {
        try {
          window.URL.revokeObjectURL(url);
        } catch {
          // Failed to revoke URL - continue cleanup
        }
      });
      urlsToCleanup.current = [];
    };
  }, []);

  // Helper function to clean up blob URLs immediately
  const cleanupUrl = useCallback((url: string) => {
    try {
      window.URL.revokeObjectURL(url);
      urlsToCleanup.current = urlsToCleanup.current.filter((u) => u !== url);
    } catch (error) {
      logger.error('Failed to revoke URL:', error);
    }
  }, []);

  const currentTable = tables.find((table) => table.name === activeTable);
  const selectedTableInfo = TABLE_INFO[activeTable];

  // Helper to get current page for a table (default to 1)
  const getCurrentPage = (tableName: string) => currentPages[tableName] || 1;

  // Helper to handle page changes
  const handlePageChange = useCallback((tableName: string, page: number) => {
    setCurrentPages((prev) => ({
      ...prev,
      [tableName]: page,
    }));
  }, []);

  // Helper to get sort config for a table
  const getSortConfig = (tableName: string) => sortConfigs[tableName] || null;

  // Helper to handle sort changes
  const handleSortChange = useCallback((tableName: string, field: string) => {
    setSortConfigs((prev) => {
      const currentConfig = prev[tableName];
      const newDirection =
        currentConfig?.field === field && currentConfig.direction === 'asc' ? 'desc' : 'asc';

      return {
        ...prev,
        [tableName]: { field, direction: newDirection },
      };
    });

    // Reset to page 1 when sort changes
    setCurrentPages((prev) => ({
      ...prev,
      [tableName]: 1,
    }));
  }, []);

  // Sort function that handles different data types
  const sortData = useCallback(
    (data: OMOPTableData[], sortConfig: { field: string; direction: 'asc' | 'desc' } | null) => {
      if (!sortConfig) {
        return data;
      }

      return [...data].sort((a, b) => {
        const aVal = (a as Record<string, any>)[sortConfig.field];
        const bVal = (b as Record<string, any>)[sortConfig.field];

        // Handle null/undefined
        if (aVal === null || aVal === undefined) {
          if (bVal === null || bVal === undefined) {
            return 0;
          }
          return 1;
        }
        if (bVal === null || bVal === undefined) {
          return -1;
        }

        // Try date parsing first
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortConfig.direction === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        // Handle numbers
        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Default to string comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    },
    []
  );

  // Get column visibility for a table
  const getColumnVisibility = useCallback(
    (tableName: string, columns: string[]): ColumnVisibility => {
      if (!columnVisibility[tableName]) {
        // Try to load from localStorage
        const saved = loadColumnPreferences(tableName);
        if (saved) {
          return saved;
        }
        // Return default (all visible)
        return getDefaultColumnVisibility(columns);
      }
      return columnVisibility[tableName];
    },
    [columnVisibility]
  );

  // Handle column visibility change
  const handleColumnVisibilityChange = useCallback(
    (tableName: string, columnId: string, visible: boolean) => {
      setColumnVisibility((prev) => {
        const tableVisibility = prev[tableName] || {};
        const newVisibility = {
          ...tableVisibility,
          [columnId]: visible,
        };

        // Save to localStorage
        saveColumnPreferences(tableName, newVisibility);

        return {
          ...prev,
          [tableName]: newVisibility,
        };
      });
    },
    []
  );

  // Show all columns for a table
  const handleShowAllColumns = useCallback((tableName: string, columns: string[]) => {
    const allVisible = getDefaultColumnVisibility(columns);
    setColumnVisibility((prev) => ({
      ...prev,
      [tableName]: allVisible,
    }));
    saveColumnPreferences(tableName, allVisible);
  }, []);

  // Hide all columns for a table
  const handleHideAllColumns = useCallback((tableName: string, columns: string[]) => {
    const allHidden = columns.reduce((acc, col) => {
      acc[col] = false;
      return acc;
    }, {} as ColumnVisibility);
    setColumnVisibility((prev) => ({
      ...prev,
      [tableName]: allHidden,
    }));
    saveColumnPreferences(tableName, allHidden);
  }, []);

  // Memoize filtered data to prevent expensive recalculations on every render
  const filteredTables = useMemo(() => {
    if (!searchTerm) {
      return tables;
    }

    return tables.map((table) => ({
      ...table,
      filteredData: table.data.filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    }));
  }, [tables, searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPages({});
    }
  }, [searchTerm]);

  // Helper functions (memoized for performance)
  const getTableIcon = useCallback((tableName: OMOPTableName) => {
    switch (tableName) {
      case 'PERSON':
      case 'PROVIDER':
        return <FaUsers />;
      case 'VISIT_OCCURRENCE':
      case 'CONDITION_OCCURRENCE':
      case 'DRUG_EXPOSURE':
      case 'PROCEDURE_OCCURRENCE':
      case 'MEASUREMENT':
      case 'NOTE':
        return <FaStethoscope />;
      case 'OBSERVATION':
        return <FaPlay />;
      case 'PATIENT_SURVEY':
      case 'PROVIDER_SURVEY':
        return <FaChartBar />;
      case 'AUDIT_LOGS':
      case 'CONCEPT':
        return <FaCog />;
      default:
        return null;
    }
  }, []);

  const sanitizeCSVValue = (value: any): string => {
    const str = String(value || '').trim();

    // Comprehensive list of dangerous characters for CSV formula injection
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n', '|', '%'];
    const firstChar = str.charAt(0);

    // Check if first character is dangerous
    if (dangerousChars.includes(firstChar)) {
      // Prefix with single quote AND wrap in quotes to prevent formula execution
      return `"'${str.replace(/"/g, '""')}"`;
    }

    // Check for leading whitespace before dangerous character
    const trimmedStr = str.trim();
    if (trimmedStr !== str && dangerousChars.includes(trimmedStr.charAt(0))) {
      return `"'${str.replace(/"/g, '""')}"`;
    }

    // Standard CSV escaping for quotes
    return `"${str.replace(/"/g, '""')}"`;
  };

  const downloadCSV = (tableName: string, data: OMOPTableData[]) => {
    // Validate data array
    if (!data || data.length === 0) {
      logger.warn('Cannot download CSV: no data available', { tableName });
      return;
    }

    // Validate first row structure
    if (!data[0] || typeof data[0] !== 'object') {
      logger.warn('Cannot download CSV: invalid data structure', { tableName });
      return;
    }

    const headers = Object.keys(data[0]);

    // Validate headers exist
    if (headers.length === 0) {
      logger.warn('Cannot download CSV: no columns found', { tableName });
      return;
    }

    try {
      const csvContent = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((header) => sanitizeCSVValue((row as Record<string, any>)[header])).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Track URL for cleanup
      urlsToCleanup.current.push(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}.csv`;
      a.click();

      // Clean up immediately (no setTimeout delay reduces memory leak risk)
      cleanupUrl(url);
    } catch (error) {
      logger.error('Failed to generate CSV:', { tableName, error });
    }
  };

  const downloadAllTables = async () => {
    const zip = new JSZip();

    // Add README file with information about the export
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const tablesWithData = tables.filter((table) => table.data.length > 0);

    const readmeContent = `Observer Data Export
Generated: ${currentDate} at ${currentTime}

This zip file contains ${tablesWithData.length} CSV files with Observer data:

${tablesWithData.map((table) => `- ${table.name}.csv: ${table.displayName}`).join('\n')}

File Format: CSV (Comma Separated Values)
Encoding: UTF-8

Note: This data is from the Observer platform.
`;

    zip.file('README.txt', readmeContent);

    // Add each table with data to the zip
    tables.forEach((table) => {
      // Validate table data
      if (!table.data || table.data.length === 0) {
        return; // Skip tables with no data
      }

      // Validate first row structure
      if (!table.data[0] || typeof table.data[0] !== 'object') {
        logger.warn('Skipping table with invalid data structure', { tableName: table.name });
        return;
      }

      const headers = Object.keys(table.data[0]);

      // Validate headers exist
      if (headers.length === 0) {
        logger.warn('Skipping table with no columns', { tableName: table.name });
        return;
      }

      try {
        const csvContent = [
          headers.join(','),
          ...table.data.map((row) =>
            headers
              .map((header) => sanitizeCSVValue((row as Record<string, any>)[header]))
              .join(',')
          ),
        ].join('\n');

        zip.file(`${table.name}.csv`, csvContent);
      } catch (error) {
        logger.error('Failed to add table to ZIP', { tableName: table.name, error });
      }
    });

    // Generate zip file and trigger download
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);

      // Track URL for cleanup
      urlsToCleanup.current.push(url);

      const a = document.createElement('a');
      a.href = url;

      // Create filename with current date
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      a.download = `observer_data_tables_${currentDate}.zip`;

      a.click();

      // Clean up immediately (no setTimeout delay reduces memory leak risk)
      cleanupUrl(url);
    } catch {
      // Error creating zip file - could show user notification
    }
  };

  const renderFieldValue = useCallback((value: any) => {
    return value?.toString() || '-';
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
        {/* Skeleton for header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          pb={4}
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Skeleton height="24px" width="200px" />
          <HStack gap={3}>
            <Skeleton height="32px" width="100px" />
            <Skeleton height="32px" width="100px" />
          </HStack>
        </Flex>

        {/* Skeleton for tabs */}
        <Stack gap={4} mb={6}>
          <HStack gap={2} mb={4}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={`tab-${i}`} height="40px" width="120px" borderRadius="md" />
            ))}
          </HStack>

          {/* Skeleton for table description */}
          <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
            <HStack gap={3} mb={3}>
              <Skeleton height="24px" width="24px" borderRadius="full" />
              <Stack gap={1} flex={1}>
                <Skeleton height="20px" width="150px" />
                <Skeleton height="16px" width="300px" />
              </Stack>
            </HStack>
            <Flex justify="space-between" align="center">
              <Skeleton height="32px" width="250px" />
              <Skeleton height="16px" width="100px" />
            </Flex>
          </Box>

          {/* Skeleton for table */}
          <Box border="1px" borderColor="gray.200" borderRadius="lg" p={4}>
            <Stack gap={2}>
              {/* Header row */}
              <HStack gap={4} pb={2} borderBottom="2px" borderColor="gray.300">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={`header-${i}`} height="20px" width="100px" />
                ))}
              </HStack>
              {/* Data rows */}
              {Array.from({ length: pageSize }, (_, i) => (
                <HStack key={`row-${i}`} gap={4} py={2} borderBottom="1px" borderColor="gray.100">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Skeleton
                      key={`cell-${i}-${j}`}
                      height="18px"
                      width={j === 0 ? '60px' : j === 1 ? '120px' : '100px'}
                    />
                  ))}
                </HStack>
              ))}
            </Stack>
          </Box>

          {/* Skeleton for pagination */}
          <Flex justify="space-between" align="center" mt={4}>
            <Skeleton height="32px" width="80px" />
            <HStack gap={2}>
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={`page-${i}`} height="32px" width="32px" borderRadius="md" />
              ))}
            </HStack>
            <Skeleton height="32px" width="80px" />
          </Flex>
        </Stack>
      </Box>
    );
  }

  if (error) {
    // Determine error severity based on message content
    const isAuthError = error.includes('Authentication') || error.includes('log in');
    const isServerError = error.includes('Server') || error.includes('unavailable');
    const bgColor = isAuthError ? 'blue.50' : isServerError ? 'orange.50' : 'red.50';
    const borderColor = isAuthError ? 'blue.200' : isServerError ? 'orange.200' : 'red.200';
    const textColor = isAuthError ? 'blue.700' : isServerError ? 'orange.700' : 'red.700';
    const iconColor = isAuthError ? '#3182ce' : isServerError ? '#dd6b20' : '#e53e3e'; // blue.500, orange.500, red.500

    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Box bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md" p={4} mb={4}>
          <Flex align="center" gap={2} mb={2}>
            <FaExclamationTriangle color={iconColor} />
            <Text fontWeight="bold" color={textColor}>
              {isAuthError
                ? 'Login Required'
                : isServerError
                  ? 'Temporarily Unavailable'
                  : 'Data Loading Error'}
            </Text>
          </Flex>
          <Text fontSize="sm" color={textColor}>
            {error}
          </Text>
        </Box>
        {!isAuthError && (
          <Flex justify="center">
            <Text fontSize="sm" color="gray.500">
              Please try refreshing the page or contact support if the problem persists.
            </Text>
          </Flex>
        )}
      </Box>
    );
  }

  return (
    <Box className={className} bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      <TableHeader
        tablesCount={tables.length}
        activeTable={activeTable}
        currentTableDisplayName={currentTable?.displayName}
        onDownloadCurrent={() => currentTable && downloadCSV(currentTable.name, currentTable.data)}
        onDownloadAll={downloadAllTables}
      />

      {/* Table Tabs */}
      <Box p={6} pt={4}>
        <Tabs.Root
          value={activeTable}
          onValueChange={(details) => {
            setActiveTable(details.value as OMOPTableName);
            setSearchTerm(''); // Clear search when switching tables
          }}
        >
          <Box position="relative" mb={6}>
            {/* Scroll Left Button */}
            <IconButton
              position="absolute"
              left="-3"
              top="50%"
              transform="translateY(-50%)"
              zIndex={3}
              size="sm"
              variant="outline"
              bg="white"
              borderColor="gray.200"
              boxShadow="lg"
              borderRadius="full"
              onClick={scrollLeft}
              aria-label="Scroll left"
              _hover={{ bg: 'gray.50', borderColor: 'blue.300' }}
              color="gray.600"
            >
              <FaChevronLeft />
            </IconButton>

            {/* Scroll Right Button */}
            <IconButton
              position="absolute"
              right="-3"
              top="50%"
              transform="translateY(-50%)"
              zIndex={3}
              size="sm"
              variant="outline"
              bg="white"
              borderColor="gray.200"
              boxShadow="lg"
              borderRadius="full"
              onClick={scrollRight}
              aria-label="Scroll right"
              _hover={{ bg: 'gray.50', borderColor: 'blue.300' }}
              color="gray.600"
            >
              <FaChevronRight />
            </IconButton>

            <Box
              ref={scrollContainerRef}
              position="relative"
              overflowX="auto"
              pb={2}
              css={{
                '&::-webkit-scrollbar': {
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  background: SCROLLBAR_COLORS.track,
                  borderRadius: '5px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: SCROLLBAR_COLORS.thumb,
                  borderRadius: '5px',
                },
              }}
            >
              {/* Scroll indicators */}
              <Box
                position="absolute"
                left="0"
                top="0"
                bottom="0"
                width="20px"
                background="linear-gradient(to right, rgba(255,255,255,0.9), transparent)"
                pointerEvents="none"
                zIndex={2}
              />
              <Box
                position="absolute"
                right="0"
                top="0"
                bottom="0"
                width="20px"
                background="linear-gradient(to left, rgba(255,255,255,0.9), transparent)"
                pointerEvents="none"
                zIndex={2}
              />

              <Tabs.List
                minW="max-content"
                bg={COLORS.table.headerBg}
                borderRadius="lg"
                p={1}
                position="relative"
              >
                {tables.map((table) => {
                  const isActive = activeTable === table.name;
                  return (
                    <Tabs.Trigger
                      key={table.name}
                      value={table.name}
                      bg={isActive ? COLORS.ui.inactiveBg : 'transparent'}
                      color={isActive ? COLORS.ui.activeText : COLORS.ui.inactiveText}
                      borderRadius="md"
                      px={4}
                      py={3}
                      mx={1}
                      fontSize="sm"
                      fontWeight={isActive ? 'semibold' : 'medium'}
                      transition="all 0.2s"
                      boxShadow={isActive ? 'sm' : 'none'}
                      _hover={{
                        bg: isActive ? COLORS.ui.inactiveBg : COLORS.ui.hoverBg,
                        color: isActive ? COLORS.ui.activeText : COLORS.ui.inactiveText,
                        transform: 'translateY(-1px)',
                      }}
                    >
                      <Flex align="center" gap={2}>
                        <Box color={isActive ? COLORS.ui.activeIcon : COLORS.ui.inactiveIcon}>
                          {getTableIcon(table.name)}
                        </Box>
                        <Text whiteSpace="nowrap">{table.displayName}</Text>
                      </Flex>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
            </Box>
          </Box>

          {tables.map((table) => {
            // Use memoized filtered data if search term exists, otherwise use original data
            const tableWithFilteredData = searchTerm
              ? filteredTables.find((ft) => ft.name === table.name)
              : null;

            const filteredData = tableWithFilteredData
              ? tableWithFilteredData.filteredData || table.data
              : table.data;

            // Apply sorting
            const sortConfig = getSortConfig(table.name);
            const sortedData = sortData(filteredData, sortConfig);

            // Pagination calculations
            const currentPage = getCurrentPage(table.name);
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = sortedData.slice(startIndex, endIndex);
            const totalCount = sortedData.length;
            const hasNext = endIndex < totalCount;
            const hasPrevious = currentPage > 1;

            // Get columns and column visibility for this table
            const tableColumns = table.data.length > 0 ? Object.keys(table.data[0]) : [];
            const tableColumnVisibility = getColumnVisibility(table.name, tableColumns);

            return (
              <Tabs.Content key={table.name} value={table.name} pt={4}>
                <DataTable
                  table={table}
                  selectedTableInfo={selectedTableInfo}
                  filteredData={paginatedData}
                  totalFilteredCount={totalCount}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  getTableIcon={getTableIcon}
                  renderFieldValue={renderFieldValue}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  onPageChange={(page) => handlePageChange(table.name, page)}
                  sortConfig={sortConfig}
                  onSortChange={(field) => handleSortChange(table.name, field)}
                  columnVisibility={tableColumnVisibility}
                  onColumnVisibilityChange={(columnId, visible) =>
                    handleColumnVisibilityChange(table.name, columnId, visible)
                  }
                  onShowAllColumns={() => handleShowAllColumns(table.name, tableColumns)}
                  onHideAllColumns={() => handleHideAllColumns(table.name, tableColumns)}
                />
              </Tabs.Content>
            );
          })}
        </Tabs.Root>
      </Box>
    </Box>
  );
};

export default HealthcareDataBrowser;
