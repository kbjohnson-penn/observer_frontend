'use client';

import React from 'react';
import { Dialog, Button, Text, VStack } from '@chakra-ui/react';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  cohortName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  cohortName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onCancel()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete Cohort?</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap={3} align="start">
              <Text>
                Are you sure you want to delete the cohort{' '}
                <strong>&ldquo;{cohortName}&rdquo;</strong>?
              </Text>
              <Text fontSize="sm" color="gray.600">
                This action cannot be undone. All saved filters and settings will be permanently
                removed.
              </Text>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirm} loading={loading} disabled={loading}>
              Delete Cohort
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
