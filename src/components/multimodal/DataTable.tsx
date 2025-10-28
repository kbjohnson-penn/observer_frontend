'use client';

import React, { useMemo, useCallback } from 'react';
import { Box, Text, Heading, Flex, Input, HStack } from '@chakra-ui/react';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { OMOPTableName } from '@/interfaces/observer-omop';
import { MEDICAL_TERMS } from '@/constants/table-info.constants';
import { Tooltip } from '@/components/ui/tooltip';
import COLORS from '@/constants/colors';
import PaginationControls from '@/components/dashboard/ResearchTab/PaginationControls';
import ColumnSelector from './ColumnSelector';
import { ColumnVisibility } from '@/lib/utils/userPreferences';

interface DataTableProps {
  table: {
    name: OMOPTableName;
    displayName: string;
    description: string;
    data: any[];
  };
  selectedTableInfo: {
    displayName: string;
    category: string;
  };
  filteredData: any[];
  totalFilteredCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  getTableIcon: (tableName: OMOPTableName) => React.ReactNode;
  renderFieldValue: (value: any) => string;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  sortConfig: { field: string; direction: 'asc' | 'desc' } | null;
  onSortChange: (field: string) => void;
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onShowAllColumns: () => void;
  onHideAllColumns: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  table,
  selectedTableInfo,
  filteredData,
  totalFilteredCount,
  searchTerm,
  onSearchChange,
  getTableIcon,
  renderFieldValue,
  currentPage,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
  sortConfig,
  onSortChange,
  columnVisibility,
  onColumnVisibilityChange,
  onShowAllColumns,
  onHideAllColumns,
}) => {
  // Get visible columns based on columnVisibility
  const visibleColumns = useMemo(() => {
    if (!table.data.length) {
      return [];
    }
    const allColumns = Object.keys(table.data[0]);
    return allColumns.filter((col) => columnVisibility[col] !== false);
  }, [table.data, columnVisibility]);

  // Memoized sort icon component
  const SortIcon = useMemo(() => {
    const Component = ({ field }: { field: string }) => {
      if (!sortConfig || sortConfig.field !== field) {
        return <FaSort color={COLORS.ui.inactiveIcon} size="12px" />;
      }
      return sortConfig.direction === 'asc' ? (
        <FaSortUp color={COLORS.primary[600]} size="12px" />
      ) : (
        <FaSortDown color={COLORS.primary[600]} size="12px" />
      );
    };
    Component.displayName = 'SortIcon';
    return Component;
  }, [sortConfig]);

  // Highlight search term in text
  const highlightText = useCallback((text: string, search: string): React.ReactNode => {
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

      // Add text before match
      if (index > lastIndex) {
        parts.push(textStr.substring(lastIndex, index));
      }

      // Add highlighted match
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
  }, []);

  // Memoized TableRow component for performance
  const TableRow = React.memo(
    ({
      row,
      columns,
      onRenderValue,
      search,
      onHighlight,
    }: {
      row: any;
      columns: string[];
      onRenderValue: (value: any) => string;
      search: string;
      onHighlight: (text: string, search: string) => React.ReactNode;
    }) => (
      <Box
        as="tr"
        _hover={{ bg: COLORS.table.rowHoverBg }}
        transition="background-color 0.2s"
        borderBottom="1px"
        borderColor={COLORS.table.borderColor}
      >
        {columns.map((col) => {
          const value = onRenderValue(row[col]);
          return (
            <Box as="td" key={col} px={4} py={3} fontSize="sm" color="gray.700" verticalAlign="top">
              <Text overflow="hidden" textOverflow="ellipsis">
                {search ? onHighlight(value, search) : value}
              </Text>
            </Box>
          );
        })}
      </Box>
    )
  );
  TableRow.displayName = 'TableRow';

  const renderTableHeader = () => (
    <Box as="thead" position="sticky" top={0} bg={COLORS.table.headerBg} zIndex={1}>
      <Box as="tr">
        {visibleColumns.map((key) => (
          <Box
            as="th"
            key={key}
            role="columnheader"
            aria-sort={
              sortConfig && sortConfig.field === key
                ? sortConfig.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
            textAlign="left"
            px={4}
            py={3}
            borderBottom="1px"
            borderColor={COLORS.table.borderColor}
            fontSize="xs"
            fontWeight="semibold"
            color="gray.700"
            textTransform="uppercase"
            letterSpacing="wide"
          >
            <HStack
              gap={2}
              cursor="pointer"
              onClick={() => onSortChange(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSortChange(key);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Sort by ${key.replace(/_/g, ' ')}`}
              _hover={{ bg: 'gray.100' }}
              _focus={{
                outline: '2px solid',
                outlineColor: COLORS.primary[500],
                outlineOffset: '2px',
                bg: 'gray.50',
              }}
              p={1}
              borderRadius="md"
              transition="background-color 0.2s"
            >
              {MEDICAL_TERMS[key] ? (
                <Tooltip
                  content={<Text>{MEDICAL_TERMS[key]}</Text>}
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
                    {key.replace(/_/g, ' ')}
                  </Text>
                </Tooltip>
              ) : (
                <Text as="span">{key.replace(/_/g, ' ')}</Text>
              )}
              <SortIcon field={key} />
            </HStack>
          </Box>
        ))}
      </Box>
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
      <Flex align="center" gap={3} mb={4}>
        <Box color={COLORS.primary[600]} fontSize="lg">
          {getTableIcon(table.name)}
        </Box>
        <Box flex={1}>
          <Heading size="md" color={COLORS.primary[800]} mb={1}>
            {selectedTableInfo.displayName}
          </Heading>
          <Text fontSize="sm" color={COLORS.primary[700]}>
            {table.description}
          </Text>
        </Box>
      </Flex>

      <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
        <Box position="relative" w={{ base: '100%', md: '350px' }}>
          <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" zIndex={1}>
            <FaSearch color={COLORS.primary[500]} size="14px" />
          </Box>
          <Input
            placeholder={`Search ${selectedTableInfo.displayName.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="sm"
            bg="white"
            borderColor={COLORS.primary[300]}
            _focus={{
              borderColor: COLORS.primary[500],
              boxShadow: `0 0 0 1px ${COLORS.primary[500]}`,
            }}
            _placeholder={{ color: COLORS.primary[400] }}
            borderRadius="md"
            paddingLeft="10"
          />
        </Box>

        <Flex align="center" gap={4}>
          <ColumnSelector
            columns={Object.keys(table.data[0] || {})}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={onColumnVisibilityChange}
            onShowAll={onShowAllColumns}
            onHideAll={onHideAllColumns}
          />
          <Text fontSize="sm" color={COLORS.primary[700]}>
            {totalFilteredCount > pageSize ? (
              <>
                <Text as="span" fontWeight="bold">
                  {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalFilteredCount)}
                </Text>{' '}
                of{' '}
                <Text as="span" fontWeight="bold">
                  {totalFilteredCount}
                </Text>{' '}
                {searchTerm ? 'filtered' : ''} records
              </>
            ) : (
              <>
                <Text as="span" fontWeight="bold">
                  {totalFilteredCount}
                </Text>{' '}
                of{' '}
                <Text as="span" fontWeight="bold">
                  {table.data.length}
                </Text>{' '}
                records
              </>
            )}
            {searchTerm && (
              <Text as="span" ml={2} fontStyle="italic">
                matching &ldquo;{searchTerm}&rdquo;
              </Text>
            )}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );

  if (table.data.length === 0) {
    return (
      <>
        {renderTableDescription()}
        <Box textAlign="center" py={8} bg="gray.50" borderRadius="lg">
          <Text color="gray.500" fontSize="md" fontWeight="medium">
            No data available for {table.displayName}
          </Text>
        </Box>
      </>
    );
  }

  return (
    <>
      {renderTableDescription()}

      <Box
        position="relative"
        overflowX="auto"
        border="1px"
        borderColor={COLORS.table.borderColor}
        borderRadius="lg"
        bg="white"
        maxH="600px"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
            borderRadius: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2563eb',
            borderRadius: '6px',
            '&:hover': {
              background: '#1d4ed8',
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: '#f1f5f9',
          },
        }}
      >
        {/* Subtle fade indicators */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="8px"
          background="linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)"
          pointerEvents="none"
          zIndex={1}
        />
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="8px"
          background="linear-gradient(to top, rgba(255,255,255,0.9), transparent)"
          pointerEvents="none"
          zIndex={1}
        />
        <Box as="table" width="100%" fontSize="sm">
          {renderTableHeader()}
          <Box as="tbody">
            {filteredData.map((row, index) => (
              <TableRow
                key={row.id || index}
                row={row}
                columns={visibleColumns}
                onRenderValue={renderFieldValue}
                search={searchTerm}
                onHighlight={highlightText}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {filteredData.length === 0 && searchTerm && (
        <Box textAlign="center" py={8} bg="gray.50" borderRadius="lg" mt={4}>
          <Text color="gray.500" fontSize="md" fontWeight="medium">
            No results found for &ldquo;{searchTerm}&rdquo;
          </Text>
          <Text color="gray.400" fontSize="sm" mt={1}>
            Try adjusting your search terms
          </Text>
        </Box>
      )}

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalCount={totalFilteredCount}
        pageSize={pageSize}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        loading={false}
        onPageChange={onPageChange}
      />
    </>
  );
};

export default DataTable;
