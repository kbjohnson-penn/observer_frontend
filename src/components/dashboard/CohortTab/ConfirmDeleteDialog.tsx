'use client';

import React from 'react';
import { Button, Text, VStack } from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from '@/components/ui/dialog';

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
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onCancel()}>
      <DialogContent aria-describedby="delete-dialog-description">
        <DialogHeader borderBottomWidth="1px" pb={4}>
          <DialogTitle fontSize="lg" fontWeight="semibold">
            Delete Cohort?
          </DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody py={6} id="delete-dialog-description">
          <VStack gap={3} align="start">
            <Text>
              Are you sure you want to delete the cohort <strong>&ldquo;{cohortName}&rdquo;</strong>
              ?
            </Text>
            <Text fontSize="sm" color="gray.600">
              This action cannot be undone. All saved filters and settings will be permanently
              removed.
            </Text>
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
            bg="red.600"
            color="white"
            px={4}
            py={2}
            _hover={{ bg: 'red.700' }}
          >
            Delete Cohort
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
