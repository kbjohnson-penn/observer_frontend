'use client';

import React from 'react';
import { Box, Heading, Text, Flex, Button } from '@chakra-ui/react';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { FaDownload, FaDatabase } from 'react-icons/fa';
import { getTableDisplayName } from '@/constants/table-info.constants';
import { OMOPTableName } from '@/interfaces/observer-omop';
import COLORS from '@/constants/colors';

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
  onDownloadAll
}) => {
  return (
    <Box p={6} pb={4} borderBottom="1px" borderColor={COLORS.table.borderColor} bg={COLORS.ui.activeBg}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="lg" color={COLORS.primary[900]} mb={2}>
            Data Browser
          </Heading>
          <Text color={COLORS.ui.inactiveText} fontSize="md">
            Browse and explore tables
          </Text>
        </Box>
        
        {/* Download Options */}
        <MenuRoot>
          <MenuTrigger asChild>
            <Button
              size="md"
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: COLORS.ui.hoverBg, borderColor: COLORS.primary[400] }}
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
          <Text fontSize="sm" color={COLORS.ui.inactiveText}>Total Tables:</Text>
          <Text fontSize="sm" fontWeight="bold" color={COLORS.primary[600]}>{tablesCount}</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Text fontSize="sm" color={COLORS.ui.inactiveText}>Active Table:</Text>
          <Text fontSize="sm" fontWeight="bold" color="green.600">{getTableDisplayName(activeTable)}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default TableHeader;