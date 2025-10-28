'use client';

import React from 'react';
import { Card, VStack, Text, Button, Box } from '@chakra-ui/react';
import { FaUsers, FaArrowRight } from 'react-icons/fa';

interface EmptyStateProps {
  onNavigateToResearch?: () => void;
}

export default function EmptyState({ onNavigateToResearch }: EmptyStateProps) {
  return (
    <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
      <Card.Body>
        <VStack gap={6} py={12}>
          {/* Icon */}
          <Box
            p={4}
            borderRadius="full"
            bg="blue.50"
            color="blue.500"
            fontSize="4xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FaUsers />
          </Box>

          {/* Text */}
          <VStack gap={3}>
            <Text color="gray.700" textAlign="center" fontSize="xl" fontWeight="semibold">
              No cohorts created yet
            </Text>
            <Text fontSize="md" color="gray.500" textAlign="center" maxW="md" lineHeight="tall">
              Cohorts let you save filtered datasets for future analysis. Get started by exploring
              the Research Data tab and applying filters to create your first cohort.
            </Text>
          </VStack>

          {/* Action Button */}
          {onNavigateToResearch && (
            <Button colorScheme="blue" size="lg" onClick={onNavigateToResearch} mt={2}>
              Explore Research Data
              <Box as="span" ml={2}>
                <FaArrowRight />
              </Box>
            </Button>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
