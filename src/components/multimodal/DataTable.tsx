'use client';

import React from 'react';
import { Box, Text, Heading, Flex, Input } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { OMOPTableName } from '@/interfaces/observer-omop';
import { MEDICAL_TERMS } from '@/constants/table-info.constants';
import { Tooltip } from '@/components/ui/tooltip';
import COLORS from '@/constants/colors';

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
  searchTerm: string;
  onSearchChange: (value: string) => void;
  getTableIcon: (tableName: OMOPTableName) => React.ReactNode;
  renderFieldValue: (value: any) => string;
}

const DataTable: React.FC<DataTableProps> = ({
  table,
  selectedTableInfo,
  filteredData,
  searchTerm,
  onSearchChange,
  getTableIcon,
  renderFieldValue
}) => {
  const renderTableHeader = (tableData: any[]) => (
    <Box as="thead" position="sticky" top={0} bg={COLORS.table.headerBg} zIndex={1}>
      <Box as="tr">
        {Object.keys(tableData[0] || {}).map(key => (
          <Box
            as="th"
            key={key}
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
                  maxW: '300px'
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
              <Text as="span">
                {key.replace(/_/g, ' ')}
              </Text>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderTableDescription = () => (
    <Box mb={6} p={4} bg={COLORS.primary[50]} borderRadius="lg" border="1px" borderColor={COLORS.primary[200]}>
      <Flex align="center" gap={3} mb={4}>
        <Box color={COLORS.primary[600]} fontSize="lg">
          {getTableIcon(table.name)}
        </Box>
        <Box flex={1}>
          <Heading size="md" color={COLORS.primary[800]} mb={1}>
            {selectedTableInfo.displayName}
          </Heading>
          <Text fontSize="sm" color={COLORS.primary[700]}>{table.description}</Text>
        </Box>
      </Flex>
      
      <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
        <Box position="relative" w={{ base: "100%", md: "350px" }}>
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
            _focus={{ borderColor: COLORS.primary[500], boxShadow: `0 0 0 1px ${COLORS.primary[500]}` }}
            _placeholder={{ color: COLORS.primary[400] }}
            borderRadius="md"
            paddingLeft="10"
          />
        </Box>
        
        <Text fontSize="sm" color={COLORS.primary[700]}>
          <Text as="span" fontWeight="bold">{filteredData.length}</Text> of <Text as="span" fontWeight="bold">{table.data.length}</Text> records
          {searchTerm && <Text as="span" ml={2} fontStyle="italic">matching &ldquo;{searchTerm}&rdquo;</Text>}
        </Text>
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
            height: '12px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
            borderRadius: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2563eb',
            borderRadius: '6px',
            '&:hover': {
              background: '#1d4ed8'
            }
          },
          '&::-webkit-scrollbar-corner': {
            background: '#f1f5f9'
          }
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
          {renderTableHeader(table.data)}
          <Box as="tbody">
            {filteredData.map((row, index) => (
              <Box 
                as="tr" 
                key={index} 
                _hover={{ bg: COLORS.table.rowHoverBg }} 
                transition="background-color 0.2s"
                borderBottom="1px"
                borderColor={COLORS.table.borderColor}
              >
                {Object.entries(row).map(([, value]: [string, any], cellIndex) => (
                  <Box
                    as="td"
                    key={cellIndex}
                    px={4}
                    py={3}
                    fontSize="sm"
                    color="gray.700"
                    verticalAlign="top"
                  >
                    <Text overflow="hidden" textOverflow="ellipsis">
                      {renderFieldValue(value)}
                    </Text>
                  </Box>
                ))}
              </Box>
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
    </>
  );
};

export default DataTable;