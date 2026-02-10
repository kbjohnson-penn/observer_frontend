'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, VStack } from '@chakra-ui/react';
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
import { Cohort } from '@/interfaces/cohort';
import {
  validateCohortName,
  COHORT_NAME_MAX_LENGTH,
  COHORT_DESCRIPTION_MAX_LENGTH,
} from '@/lib/utils/cohortValidation';

interface RenameCohortDialogProps {
  isOpen: boolean;
  cohort: Cohort | null;
  existingCohorts: Cohort[];
  onConfirm: (newName: string, newDescription: string) => void;
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
  const [newDescription, setNewDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens with a cohort
  useEffect(() => {
    if (isOpen && cohort) {
      setNewName(cohort.name);
      setNewDescription(cohort.description || '');
      setError(null);
    } else if (!isOpen) {
      // Reset when dialog closes
      setNewName('');
      setNewDescription('');
      setError(null);
    }
    // Only run when isOpen or cohort.id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cohort?.id]);

  const handleSubmit = () => {
    // Use shared validation utility
    const validationError = validateCohortName(newName, existingCohorts, cohort?.id);

    if (validationError) {
      setError(validationError);
      return;
    }

    onConfirm(newName.trim(), newDescription.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && newName.trim()) {
      handleSubmit();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewName('');
      setNewDescription('');
      setError(null);
      onCancel();
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogContent>
        <DialogHeader borderBottomWidth="1px" pb={4}>
          <DialogTitle fontSize="lg" fontWeight="semibold">
            Edit Cohort
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody py={6}>
          <VStack gap={4} align="stretch">
            <Field
              label="Name"
              required
              invalid={!!error}
              errorText={error || undefined}
              helperText={
                !error ? `${newName.length}/${COHORT_NAME_MAX_LENGTH} characters` : undefined
              }
            >
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter cohort name"
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

            <Field
              label="Description"
              helperText={`${newDescription.length}/${COHORT_DESCRIPTION_MAX_LENGTH} characters`}
            >
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter cohort description (optional)"
                disabled={loading}
                maxLength={COHORT_DESCRIPTION_MAX_LENGTH}
                rows={3}
                variant="outline"
                padding={2}
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
            onClick={handleSubmit}
            loading={loading}
            disabled={!newName.trim() || loading}
            bg="blue.600"
            color="white"
            px={4}
            py={2}
            _hover={{ bg: 'blue.700' }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
