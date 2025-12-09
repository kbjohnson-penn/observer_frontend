'use client';

/**
 * TableTabs Component
 *
 * Horizontal tabs for switching between OMOP tables.
 * Grouped by category for better organization.
 */

import React, { useMemo, useCallback } from 'react';
import { Box, HStack, Text, Flex } from '@chakra-ui/react';
import { OMOPTableName } from '@/interfaces/observer-omop';
import { tableRegistry, TableCategory } from './registry';
import { useDataBrowser } from './DataBrowserProvider';
import COLORS from '@/constants/colors';

// ============================================================================
// Types
// ============================================================================

interface TableTabsProps {
  /** Which tables to show (if not provided, shows all) */
  visibleTables?: OMOPTableName[];
}

// ============================================================================
// Category Styling
// ============================================================================

const CATEGORY_LABELS: Record<TableCategory, string> = {
  person: 'People',
  clinical: 'Clinical',
  survey: 'Surveys',
  admin: 'Admin',
  multimodal: 'Multimodal',
};

// ============================================================================
// Component
// ============================================================================

function TableTabs({ visibleTables }: TableTabsProps) {
  const { state, setActiveTable } = useDataBrowser();
  const activeTable = state.activeTable;

  // Get tables grouped by category
  const tablesByCategory = useMemo(() => {
    const allConfigs = tableRegistry.getAll();
    const filtered = visibleTables
      ? allConfigs.filter((config) => visibleTables.includes(config.id))
      : allConfigs;

    // Group by category
    const grouped = new Map<TableCategory, typeof filtered>();
    filtered.forEach((config) => {
      const category = config.display.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(config);
    });

    return grouped;
  }, [visibleTables]);

  // Category order - defined outside useMemo to avoid re-creation on every render
  const categoryOrder = useMemo<TableCategory[]>(
    () => ['person', 'clinical', 'multimodal', 'survey', 'admin'],
    []
  );

  // Flat list of all visible table IDs for keyboard navigation
  const allVisibleTableIds = useMemo(() => {
    const ids: OMOPTableName[] = [];
    categoryOrder.forEach((category) => {
      const tables = tablesByCategory.get(category);
      if (tables) {
        tables.forEach((config) => ids.push(config.id));
      }
    });
    return ids;
  }, [tablesByCategory, categoryOrder]);

  // Handle keyboard navigation between tabs (WCAG 2.1 requirement)
  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, tableId: OMOPTableName) => {
      const currentIndex = allVisibleTableIds.indexOf(tableId);
      if (currentIndex === -1) {
        return;
      }

      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = (currentIndex + 1) % allVisibleTableIds.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = (currentIndex - 1 + allVisibleTableIds.length) % allVisibleTableIds.length;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = allVisibleTableIds.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== null) {
        const newTableId = allVisibleTableIds[newIndex];
        setActiveTable(newTableId);
        // Focus the new tab
        document.getElementById(`tab-${newTableId}`)?.focus();
      }
    },
    [allVisibleTableIds, setActiveTable]
  );

  return (
    <Box
      overflowX="auto"
      pb={2}
      css={{
        '&::-webkit-scrollbar': {
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
        },
      }}
    >
      <HStack gap={6} minW="max-content" py={2}>
        {categoryOrder.map((category) => {
          const tables = tablesByCategory.get(category);
          if (!tables || tables.length === 0) {
            return null;
          }

          return (
            <Box key={category}>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                mb={2}
              >
                {CATEGORY_LABELS[category]}
              </Text>
              <HStack role="tablist" aria-label={`${CATEGORY_LABELS[category]} tables`} gap={2}>
                {tables.map((config) => {
                  const isActive = activeTable === config.id;
                  const IconComponent = config.display.icon;

                  return (
                    <Box
                      key={config.id}
                      as="button"
                      id={`tab-${config.id}`}
                      px={3}
                      py={2}
                      borderRadius="lg"
                      border="1px"
                      bg={isActive ? COLORS.primary[50] : 'white'}
                      borderColor={isActive ? COLORS.primary[400] : 'gray.200'}
                      color={isActive ? COLORS.primary[700] : 'gray.600'}
                      fontWeight={isActive ? '600' : '500'}
                      fontSize="sm"
                      cursor="pointer"
                      transition="all 0.15s"
                      _hover={{
                        bg: isActive ? COLORS.primary[100] : 'gray.50',
                        borderColor: isActive ? COLORS.primary[500] : 'gray.300',
                      }}
                      _focus={{
                        outline: '2px solid',
                        outlineColor: COLORS.primary[500],
                        outlineOffset: '2px',
                      }}
                      onClick={() => setActiveTable(config.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, config.id)}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${config.id}`}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <Flex align="center" gap={2}>
                        {IconComponent && (
                          <Box color={isActive ? COLORS.primary[600] : 'gray.400'} fontSize="sm">
                            <IconComponent />
                          </Box>
                        )}
                        <Text>{config.display.name}</Text>
                      </Flex>
                    </Box>
                  );
                })}
              </HStack>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
}

export default TableTabs;
