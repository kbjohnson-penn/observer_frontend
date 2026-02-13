'use client';

import React from 'react';
import { Box, VStack, HStack, Grid, Skeleton, Card } from '@chakra-ui/react';

export default function LoadingSkeleton() {
  return (
    <VStack gap={6} align="stretch">
      {/* Header Card Skeleton */}
      <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
        <Card.Body py={4}>
          <VStack gap={4} align="stretch">
            {/* Header Section */}
            <VStack align="start" gap={1}>
              <HStack gap={2}>
                <Skeleton height="24px" width="24px" />
                <Skeleton height="28px" width="140px" />
              </HStack>
              <Skeleton height="16px" width="280px" ml={8} />
            </VStack>

            {/* Search Bar Skeleton */}
            <Box pt={2}>
              <Skeleton height="40px" width="100%" />
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Cohort Cards Grid Skeleton */}
      <Box>
        <Skeleton height="14px" width="100px" mb={4} />
        <Grid
          templateColumns={{
            base: '1fr',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          }}
          gap={6}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Card.Root key={i} bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <VStack align="start" gap={2}>
                  <Skeleton height="20px" width="80%" />
                  <Skeleton height="14px" width="60%" />
                </VStack>
              </Card.Header>
              <Card.Body pt={2}>
                <VStack align="stretch" gap={3}>
                  {/* Stats */}
                  <HStack justify="space-between">
                    <VStack align="start" gap={1}>
                      <Skeleton height="32px" width="60px" />
                      <Skeleton height="12px" width="40px" />
                    </VStack>
                    <VStack align="end" gap={1}>
                      <Skeleton height="12px" width="50px" />
                      <Skeleton height="12px" width="70px" />
                    </VStack>
                  </HStack>

                  {/* Filter badges */}
                  <HStack gap={2}>
                    <Skeleton height="20px" width="60px" />
                    <Skeleton height="20px" width="70px" />
                  </HStack>

                  {/* Action buttons */}
                  <HStack gap={2} pt={2}>
                    <Skeleton height="32px" flex={1} />
                    <Skeleton height="32px" flex={1} />
                    <Skeleton height="32px" flex={1} />
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </Box>
    </VStack>
  );
}
