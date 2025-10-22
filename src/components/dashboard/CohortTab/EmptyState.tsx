'use client';

import React from 'react';
import { Card, VStack, Text, Button } from '@chakra-ui/react';

interface EmptyStateProps {
  onNavigateToResearch?: () => void;
}

export default function EmptyState({ onNavigateToResearch }: EmptyStateProps) {
  return (
    <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
      <Card.Body>
        <VStack gap={4} py={8}>
          <Text color="gray.600" textAlign="center" fontSize="lg" fontWeight="medium">
            No cohorts created yet
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="md">
            Use the Research Data tab to create filters and save them as cohorts for future analysis
          </Text>
          {onNavigateToResearch && (
            <Button colorScheme="blue" variant="outline" onClick={onNavigateToResearch} mt={2}>
              Go to Research Data
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
