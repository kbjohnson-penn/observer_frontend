'use client';

import React from 'react';
import { Box, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { FaDownload, FaDatabase } from 'react-icons/fa';
import { getTableDisplayName } from '@/constants/table-info.constants';
import { OMOPTableName } from '@/interfaces/observer-omop';

interface TableHeaderProps {
  tablesCount: number;
  activeTable: OMOPTableName;
  currentTableDisplayName?: string;
  onDownloadCurrent: () => void;
  onDownloadAll: () => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  tablesCount,
  activeTable,
  currentTableDisplayName,
  onDownloadCurrent,
  onDownloadAll,
}) => {
  return (
    <Box p={6} pb={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg" color="blue.900" mb={2} fontWeight="bold">
            Data Browser
          </Heading>
          <Text color="gray.700" fontSize="md">
            Browse and explore tables
          </Text>
        </Box>

        {/* Download Options */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button
              size="md"
              colorPalette="blue"
              variant="outline"
              _hover={{ bg: 'gray.50', borderColor: 'blue.400' }}
            >
              <FaDownload style={{ marginRight: '8px', color: '#2563eb' }} />
              Download CSV
            </Button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem value="current" onClick={onDownloadCurrent}>
              <Flex align="center" gap={2}>
                <FaDownload color="#2563eb" />
                <Text>Download Current Table ({currentTableDisplayName || 'None'})</Text>
              </Flex>
            </MenuItem>
            <MenuItem value="all" onClick={onDownloadAll}>
              <Flex align="center" gap={2}>
                <FaDatabase color="#2563eb" />
                <Text>Download All Tables (ZIP)</Text>
              </Flex>
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </Flex>

      {/* Stats Overview */}
      <Flex gap={6} align="center" flexWrap="wrap">
        <Flex align="center" gap={2}>
          <Text fontSize="sm" color="gray.700">
            Total Tables:
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="blue.600">
            {tablesCount}
          </Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Text fontSize="sm" color="gray.700">
            Active Table:
          </Text>
          <Text fontSize="sm" fontWeight="bold" color="green.600">
            {getTableDisplayName(activeTable)}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TableHeader;
