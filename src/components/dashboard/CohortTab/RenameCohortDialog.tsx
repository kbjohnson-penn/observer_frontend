'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Button, Text, VStack, Input, HStack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { Cohort } from '@/interfaces/cohort';
import { validateCohortName, COHORT_NAME_MAX_LENGTH } from '@/lib/utils/cohortValidation';

interface RenameCohortDialogProps {
  isOpen: boolean;
  cohort: Cohort | null;
  existingCohorts: Cohort[];
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function RenameCohortDialog({
  isOpen,
  cohort,
  existingCohorts,
  onConfirm,
  onCancel,
  loading = false,
}: RenameCohortDialogProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens with a cohort
  useEffect(() => {
    if (isOpen && cohort) {
      setNewName(cohort.name);
      setError(null);
    }
  }, [isOpen, cohort]);

  const handleSubmit = () => {
    // Use shared validation utility
    const validationError = validateCohortName(newName, existingCohorts, cohort?.id);

    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(newName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && newName.trim()) {
      handleSubmit();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewName('');
      setError(null);
      onCancel();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Rename Cohort</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap={4} align="stretch">
              <Field label="New Name" required>
                <Input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter new cohort name"
                  disabled={loading}
                  maxLength={COHORT_NAME_MAX_LENGTH}
                />
              </Field>

              <HStack justify="space-between">
                <Text fontSize="xs" color="gray.500">
                  {newName.length}/{COHORT_NAME_MAX_LENGTH} characters
                </Text>
              </HStack>

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              loading={loading}
              disabled={!newName.trim() || loading}
            >
              Rename
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
