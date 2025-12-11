'use client';

/**
 * HealthcareDataBrowser Component (Redesigned)
 *
 * Slim orchestrator component (~150 lines vs previous 774 lines).
 * Uses registry-based configuration and centralized state management.
 */

import React from 'react';
import { Box, Heading, Text, Flex } from '@chakra-ui/react';
import { FaDatabase } from 'react-icons/fa';
import { SampleDataAPIResponse } from '@/interfaces/observer-omop';
import COLORS from '@/constants/colors';
import { DataBrowserProvider, useDataBrowser } from './DataBrowserProvider';
import { tableRegistry } from './registry';
import TableTabs from './TableTabs';
import DataTable from './DataTable';
import ErrorBoundary from '@/components/ErrorBoundary';

// ============================================================================
// Types
// ============================================================================

interface HealthcareDataBrowserProps {
  /** Sample data from API */
  sampleData?: SampleDataAPIResponse | null;
}

// ============================================================================
// Header Component
// ============================================================================

function BrowserHeader() {
  return (
    <Box mb={6}>
      <Flex align="center" gap={3} mb={2}>
        <Box p={2} bg={COLORS.primary[100]} borderRadius="lg" color={COLORS.primary[600]}>
          <FaDatabase size="20px" />
        </Box>
        <Heading size="lg" color={COLORS.primary[800]}>
          Healthcare Data Browser
        </Heading>
      </Flex>
      <Text color="gray.600" fontSize="sm">
        Browse and search across all OMOP CDM tables. Select a table to view its data.
      </Text>
    </Box>
  );
}

// ============================================================================
// Loading State
// ============================================================================

function LoadingState() {
  return (
    <Box textAlign="center" py={12}>
      <Text color="gray.500" fontSize="lg">
        Loading healthcare data...
      </Text>
    </Box>
  );
}

// ============================================================================
// Error State
// ============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <Box
      textAlign="center"
      py={12}
      bg="red.50"
      borderRadius="lg"
      border="1px"
      borderColor="red.200"
    >
      <Text color="red.600" fontSize="lg" fontWeight="medium">
        Error loading data
      </Text>
      <Text color="red.500" fontSize="sm" mt={2}>
        {message}
      </Text>
    </Box>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <Box
      textAlign="center"
      py={12}
      bg="gray.50"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
    >
      <Text color="gray.600" fontSize="lg" fontWeight="medium">
        No data available
      </Text>
      <Text color="gray.500" fontSize="sm" mt={2}>
        Healthcare data has not been loaded yet.
      </Text>
    </Box>
  );
}

// ============================================================================
// Browser Content
// ============================================================================

function HealthcareDataBrowserContent() {
  const { state } = useDataBrowser();
  const { isLoading, error, rawData, activeTable } = state;

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state
  if (!rawData) {
    return <EmptyState />;
  }

  // Get all registered tables (show all tables, even if empty)
  const allTables = tableRegistry.getAllIds();

  if (allTables.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Table Selection Tabs */}
      <Box mb={6}>
        <TableTabs visibleTables={allTables} />
      </Box>

      {/* Active Table View (Tab Panel) */}
      <Box role="tabpanel" id={`tabpanel-${activeTable}`} aria-labelledby={`tab-${activeTable}`}>
        <DataTable tableId={activeTable} />
      </Box>
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function HealthcareDataBrowser({ sampleData }: HealthcareDataBrowserProps) {
  return (
    <DataBrowserProvider sampleData={sampleData}>
      <Box p={6} bg="white" borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.200">
        <BrowserHeader />
        <ErrorBoundary componentName="HealthcareDataBrowser">
          <HealthcareDataBrowserContent />
        </ErrorBoundary>
      </Box>
    </DataBrowserProvider>
  );
}

export default HealthcareDataBrowser;
