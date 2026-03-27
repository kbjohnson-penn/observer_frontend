'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, VStack, Text, Badge, HStack } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { CohortCreateRequest, Cohort } from '@/interfaces/cohort';
import { EncounterSearchFilters } from '@/interfaces/search';
import { validateCohortName, COHORT_NAME_MAX_LENGTH } from '@/lib/utils/cohortValidation';
import { createCohort, getCohorts } from '@/lib/utils/cohortStorage';

export type SaveCohortMode = 'search' | 'selected';

interface SaveSearchCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (cohort: Cohort) => void;
  mode: SaveCohortMode;
  filters: EncounterSearchFilters;
  query: string;
  totalCount: number;
  encounterIds?: string[];
}

export default function SaveSearchCohortDialog({
  isOpen,
  onClose,
  onSaved,
  mode,
  filters,
  query,
  totalCount,
  encounterIds,
}: SaveSearchCohortDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCohorts, setExistingCohorts] = useState<Cohort[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCohorts().then(setExistingCohorts);
    }
  }, [isOpen]);

  const count = mode === 'selected' ? (encounterIds?.length ?? 0) : totalCount;

  const handleSave = async () => {
    const validationError = validateCohortName(name, existingCohorts);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: CohortCreateRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        source: 'search',
        filters: mode === 'search' ? filters : undefined,
        encounterIds: mode === 'selected' ? encounterIds : undefined,
        searchQuery: query || undefined,
        visitCount: count,
      };

      const cohort = await createCohort(request);
      setName('');
      setDescription('');
      onSaved(cohort);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cohort');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && name.trim()) {
      handleSave();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setError(null);
      onClose();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogContent>
        <DialogHeader borderBottomWidth="1px" pb={4}>
          <DialogTitle fontSize="lg" fontWeight="semibold">
            Save as Cohort
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody py={6}>
          <VStack gap={4} align="stretch">
            {/* Context */}
            <HStack gap={2} flexWrap="wrap">
              <Text fontSize="sm" color="gray.600">
                {mode === 'selected' ? (
                  <>
                    Saving <strong>{count.toLocaleString()}</strong> selected encounter
                    {count !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    Saving search with <strong>{count.toLocaleString()}</strong> encounter
                    {count !== 1 ? 's' : ''}
                  </>
                )}
              </Text>
              {query && (
                <Badge colorPalette="blue" variant="subtle" size="sm">
                  query: {query.length > 30 ? `${query.slice(0, 30)}...` : query}
                </Badge>
              )}
            </HStack>

            {/* Name */}
            <Field
              label="Cohort Name"
              required
              invalid={!!error}
              errorText={error || undefined}
              helperText={
                !error ? `${name.length}/${COHORT_NAME_MAX_LENGTH} characters` : undefined
              }
            >
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Diabetic patients with transcript"
                disabled={loading}
                maxLength={COHORT_NAME_MAX_LENGTH}
                variant="outline"
                padding={2}
                border="1px solid"
                borderColor="gray.300"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{ borderColor: 'blue.500' }}
              />
            </Field>

            {/* Description */}
            <Field label="Description (Optional)">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this cohort..."
                rows={3}
                disabled={loading}
                padding={2}
                variant="outline"
                border="1px solid"
                borderColor="gray.300"
                _hover={{ borderColor: 'gray.400' }}
                _focus={{ borderColor: 'blue.500' }}
              />
            </Field>
          </VStack>
        </DialogBody>

        <DialogFooter borderTopWidth="1px" pt={4} gap={3}>
          <Button
            variant="outline"
            onClick={handleClose}
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
            onClick={handleSave}
            loading={loading}
            disabled={!name.trim() || loading}
            bg="blue.600"
            color="white"
            px={4}
            py={2}
            _hover={{ bg: 'blue.700' }}
          >
            Save Cohort
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
