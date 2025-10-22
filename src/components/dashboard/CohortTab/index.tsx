'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, VStack, HStack, Text, Button, Alert } from '@chakra-ui/react';
import { Cohort } from '@/interfaces/cohort';
import {
  getCohorts,
  deleteCohort,
  duplicateCohort,
  exportCohortToJSON,
} from '@/lib/utils/cohortStorage';
import { logger } from '@/lib/logger';
import CohortCard from './CohortCard';
import EmptyState from './EmptyState';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

export default function CohortTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load cohorts on mount
  useEffect(() => {
    loadCohorts();
  }, []);

  const loadCohorts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCohorts();
      setCohorts(data);
    } catch (err) {
      setError('Failed to load cohorts');
      logger.error('Load cohorts error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = useCallback(
    (cohortId: string) => {
      const cohort = cohorts.find((c) => c.id === cohortId);
      if (cohort) {
        setCohortToDelete(cohort);
      }
    },
    [cohorts]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!cohortToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await deleteCohort(cohortToDelete.id);
      setCohorts((prev) => prev.filter((c) => c.id !== cohortToDelete.id));
      setCohortToDelete(null);
    } catch (err) {
      logger.error('Delete cohort error:', err);
      setError('Failed to delete cohort');
    } finally {
      setIsDeleting(false);
    }
  }, [cohortToDelete]);

  const handleCancelDelete = useCallback(() => {
    setCohortToDelete(null);
  }, []);

  const handleDuplicateCohort = useCallback(async (cohort: Cohort) => {
    try {
      const duplicated = await duplicateCohort(cohort.id);
      setCohorts((prev) => [...prev, duplicated]);
    } catch (err) {
      logger.error('Duplicate cohort error:', err);
      setError('Failed to duplicate cohort');
    }
  }, []);

  const handleViewCohort = useCallback((cohort: Cohort) => {
    // TODO: Navigate to cohort detail view or show modal with filter details
    logger.log('View cohort:', cohort);
  }, []);

  const handleExportCohort = useCallback((cohort: Cohort) => {
    try {
      exportCohortToJSON(cohort);
    } catch (err) {
      logger.error('Export cohort error:', err);
      setError('Failed to export cohort');
    }
  }, []);

  if (loading) {
    return (
      <Box py={8}>
        <Text>Loading cohorts...</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            Saved Cohorts
          </Text>
          <Text fontSize="sm" color="gray.600">
            Manage your research cohorts and export data
          </Text>
        </Box>
        {/* TODO: Enable create button when integrated with ResearchTab */}
        <Button colorScheme="blue" disabled>
          Create New Cohort
        </Button>
      </HStack>

      {/* Error Alert */}
      {error && (
        <Alert.Root status="error">
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
      )}

      {/* Cohorts Grid or Empty State */}
      {cohorts.length > 0 ? (
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {cohorts.map((cohort) => (
            <CohortCard
              key={cohort.id}
              cohort={cohort}
              onView={handleViewCohort}
              onDuplicate={handleDuplicateCohort}
              onDelete={handleDeleteClick}
              onExport={handleExportCohort}
            />
          ))}
        </Grid>
      ) : (
        <EmptyState />
      )}

      {/* Info Alert */}
      <Alert.Root status="info">
        <Alert.Title>
          Cohorts are currently stored locally. Server-side sync coming soon.
        </Alert.Title>
      </Alert.Root>

      {/* Confirm Delete Dialog */}
      {cohortToDelete && (
        <ConfirmDeleteDialog
          isOpen={!!cohortToDelete}
          cohortName={cohortToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          loading={isDeleting}
        />
      )}
    </VStack>
  );
}
