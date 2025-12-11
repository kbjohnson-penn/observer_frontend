'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Grid, VStack, HStack, Text, Button, Input, IconButton, Card } from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';
import { FaSearch, FaTimes, FaUsers } from 'react-icons/fa';
import { Cohort } from '@/interfaces/cohort';
import { getCohorts, deleteCohort, updateCohort } from '@/lib/utils/cohortStorage';
import { logger } from '@/lib/logger';
import CohortCard from './CohortCard';
import EmptyState from './EmptyState';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import RenameCohortDialog from './RenameCohortDialog';
import LoadingSkeleton from './LoadingSkeleton';

interface CohortTabProps {
  isActive?: boolean;
  onCohortCountChanged?: () => void;
}

export default function CohortTab({ isActive, onCohortCountChanged }: CohortTabProps) {
  const router = useRouter();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [cohortToDelete, setCohortToDelete] = useState<Cohort | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cohortToRename, setCohortToRename] = useState<Cohort | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCohorts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCohorts();
      setCohorts(data);
    } catch (err) {
      logger.error('Load cohorts error:', err);
      toaster.create({
        title: 'Error',
        description: 'Failed to load cohorts',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cohorts on mount and when tab becomes active
  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  // Reload cohorts when tab becomes active (for tab switching)
  useEffect(() => {
    if (isActive) {
      loadCohorts();
    }
  }, [isActive, loadCohorts]);

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
      await deleteCohort(cohortToDelete.id);
      setCohorts((prev) => prev.filter((c) => c.id !== cohortToDelete.id));
      setCohortToDelete(null);
      // Notify parent that cohort count changed
      onCohortCountChanged?.();
    } catch (err) {
      logger.error('Delete cohort error:', err);
      toaster.create({
        title: 'Error',
        description: 'Failed to delete cohort',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [cohortToDelete, onCohortCountChanged]);

  const handleCancelDelete = useCallback(() => {
    setCohortToDelete(null);
  }, []);

  // Rename handlers
  const handleRenameClick = useCallback((cohort: Cohort) => {
    setCohortToRename(cohort);
  }, []);

  const handleConfirmRename = useCallback(
    async (newName: string, newDescription: string) => {
      if (!cohortToRename) {
        return;
      }

      try {
        setIsRenaming(true);
        const updated = await updateCohort(cohortToRename.id, {
          name: newName,
          description: newDescription,
        });
        setCohorts((prev) => prev.map((c) => (c.id === cohortToRename.id ? updated : c)));
        setCohortToRename(null);
      } catch (err) {
        logger.error('Rename cohort error:', err);
        toaster.create({
          title: 'Error',
          description: 'Failed to update cohort',
          type: 'error',
        });
      } finally {
        setIsRenaming(false);
      }
    },
    [cohortToRename]
  );

  const handleCancelRename = useCallback(() => {
    setCohortToRename(null);
  }, []);

  const handleViewCohort = useCallback(
    (cohort: Cohort) => {
      router.push(`/cohorts/${cohort.id}`);
    },
    [router]
  );

  // Filter cohorts based on search term
  const filteredCohorts = useMemo(() => {
    if (!searchTerm.trim()) {
      return cohorts;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return cohorts.filter(
      (cohort) =>
        cohort.name.toLowerCase().includes(lowerSearch) ||
        (cohort.description && cohort.description.toLowerCase().includes(lowerSearch))
    );
  }, [cohorts, searchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header & Search Combined Card */}
      <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
        <Card.Body py={4}>
          <VStack gap={4} align="stretch">
            {/* Header Section */}
            <VStack align="start" gap={1}>
              <HStack gap={2}>
                <Box color="blue.500" fontSize="xl">
                  <FaUsers />
                </Box>
                <Text fontSize="xl" fontWeight="bold" color="gray.800">
                  Your Cohorts
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" ml={8}>
                Manage your research cohorts and export data
              </Text>
            </VStack>

            {/* Search Section (only when cohorts exist) */}
            {cohorts.length > 0 && (
              <Box pt={2}>
                <Box position="relative">
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  >
                    <FaSearch />
                  </Box>
                  <Input
                    placeholder="Search cohorts by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    pl={10}
                    pr={searchTerm ? 10 : 4}
                    size="md"
                    variant="outline"
                    border="1px solid"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                    }}
                  />
                  {searchTerm && (
                    <IconButton
                      aria-label="Clear search"
                      position="absolute"
                      right={2}
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      onClick={handleClearSearch}
                    >
                      <FaTimes />
                    </IconButton>
                  )}
                </Box>
                {searchTerm && (
                  <Text fontSize="sm" color="blue.600" fontWeight="medium" mt={2}>
                    Showing {filteredCohorts.length} of {cohorts.length} cohorts
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Cohorts Grid or Empty State */}
      {cohorts.length > 0 ? (
        filteredCohorts.length > 0 ? (
          <Box>
            <Box mb={4}>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.600"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Your Cohorts
              </Text>
            </Box>
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={6}
              pb={6}
            >
              {filteredCohorts.map((cohort) => (
                <CohortCard
                  key={cohort.id}
                  cohort={cohort}
                  onView={handleViewCohort}
                  onRename={handleRenameClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </Grid>
          </Box>
        ) : (
          <Box py={8} textAlign="center">
            <Text color="gray.600" mb={2}>
              No cohorts match your search
            </Text>
            <Button size="sm" variant="outline" onClick={handleClearSearch}>
              Clear Search
            </Button>
          </Box>
        )
      ) : (
        <EmptyState />
      )}

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

      {/* Rename Cohort Dialog */}
      <RenameCohortDialog
        isOpen={!!cohortToRename}
        cohort={cohortToRename}
        existingCohorts={cohorts}
        onConfirm={handleConfirmRename}
        onCancel={handleCancelRename}
        loading={isRenaming}
      />
    </VStack>
  );
}
