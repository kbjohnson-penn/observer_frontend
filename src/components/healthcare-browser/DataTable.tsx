'use client';

/**
 * DataTable Component (Refactored)
 *
 * Uses TanStack Table with getPaginationRowModel() for built-in pagination.
 * No manual array slicing - TanStack handles everything.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Heading, Flex, Input, HStack, Button, VStack } from '@chakra-ui/react';
import {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuItemGroup,
} from '@/components/ui/menu';
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaFileArchive,
  FaChevronDown,
  FaFileCsv,
} from 'react-icons/fa';
import { flexRender, SortDirection, Row } from '@tanstack/react-table';
import { OMOPTableName, OMOPTableData } from '@/interfaces/observer-omop';
import { Tooltip } from '@/components/ui/tooltip';
import COLORS, { SCROLLBAR_COLORS } from '@/constants/colors';
import { useTableInstance } from '@/hooks/useTableInstance';
import { useDebounce } from '@/hooks';
import { useDataBrowser } from './DataBrowserProvider';
import { tableRegistry } from './registry';
import { expandDemographic } from '@/lib/utils/utils';
import {
  exportTableToCSV,
  exportAllTablesToZip,
  TableExportData,
  TableDocumentation,
  buildTableDocumentation,
  exportTableWithDocumentation,
  exportAllTablesWithDocumentation,
} from '@/lib/utils/csv-export';
// ============================================================================
// Demographic Column Mapping (for display formatting)
// ============================================================================

const DEMOGRAPHIC_COLUMNS: Record<string, 'gender' | 'race' | 'ethnicity'> = {
  gender_source_value: 'gender',
  race_source_value: 'race',
  ethnicity_source_value: 'ethnicity',
};

/**
 * Formats a cell value, expanding demographic codes for display
 */
function formatDisplayValue(value: unknown, columnId: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  const demographicType = DEMOGRAPHIC_COLUMNS[columnId];
  if (demographicType) {
    return expandDemographic(String(value), demographicType);
  }

  return String(value);
}

// ============================================================================
// Types
// ============================================================================

interface DataTableProps {
  tableId: OMOPTableName;
}

interface ColumnMeta {
  tooltip?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Sort icon component for table headers
 */
const SortIcon: React.FC<{ sortDirection: SortDirection | false }> = ({ sortDirection }) => {
  if (!sortDirection) {
    return <FaSort color={COLORS.ui.inactiveIcon} size="12px" />;
  }
  return sortDirection === 'asc' ? (
    <FaSortUp color={COLORS.primary[600]} size="12px" />
  ) : (
    <FaSortDown color={COLORS.primary[600]} size="12px" />
  );
};

/**
 * Highlights search term occurrences in text
 */
function highlightText(text: string, search: string): React.ReactNode {
  if (!search || !text) {
    return text;
  }

  const textStr = String(text);
  const searchLower = search.toLowerCase();
  const textLower = textStr.toLowerCase();

  if (!textLower.includes(searchLower)) {
    return textStr;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  while (lastIndex < textStr.length) {
    const index = textLower.indexOf(searchLower, lastIndex);
    if (index === -1) {
      parts.push(textStr.substring(lastIndex));
      break;
    }

    if (index > lastIndex) {
      parts.push(textStr.substring(lastIndex, index));
    }

    parts.push(
      <Box
        as="mark"
        key={index}
        bg="yellow.200"
        color="gray.900"
        fontWeight="semibold"
        px={0.5}
        borderRadius="sm"
      >
        {textStr.substring(index, index + search.length)}
      </Box>
    );

    lastIndex = index + search.length;
  }

  return <>{parts}</>;
}

// ============================================================================
// Main Component
// ============================================================================

function DataTable({ tableId }: DataTableProps) {
  const {
    table,
    config,
    paginatedRows,
    filteredRowCount,
    pageCount,
    pageIndex,
    pageSize,
    canNextPage,
    canPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    globalFilter,
    setGlobalFilter,
    // Column visibility methods available for future ColumnSelector component
    // columnVisibility,
    // toggleColumnVisibility,
    // showAllColumns,
    // hideAllColumns,
    // allColumnIds,
  } = useTableInstance({ tableId });

  // Get data browser context for "Export All" functionality
  const { getTableData, state } = useDataBrowser();

  // Debounce delay for search input (ms)
  const SEARCH_DEBOUNCE_MS = 300;

  // Local state for search input (allows immediate UI feedback)
  const [localFilter, setLocalFilter] = useState(globalFilter);
  const debouncedFilter = useDebounce(localFilter, SEARCH_DEBOUNCE_MS);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Track if filter change originated from local input
  const isLocalUpdateRef = useRef(false);

  // Sync debounced value to global filter
  useEffect(() => {
    isLocalUpdateRef.current = true;
    setGlobalFilter(debouncedFilter);
  }, [debouncedFilter, setGlobalFilter]);

  // Sync local filter when globalFilter changes externally (e.g., table switch or external reset)
  useEffect(() => {
    if (!isLocalUpdateRef.current) {
      setLocalFilter(globalFilter);
    }
    isLocalUpdateRef.current = false;
  }, [globalFilter]);

  // Get display info from registry
  const displayName = config?.display.name || tableId;
  const description = config?.display.description || '';
  const IconComponent = config?.display.icon;

  // ============================================================================
  // Export Handlers
  // ============================================================================

  const handleExportCurrentTable = () => {
    const allRows = table.getFilteredRowModel().rows;
    const dataToExport = allRows.map((row) => row.original);

    // Get column labels
    const columnLabels: Record<string, string> = {};
    table.getAllColumns().forEach((col) => {
      columnLabels[col.id] = col.columnDef.header as string;
    });

    const filename = `${tableId.toLowerCase()}_${new Date().toISOString().split('T')[0]}`;

    exportTableToCSV(dataToExport, {
      filename,
      columnLabels,
    });
  };

  const handleExportAllTables = async () => {
    if (isExporting) {
      return;
    }
    if (!state.rawData) {
      console.warn('No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const tablesToExport: TableExportData[] = [];
      const registeredTables = tableRegistry.getAllIds();

      for (const regTableId of registeredTables) {
        let tableData = getTableData(regTableId);
        const tableConfig = tableRegistry.get(regTableId);

        // Only skip if no config (unconfigured tables)
        if (!tableConfig) {
          continue;
        }

        // Export even if data is empty - include table structure
        if (!tableData) {
          tableData = [];
        }

        // Get column labels from config
        const columnLabels: Record<string, string> = {};
        if (tableConfig?.columns?.columnLabels) {
          Object.entries(tableConfig.columns.columnLabels).forEach(([key, labelDef]) => {
            if (labelDef && typeof labelDef === 'object' && 'label' in labelDef) {
              columnLabels[key] = labelDef.label;
            }
          });
        }

        tablesToExport.push({
          tableName: regTableId,
          displayName: tableConfig.display.name || regTableId,
          data: tableData,
          columnLabels,
        });
      }

      if (tablesToExport.length === 0) {
        console.warn('No tables with data to export');
        return;
      }

      const zipFilename = `observer-data-export_${new Date().toISOString().split('T')[0]}`;
      await exportAllTablesToZip(tablesToExport, zipFilename);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentTableWithDocs = async () => {
    if (isExporting) {
      return;
    }

    const allRows = table.getFilteredRowModel().rows;
    const dataToExport = allRows.map((row) => row.original);

    // Get column labels
    const columnLabels: Record<string, string> = {};
    table.getAllColumns().forEach((col) => {
      columnLabels[col.id] = col.columnDef.header as string;
    });

    const filename = `${tableId.toLowerCase()}_${new Date().toISOString().split('T')[0]}`;

    // Build documentation
    const tableConfig = tableRegistry.get(tableId);
    if (!tableConfig) {
      console.error('Table config not found');
      return;
    }

    const documentation = buildTableDocumentation(tableId, tableConfig, dataToExport);

    setIsExporting(true);
    try {
      await exportTableWithDocumentation(dataToExport, { filename, columnLabels }, documentation);
    } catch (error) {
      console.error('Export with docs failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllTablesWithDocs = async () => {
    if (isExporting) {
      return;
    }
    if (!state.rawData) {
      console.warn('No data available to export');
      return;
    }

    setIsExporting(true);
    try {
      const tablesToExport: TableExportData[] = [];
      const documentations: TableDocumentation[] = [];
      const registeredTables = tableRegistry.getAllIds();

      for (const regTableId of registeredTables) {
        let tableData = getTableData(regTableId);
        const tableConfig = tableRegistry.get(regTableId);

        // Only skip if no config
        if (!tableConfig) {
          continue;
        }

        // Export even if data is empty
        if (!tableData) {
          tableData = [];
        }

        // Get column labels from config
        const columnLabels: Record<string, string> = {};
        if (tableConfig.columns?.columnLabels) {
          Object.entries(tableConfig.columns.columnLabels).forEach(([key, labelDef]) => {
            if (labelDef && typeof labelDef === 'object' && 'label' in labelDef) {
              columnLabels[key] = labelDef.label;
            }
          });
        }

        tablesToExport.push({
          tableName: regTableId,
          displayName: tableConfig.display.name || regTableId,
          data: tableData,
          columnLabels,
        });

        // Build documentation for this table
        const documentation = buildTableDocumentation(regTableId, tableConfig, tableData);
        documentations.push(documentation);
      }

      if (tablesToExport.length === 0) {
        console.warn('No tables with data to export');
        return;
      }

      const zipFilename = `observer-data-export_${new Date().toISOString().split('T')[0]}`;
      await exportAllTablesWithDocumentation(tablesToExport, documentations, zipFilename);
    } catch (error) {
      console.error('Export with docs failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Header groups for rendering
  const headerGroups = table.getHeaderGroups();

  // Calculate display range
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRowCount);
  const totalDataCount = table.getCoreRowModel().rows.length;

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderTableHeader = () => (
    <Box
      as="thead"
      position="sticky"
      top={0}
      bg="white"
      zIndex={2}
      boxShadow={COLORS.table.headerShadow}
    >
      {headerGroups.map((headerGroup) => (
        <Box as="tr" key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const columnMeta = header.column.columnDef.meta as ColumnMeta | undefined;
            const tooltip = columnMeta?.tooltip;
            const sortDirection = header.column.getIsSorted();

            return (
              <Box
                as="th"
                key={header.id}
                role="columnheader"
                aria-sort={
                  sortDirection ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'
                }
                textAlign="left"
                px={4}
                py={3}
                borderBottom="2px"
                borderColor="gray.200"
                fontSize="sm"
                fontWeight="600"
                color="gray.700"
                bg={COLORS.table.headerBg}
              >
                <HStack
                  gap={2}
                  cursor="pointer"
                  onClick={header.column.getToggleSortingHandler()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      header.column.getToggleSortingHandler()?.(e);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Sort by ${header.column.id.replace(/_/g, ' ')}${sortDirection ? ` (currently ${sortDirection === 'asc' ? 'ascending' : 'descending'})` : ''}`}
                  _hover={{ bg: 'gray.100' }}
                  _focus={{
                    outline: '2px solid',
                    outlineColor: COLORS.primary[500],
                    outlineOffset: '2px',
                    bg: 'gray.50',
                  }}
                  p={1}
                  borderRadius="md"
                  transition="background-color 0.15s"
                  justify="space-between"
                >
                  {tooltip ? (
                    <Tooltip
                      content={<Text>{tooltip}</Text>}
                      contentProps={{
                        bg: 'gray.800',
                        color: 'white',
                        px: 3,
                        py: 2,
                        borderRadius: 'md',
                        fontSize: 'sm',
                        maxW: '300px',
                      }}
                    >
                      <Text
                        as="span"
                        cursor="help"
                        textDecoration="underline"
                        textDecorationStyle="dotted"
                        color="blue.600"
                        _hover={{ color: 'blue.800' }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Text>
                    </Tooltip>
                  ) : (
                    <Text as="span">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                  )}
                  <Box opacity={sortDirection ? 1 : 0.4} transition="opacity 0.15s">
                    <SortIcon sortDirection={sortDirection} />
                  </Box>
                </HStack>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );

  const renderTableBody = () => (
    <Box as="tbody">
      {paginatedRows.map((row: Row<OMOPTableData>, index: number) => (
        <Box
          as="tr"
          key={row.id}
          bg={index % 2 === 0 ? COLORS.table.rowEvenBg : COLORS.table.rowOddBg}
          _hover={{ bg: COLORS.table.rowHoverBg }}
          transition="background-color 0.15s"
          borderBottom="1px"
          borderColor="gray.100"
        >
          {row.getVisibleCells().map((cell) => {
            const cellValue = cell.getValue();
            const columnId = cell.column.id;
            const isIdColumn = columnId.endsWith('_id') || columnId === 'id';
            const isNull = cellValue === null || cellValue === undefined || cellValue === '';
            // Format the display value directly (expands demographics like M -> Male)
            const displayValue = formatDisplayValue(cellValue, columnId);

            return (
              <Box as="td" key={cell.id} px={4} py={3} fontSize="sm" verticalAlign="middle">
                {isNull ? (
                  <Text color={COLORS.table.cellNullText} fontStyle="italic">
                    -
                  </Text>
                ) : isIdColumn ? (
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    bg={COLORS.table.cellIdBg}
                    color={COLORS.table.cellIdText}
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    display="inline-block"
                    overflow="hidden"
                    textOverflow="ellipsis"
                  >
                    {globalFilter ? highlightText(displayValue, globalFilter) : displayValue}
                  </Text>
                ) : (
                  <Text color="gray.800" overflow="hidden" textOverflow="ellipsis">
                    {globalFilter ? highlightText(displayValue, globalFilter) : displayValue}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );

  const renderTableDescription = () => (
    <Box
      mb={6}
      p={4}
      bg={COLORS.primary[50]}
      borderRadius="lg"
      border="1px"
      borderColor={COLORS.primary[200]}
    >
      {/* Table Title and Export Button */}
      <Flex align="center" justify="space-between" mb={4} gap={3} wrap="wrap">
        <Flex align="center" gap={3} flex={1}>
          <Box color={COLORS.primary[600]} fontSize="lg">
            {IconComponent && <IconComponent />}
          </Box>
          <Box>
            <Heading size="md" color={COLORS.primary[800]} mb={1}>
              {displayName}
            </Heading>
            <Text fontSize="sm" color={COLORS.primary[700]}>
              {description}
            </Text>
          </Box>
        </Flex>

        {/* Export Button */}
        <MenuRoot positioning={{ placement: 'bottom-end' }}>
          <MenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              colorPalette="blue"
              color="blue.600"
              borderColor="blue.500"
              _hover={{ bg: 'blue.50', borderColor: 'blue.600' }}
              disabled={isExporting}
              opacity={isExporting ? 0.7 : 1}
            >
              <FaDownload style={{ marginRight: '6px' }} />
              <Text fontSize="sm">{isExporting ? 'Exporting...' : 'Export Data'}</Text>
              <FaChevronDown style={{ marginLeft: '6px' }} />
            </Button>
          </MenuTrigger>
          <MenuContent
            bg="white"
            border="1px"
            borderColor="gray.200"
            shadow="lg"
            minW="280px"
            portalled
          >
            {/* Current Table Group */}
            <MenuItemGroup title="Current Table">
              <MenuItem
                value="export-current-csv"
                onClick={handleExportCurrentTable}
                _hover={{ bg: 'blue.50' }}
                cursor="pointer"
              >
                <HStack gap={2} width="full">
                  <Box color="blue.600">
                    <FaFileCsv />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      Export as CSV
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Data only
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>

              <MenuItem
                value="export-current-docs"
                onClick={handleExportCurrentTableWithDocs}
                _hover={{ bg: 'blue.50' }}
                cursor="pointer"
              >
                <HStack gap={2} width="full">
                  <Box color="blue.600">
                    <FaFileArchive />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      Export with Documentation
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      CSV + metadata files
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
            </MenuItemGroup>

            <MenuSeparator />

            {/* All Tables Group */}
            <MenuItemGroup title="All Tables">
              <MenuItem
                value="export-all-csv"
                onClick={handleExportAllTables}
                _hover={{ bg: 'purple.50' }}
                cursor="pointer"
              >
                <HStack gap={2} width="full">
                  <Box color="purple.600">
                    <FaFileArchive />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      Export as ZIP
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      CSVs only
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>

              <MenuItem
                value="export-all-docs"
                onClick={handleExportAllTablesWithDocs}
                _hover={{ bg: 'purple.50' }}
                cursor="pointer"
              >
                <HStack gap={2} width="full">
                  <Box color="purple.600">
                    <FaFileArchive />
                  </Box>
                  <VStack align="start" gap={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      Export with Documentation
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Full data package
                    </Text>
                  </VStack>
                </HStack>
              </MenuItem>
            </MenuItemGroup>
          </MenuContent>
        </MenuRoot>
      </Flex>

      {/* Search and Record Count */}
      <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
        <Box position="relative" w={{ base: '100%', md: '350px' }}>
          <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex={1}>
            <FaSearch color={COLORS.primary[500]} size="12px" />
          </Box>
          <Input
            placeholder={
              config?.display.searchPlaceholder || `Search ${displayName.toLowerCase()}...`
            }
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            size="sm"
            bg="white"
            borderColor={COLORS.primary[300]}
            _focus={{
              borderColor: COLORS.primary[500],
              boxShadow: `0 0 0 1px ${COLORS.primary[500]}`,
            }}
            _placeholder={{ color: COLORS.primary[400], fontSize: 'xs' }}
            borderRadius="md"
            paddingLeft="10"
            fontSize="xs"
          />
        </Box>

        <Text fontSize="xs" color={COLORS.primary[700]}>
          {filteredRowCount > pageSize ? (
            <>
              <Text as="span" fontWeight="bold">
                {startIndex + 1}-{endIndex}
              </Text>{' '}
              of{' '}
              <Text as="span" fontWeight="bold">
                {filteredRowCount}
              </Text>{' '}
              {globalFilter ? 'filtered' : ''} records
            </>
          ) : (
            <>
              <Text as="span" fontWeight="bold">
                {filteredRowCount}
              </Text>{' '}
              of{' '}
              <Text as="span" fontWeight="bold">
                {totalDataCount}
              </Text>{' '}
              records
            </>
          )}
          {globalFilter && (
            <Text as="span" ml={2} fontStyle="italic">
              matching &ldquo;{globalFilter}&rdquo;
            </Text>
          )}
        </Text>
      </Flex>
    </Box>
  );

  const renderPagination = () => {
    if (filteredRowCount <= pageSize) {
      return null;
    }

    // Generate page numbers to display (first, last, current +/- 2)
    const currentPage = pageIndex + 1; // 1-based for display
    const totalPages = pageCount;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
    );

    return (
      <HStack justify="center" mt={4} align="center">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousPage}
          disabled={!canPreviousPage}
          colorPalette="gray"
          px={4}
          py={2}
          _hover={{ bg: 'gray.100' }}
        >
          Previous
        </Button>

        <HStack gap={2}>
          {pageNumbers.map((page, index, array) => (
            <React.Fragment key={page}>
              {index > 0 && array[index - 1] !== page - 1 && <Text color="gray.400">...</Text>}
              <Button
                size="sm"
                variant={currentPage === page ? 'solid' : 'outline'}
                colorPalette={currentPage === page ? 'blue' : 'gray'}
                bg={currentPage === page ? COLORS.primary[600] : 'white'}
                color={currentPage === page ? 'white' : 'gray.700'}
                borderColor={currentPage === page ? COLORS.primary[600] : 'gray.300'}
                onClick={() => goToPage(page - 1)}
                _hover={{
                  bg: currentPage === page ? COLORS.primary[700] : 'gray.100',
                }}
              >
                {page}
              </Button>
            </React.Fragment>
          ))}
        </HStack>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextPage}
          disabled={!canNextPage}
          colorPalette="gray"
          px={4}
          py={2}
          _hover={{ bg: 'gray.100' }}
        >
          Next
        </Button>
      </HStack>
    );
  };

  // ============================================================================
  // Empty State
  // ============================================================================

  if (totalDataCount === 0) {
    return (
      <>
        {renderTableDescription()}
        <Box textAlign="center" py={8} bg="gray.50" borderRadius="lg">
          <Text color="gray.500" fontSize="md" fontWeight="medium">
            No data available for {displayName}
          </Text>
        </Box>
      </>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <>
      {renderTableDescription()}

      <Box
        position="relative"
        overflowX="auto"
        border="1px"
        borderColor={COLORS.table.borderColor}
        borderRadius="xl"
        bg="white"
        maxH="600px"
        overflowY="auto"
        boxShadow="sm"
        css={{
          '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: SCROLLBAR_COLORS.track,
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: SCROLLBAR_COLORS.thumb,
            borderRadius: '6px',
          },
        }}
      >
        <Box as="table" width="100%" fontSize="sm">
          {renderTableHeader()}
          {renderTableBody()}
        </Box>
      </Box>

      {paginatedRows.length === 0 && globalFilter && (
        <Box textAlign="center" py={8} bg="gray.50" borderRadius="lg" mt={4}>
          <Text color="gray.500" fontSize="md" fontWeight="medium">
            No results found for &ldquo;{globalFilter}&rdquo;
          </Text>
          <Text color="gray.400" fontSize="sm" mt={1}>
            Try adjusting your search terms
          </Text>
        </Box>
      )}

      {renderPagination()}
    </>
  );
}

export default DataTable;
