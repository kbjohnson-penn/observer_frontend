'use client';

import React from 'react';
import { Box, Text, VStack, Button } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';

export type ExportType = 'current-with-docs' | 'all-with-docs';

interface ConfirmExportDialogProps {
  isOpen: boolean;
  exportType: ExportType;
  tableName?: string;
  tableCount?: number;
  recordCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Get human-readable export type description
 */
function getExportDescription(
  exportType: ExportType,
  tableName?: string,
  tableCount?: number
): string {
  switch (exportType) {
    case 'current-with-docs':
      return `Export "${tableName}" with documentation`;
    case 'all-with-docs':
      return `Export all ${tableCount} tables with documentation`;
    default:
      return 'Export data';
  }
}

/**
 * Confirmation dialog for HIPAA-compliant PHI data exports.
 *
 * Features:
 * - PHI warning banner
 * - Export details (table name, record count)
 * - Audit logging notice
 * - Cancel/Confirm buttons with loading state
 */
export default function ConfirmExportDialog({
  isOpen,
  exportType,
  tableName,
  tableCount,
  recordCount,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmExportDialogProps) {
  const exportDescription = getExportDescription(exportType, tableName, tableCount);
  const isAllTables = exportType.startsWith('all-');

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onCancel()}>
      <DialogContent aria-describedby="export-dialog-description" maxW="md">
        <DialogHeader borderBottomWidth="1px" pb={4}>
          <DialogTitle fontSize="lg" fontWeight="semibold">
            Confirm Export
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody py={6} id="export-dialog-description">
          <VStack gap={4} align="stretch">
            {/* PHI Warning Banner */}
            <Box bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="md" p={4}>
              <Text fontWeight="semibold" color="orange.800" mb={1}>
                ⚠️ Protected Health Information (PHI)
              </Text>
              <Text fontSize="sm" color="orange.700">
                This export may contain sensitive patient data subject to HIPAA regulations. Ensure
                you have proper authorization before proceeding.
              </Text>
            </Box>

            {/* Export Details */}
            <VStack align="start" gap={2}>
              <Text fontWeight="medium">{exportDescription}</Text>
              <Box bg="gray.50" borderRadius="md" p={3} w="100%">
                <VStack align="start" gap={1}>
                  {!isAllTables && tableName && (
                    <Text fontSize="sm" color="gray.600">
                      <strong>Table:</strong> {tableName}
                    </Text>
                  )}
                  {isAllTables && tableCount && (
                    <Text fontSize="sm" color="gray.600">
                      <strong>Tables:</strong> {tableCount}
                    </Text>
                  )}
                  <Text fontSize="sm" color="gray.600">
                    <strong>Records:</strong> {recordCount.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Format:</strong> ZIP (with documentation)
                  </Text>
                </VStack>
              </Box>
            </VStack>

            {/* Audit Notice */}
            <Box bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" p={3}>
              <Text fontSize="sm" color="blue.700">
                📋 This export will be logged for HIPAA compliance.
              </Text>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter borderTopWidth="1px" pt={4} gap={3}>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            borderWidth="1px"
            borderStyle="solid"
            borderColor="gray.400"
            bg="white"
            color="gray.700"
            px={4}
            py={2}
            _hover={{ bg: 'gray.100', borderColor: 'gray.500' }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            bg="blue.600"
            color="white"
            px={4}
            py={2}
            _hover={{ bg: 'blue.700' }}
          >
            Export Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
