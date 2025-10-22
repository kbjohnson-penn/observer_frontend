'use client';

import React from 'react';
import { Box, VStack, HStack, Flex, Stack, Skeleton, Card } from '@chakra-ui/react';

export default function LoadingSkeleton() {
  return (
    <VStack gap={6} align="stretch">
      <Flex gap={6}>
        {/* Filter Sidebar Skeleton */}
        <Box
          w="300px"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={4}
          display={{ base: 'none', lg: 'block' }}
        >
          <Stack gap={4}>
            <Skeleton height="20px" width="100px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="80px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </Stack>
        </Box>

        {/* Table Skeleton */}
        <Box flex={1}>
          <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
            <Card.Header>
              <Skeleton height="24px" width="200px" />
            </Card.Header>
            <Card.Body>
              <Stack gap={2}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <HStack key={i} gap={4}>
                    <Skeleton height="40px" width="80px" />
                    <Skeleton height="40px" width="120px" />
                    <Skeleton height="40px" width="100px" />
                    <Skeleton height="40px" width="80px" />
                    <Skeleton height="40px" flex="1" />
                    <Skeleton height="40px" flex="1" />
                  </HStack>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>
    </VStack>
  );
}
