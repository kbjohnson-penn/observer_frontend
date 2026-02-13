'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea, VStack, Text } from '@chakra-ui/react';
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
            {/* Visit Count Info */}
            <Text fontSize="sm" color="gray.600">
              This cohort will include <strong>{visitCount.toLocaleString()}</strong> visits based
              on your current filters.
            </Text>

            {/* Name Field */}
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
                placeholder="e.g., Pediatric Patients 2024"
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

            {/* Description Field */}
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
