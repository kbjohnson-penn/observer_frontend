'use client';

import React from 'react';
import { IconButton, Box, Text } from '@chakra-ui/react';
import { FaColumns } from 'react-icons/fa';
import { MenuRoot, MenuTrigger, MenuContent, MenuItem } from '@/components/ui/menu';
import { Checkbox } from '@/components/ui/checkbox';
import COLORS from '@/constants/colors';
import { ColumnVisibility } from '@/lib/utils/userPreferences';

interface ColumnSelectorProps {
  columns: string[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  onShowAll,
  onHideAll,
}) => {
  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton
          aria-label="Manage columns"
          size="sm"
          variant="outline"
          borderColor={COLORS.primary[300]}
          _hover={{
            bg: COLORS.primary[50],
            borderColor: COLORS.primary[500],
          }}
        >
          <FaColumns color={COLORS.primary[600]} />
        </IconButton>
      </MenuTrigger>
      <MenuContent maxH="400px" overflowY="auto" minW="200px">
        {/* Header with counts */}
        <Box px={3} py={2} borderBottom="1px" borderColor="gray.200" bg="gray.50">
          <Text fontSize="xs" fontWeight="semibold" color="gray.700" textTransform="uppercase">
            Columns ({visibleCount}/{columns.length})
          </Text>
        </Box>

        {/* Show All / Hide All buttons */}
        <Box px={3} py={2} borderBottom="1px" borderColor="gray.200">
          <Box display="flex" gap={2}>
            <Text
              as="button"
              fontSize="xs"
              color="blue.600"
              fontWeight="medium"
              cursor="pointer"
              onClick={onShowAll}
              _hover={{ color: 'blue.800', textDecoration: 'underline' }}
            >
              Show All
            </Text>
            <Text fontSize="xs" color="gray.400">
              |
            </Text>
            <Text
              as="button"
              fontSize="xs"
              color="blue.600"
              fontWeight="medium"
              cursor="pointer"
              onClick={onHideAll}
              _hover={{ color: 'blue.800', textDecoration: 'underline' }}
            >
              Hide All
            </Text>
          </Box>
        </Box>

        {/* Column checkboxes */}
        {columns.map((column) => (
          <MenuItem
            key={column}
            value={column}
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={(e) => {
              e.preventDefault();
              onColumnVisibilityChange(column, !columnVisibility[column]);
            }}
          >
            <Checkbox
              checked={columnVisibility[column]}
              onCheckedChange={(e) => {
                onColumnVisibilityChange(column, e.checked === true);
              }}
            >
              <Text fontSize="sm" ml={2}>
                {column.replace(/_/g, ' ')}
              </Text>
            </Checkbox>
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  );
};

export default ColumnSelector;
