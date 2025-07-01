'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Spinner, Tabs } from '@chakra-ui/react';
import { FaUsers, FaStethoscope, FaChartBar, FaCog, FaPlay } from 'react-icons/fa';
import { OMOPTableName } from '@/interfaces/observer-omop';
import { TABLE_INFO } from '@/constants/table-info.constants';
import { getSampleData } from '@/data/omop/sample-data-lazy';
import TableHeader from './TableHeader';
import DataTable from './DataTable';
import COLORS from '@/constants/colors';
import JSZip from 'jszip';

interface HealthcareDataBrowserProps {
  className?: string;
}

interface DataTable {
  name: OMOPTableName;
  displayName: string;
  description: string;
  data: any[];
}

const HealthcareDataBrowser: React.FC<HealthcareDataBrowserProps> = ({ className }) => {
  const [tables, setTables] = useState<DataTable[]>([]);
  const [activeTable, setActiveTable] = useState<OMOPTableName>('PERSON');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load all OMOP tables with sample data asynchronously
    const loadData = async () => {
      try {
        setLoading(true);
        const loadedSampleData = await getSampleData();
        
        const allTables: DataTable[] = Object.keys(TABLE_INFO).map((tableName) => {
          const info = TABLE_INFO[tableName as OMOPTableName];
          return {
            name: tableName as OMOPTableName,
            displayName: info.displayName,
            description: info.description,
            data: loadedSampleData[tableName as OMOPTableName] || []
          };
        });

        setTables(allTables);
      } catch (error) {
        console.error('Failed to load sample data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentTable = tables.find(table => table.name === activeTable);
  const selectedTableInfo = TABLE_INFO[activeTable];
  
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

  const downloadCSV = (tableName: string, data: any[]) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadAllTables = async () => {
    const zip = new JSZip();
    
    // Add README file with information about the export
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const tablesWithData = tables.filter(table => table.data.length > 0);
    
    const readmeContent = `Observer Data Export
Generated: ${currentDate} at ${currentTime}

This zip file contains ${tablesWithData.length} CSV files with Observer data:

${tablesWithData.map(table => 
  `- ${table.name}.csv: ${table.displayName}`
).join('\n')}

File Format: CSV (Comma Separated Values)
Encoding: UTF-8

Note: This data is from the Observer platform.
`;
    
    zip.file('README.txt', readmeContent);
    
    // Add each table with data to the zip
    tables.forEach(table => {
      if (table.data.length > 0) {
        const headers = Object.keys(table.data[0]);
        const csvContent = [
          headers.join(','),
          ...table.data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        zip.file(`${table.name}.csv`, csvContent);
      }
    });
    
    // Generate zip file and trigger download
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Create filename with current date
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      a.download = `observer_data_tables_${currentDate}.zip`;
      
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
    }
  };

  const renderFieldValue = (value: any) => {
    return value?.toString() || '-';
  };


  if (loading) {
    return (
      <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
        <Flex direction="column" align="center" justify="center" py={8}>
          <Spinner size="lg" mb={4} />
          <Text>Loading healthcare data...</Text>
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
          <Box 
            overflowX="auto" 
            mb={6}
            pb={2}
            css={{
              '&::-webkit-scrollbar': {
                height: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f5f9',
                borderRadius: '3px',
                marginTop: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e0',
                borderRadius: '3px',
                '&:hover': {
                  background: '#a0aec0'
                }
              }
            }}
          >
            <Tabs.List 
              minW="max-content" 
              bg={COLORS.table.headerBg} 
              borderRadius="lg" 
              p={1}
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
                    fontWeight={isActive ? "semibold" : "medium"}
                    transition="all 0.2s"
                    boxShadow={isActive ? 'sm' : 'none'}
                    _hover={{ 
                      bg: isActive ? COLORS.ui.inactiveBg : COLORS.ui.hoverBg,
                      color: isActive ? COLORS.ui.activeText : COLORS.ui.inactiveText,
                      transform: 'translateY(-1px)'
                    }}
                  >
                    <Flex align="center" gap={2}>
                      <Box color={isActive ? COLORS.ui.activeIcon : COLORS.ui.inactiveIcon}>
                        {getTableIcon(table.name)}
                      </Box>
                      <Text whiteSpace="nowrap">
                        {table.displayName}
                      </Text>
                    </Flex>
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Box>
          
          {tables.map((table) => {
            const filteredData = table.data.filter(row =>
              searchTerm === '' || Object.values(row).some(value => 
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
              )
            );
            
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