'use client';

/**
 * DataTable Component (Refactored)
 *
 * Uses TanStack Table with getPaginationRowModel() for built-in pagination.
 * No manual array slicing - TanStack handles everything.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Heading, Flex, Input, HStack, Button, VStack } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem, MenuSeparator } from '@/components/ui/menu';
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaFileArchive,
  FaChevronDown,
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
import ConfirmExportDialog, { ExportType } from './ConfirmExportDialog';
import {
  exportSingleTable,
  exportAllTables,
  downloadBlob,
  ExportError,
} from '@/services/exportService';
import { logger } from '@/lib/logger';
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

  // Get data browser context for cohortId (used for server-side exports)
  const { cohortId, getTableData } = useDataBrowser();

  // Debounce delay for search input (ms)
  const SEARCH_DEBOUNCE_MS = 300;

  // Local state for search input (allows immediate UI feedback)
  const [localFilter, setLocalFilter] = useState(globalFilter);
  const debouncedFilter = useDebounce(localFilter, SEARCH_DEBOUNCE_MS);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<ExportType | null>(null);

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

  // Clear search input when switching between tables
   
  useEffect(() => {
    setLocalFilter(globalFilter);
  }, [tableId]);

  // Get display info from registry
  const displayName = config?.display.name || tableId;
  const description = config?.display.description || '';
  const IconComponent = config?.display.icon;

  // ============================================================================
  // Export Handlers (Server-Side with Audit Logging)
  // ============================================================================

  /**
   * Get record count for export dialog display
   */
  const getExportRecordCount = (exportType: ExportType): number => {
    if (exportType.startsWith('current-')) {
      return table.getFilteredRowModel().rows.length;
    }
    // For all tables export, sum records from all registered tables
    const registeredTables = tableRegistry.getAllIds();
    return registeredTables.reduce((total, regTableId) => {
      const tableData = getTableData(regTableId);
      return total + (tableData?.length || 0);
    }, 0);
  };

  /**
   * Request export - opens confirmation dialog
   */
  const requestExport = (type: ExportType) => {
    if (!cohortId) {
      logger.error('Cannot export: cohortId is not available');
      return;
    }
    setPendingExportType(type);
    setExportDialogOpen(true);
  };

  /**
   * Handle confirmed export - calls server-side API with cohortId
   * Backend fetches data server-side with tier-based access control
   */
  const handleConfirmedExport = async () => {
    if (!pendingExportType || !cohortId) {
      logger.error('Cannot export: missing export type or cohortId');
      return;
    }

    setExportDialogOpen(false);
    setIsExporting(true);

    try {
      // Get the API key (lowercase) from config for backend API calls
      // Backend TABLE_REGISTRY expects lowercase keys (e.g., 'persons', 'visits')
      const exportTableId = config?.apiKey || tableId.toLowerCase();

      switch (pendingExportType) {
        case 'current-with-docs': {
          const blob = await exportSingleTable(cohortId, exportTableId, true);
          downloadBlob(blob, `${exportTableId}_export.zip`);
          break;
        }
        case 'all-with-docs': {
          const blob = await exportAllTables(cohortId, true);
          downloadBlob(blob, 'observer_export.zip');
          break;
        }
      }
      logger.info(`Export completed: ${pendingExportType}`);
      // Show success toast
      toaster.create({
        title: 'Export Complete',
        description: 'Your data has been downloaded successfully.',
        type: 'success',
      });
    } catch (error) {
      logger.error('Export failed:', error);
      // Show user-friendly error toast
      const errorMessage =
        error instanceof ExportError ? error.message : 'Export failed. Please try again.';
      toaster.create({
        title: 'Export Failed',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsExporting(false);
      setPendingExportType(null);
    }
  };

  /**
   * Cancel export - closes dialog without action
   */
  const handleCancelExport = () => {
    setExportDialogOpen(false);
    setPendingExportType(null);
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
            {/* Current Table */}
            <MenuItem
              value="export-current-docs"
              onClick={() => requestExport('current-with-docs')}
              _hover={{ bg: 'blue.50' }}
              cursor="pointer"
            >
              <HStack gap={2} width="full">
                <Box color="blue.600">
                  <FaFileArchive />
                </Box>
                <VStack align="start" gap={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    Export Current Table
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    ZIP with documentation
                  </Text>
                </VStack>
              </HStack>
            </MenuItem>

            <MenuSeparator />

            {/* All Tables */}
            <MenuItem
              value="export-all-docs"
              onClick={() => requestExport('all-with-docs')}
              _hover={{ bg: 'purple.50' }}
              cursor="pointer"
            >
              <HStack gap={2} width="full">
                <Box color="purple.600">
                  <FaFileArchive />
                </Box>
                <VStack align="start" gap={0} flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.800">
                    Export All Tables
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    Full data package with documentation
                  </Text>
                </VStack>
              </HStack>
            </MenuItem>
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

        {/* Export Confirmation Dialog (needed for empty table exports) */}
        <ConfirmExportDialog
          isOpen={exportDialogOpen}
          exportType={pendingExportType || 'current-with-docs'}
          tableName={displayName}
          tableCount={tableRegistry.getAllIds().length}
          recordCount={pendingExportType ? getExportRecordCount(pendingExportType) : 0}
          onConfirm={handleConfirmedExport}
          onCancel={handleCancelExport}
          loading={isExporting}
        />
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

      {/* Export Confirmation Dialog */}
      <ConfirmExportDialog
        isOpen={exportDialogOpen}
        exportType={pendingExportType || 'current-with-docs'}
        tableName={displayName}
        tableCount={tableRegistry.getAllIds().length}
        recordCount={pendingExportType ? getExportRecordCount(pendingExportType) : 0}
        onConfirm={handleConfirmedExport}
        onCancel={handleCancelExport}
        loading={isExporting}
      />
    </>
  );
}

export default DataTable;
