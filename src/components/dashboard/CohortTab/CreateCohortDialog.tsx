'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Cohort, CohortCreateRequest } from '@/interfaces/cohort';
import { VisitSearchFilters } from '@/interfaces/research';
import { validateCohortName, COHORT_NAME_MAX_LENGTH } from '@/lib/utils/cohortValidation';

interface CreateCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cohort: CohortCreateRequest) => Promise<void>;
  filters: VisitSearchFilters;
  visitCount: number;
  existingCohorts: Cohort[];
}

export default function CreateCohortDialog({
  isOpen,
  onClose,
  onSave,
  filters,
  visitCount,
  existingCohorts,
}: CreateCohortDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Use shared validation utility
    const validationError = validateCohortName(name, existingCohorts);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        filters,
        visitCount,
      });

      // Reset form
      setName('');
      setDescription('');
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
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <DialogContent>
          <DialogHeader>
            <Dialog.Title>Save as Cohort</Dialog.Title>
          </DialogHeader>

          <DialogBody>
            <VStack gap={4} align="stretch">
              {/* Visit Count Info */}
              <Text fontSize="sm" color="gray.600">
                This cohort will include <strong>{visitCount.toLocaleString()}</strong> visits based
                on your current filters.
              </Text>

              {/* Name Field */}
              <Field label="Cohort Name" required>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., Pediatric Patients 2024"
                  disabled={loading}
                  maxLength={COHORT_NAME_MAX_LENGTH}
                />
              </Field>

              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  {name.length}/{COHORT_NAME_MAX_LENGTH} characters
                </Text>
              </HStack>

              {/* Description Field */}
              <Field label="Description (Optional)">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this cohort..."
                  rows={3}
                  disabled={loading}
                />
              </Field>

              {/* Error Message */}
              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSave}
              loading={loading}
              disabled={!name.trim() || loading}
            >
              Save Cohort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
