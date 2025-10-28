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
  Text,
} from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { CohortCreateRequest } from '@/interfaces/cohort';
import { VisitSearchFilters } from '@/interfaces/research';

interface CreateCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cohort: CohortCreateRequest) => Promise<void>;
  filters: VisitSearchFilters;
  visitCount: number;
}

export default function CreateCohortDialog({
  isOpen,
  onClose,
  onSave,
  filters,
  visitCount,
}: CreateCohortDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError('Cohort name is required');
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
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Pediatric Patients 2024"
                  disabled={loading}
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
