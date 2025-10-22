'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box, Text, Flex, Spinner, Tabs, IconButton } from '@chakra-ui/react';
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
import { OMOPTableName, SampleDataAPIResponse } from '@/interfaces/observer-omop';
import { TABLE_INFO } from '@/constants/table-info.constants';
import { apiClient } from '@/lib/apiClient';
import TableHeader from './TableHeader';
import DataTable from './DataTable';
import COLORS from '@/constants/colors';
import JSZip from 'jszip';

interface HealthcareDataBrowserProps {
  className?: string;
  sampleData?: SampleDataAPIResponse | null;
}

interface DataTable {
  name: OMOPTableName;
  displayName: string;
  description: string;
  data: any[];
  filteredData?: any[];
}

const HealthcareDataBrowser: React.FC<HealthcareDataBrowserProps> = ({ className, sampleData }) => {
  const [tables, setTables] = useState<DataTable[]>([]);
  const [activeTable, setActiveTable] = useState<OMOPTableName>('PERSON');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
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
      const loadedSampleData: Record<OMOPTableName, any[]> = {
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
      // Handle API errors
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to load data from API';
      setError(errorMessage);
      setTables([]); // Clear tables on error
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

  const currentTable = tables.find((table) => table.name === activeTable);
  const selectedTableInfo = TABLE_INFO[activeTable];

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

  // Helper functions
  const getTableIcon = (tableName: OMOPTableName) => {
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
  };

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

  const downloadCSV = (tableName: string, data: any[]) => {
    if (data.length === 0) {
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => sanitizeCSVValue(row[header])).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Track URL for cleanup
    urlsToCleanup.current.push(url);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}.csv`;
    a.click();

    // Clean up immediately after download
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      urlsToCleanup.current = urlsToCleanup.current.filter((u) => u !== url);
    }, 100);
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
      if (table.data.length > 0) {
        const headers = Object.keys(table.data[0]);
        const csvContent = [
          headers.join(','),
          ...table.data.map((row) =>
            headers.map((header) => sanitizeCSVValue(row[header])).join(',')
          ),
        ].join('\n');

        zip.file(`${table.name}.csv`, csvContent);
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

      // Clean up immediately after download
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        urlsToCleanup.current = urlsToCleanup.current.filter((u) => u !== url);
      }, 100);
    } catch {
      // Error creating zip file - could show user notification
    }
  };

  const renderFieldValue = (value: any) => {
    return value?.toString() || '-';
  };

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
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Flex direction="column" align="center" justify="center" py={8}>
          <Spinner size="lg" mb={4} />
          <Text>Loading Sample data...</Text>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Box bg="red.50" border="1px" borderColor="red.200" borderRadius="md" p={4} mb={4}>
          <Flex align="center" gap={2} mb={2}>
            <FaExclamationTriangle color="red" />
            <Text fontWeight="bold" color="red.700">
              API Error
            </Text>
          </Flex>
          <Text fontSize="sm" color="red.600">
            {error}
          </Text>
        </Box>
        <Flex justify="center">
          <Text fontSize="sm" color="gray.500">
            Please check your network connection and try refreshing the page.
          </Text>
        </Flex>
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
                  background: '#f1f5f9',
                  borderRadius: '5px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#2563eb',
                  borderRadius: '5px',
                  '&:hover': {
                    background: '#1d4ed8',
                  },
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

            return (
              <Tabs.Content key={table.name} value={table.name} pt={4}>
                <DataTable
                  table={table}
                  selectedTableInfo={selectedTableInfo}
                  filteredData={filteredData}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  getTableIcon={getTableIcon}
                  renderFieldValue={renderFieldValue}
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
