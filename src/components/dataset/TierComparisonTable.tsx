'use client';

import React, { memo, useMemo } from 'react';
import { Box, Card, Heading, HStack, Table, Text, VStack } from '@chakra-ui/react';
import { FaCheck } from 'react-icons/fa';
import { TIER_INFO } from '@/constants/tierInfo';
import COLORS from '@/constants/colors';

const TierComparisonTable = memo(function TierComparisonTable() {
  // Get all unique features across all tiers (memoized since TIER_INFO is constant)
  const allFeatures = useMemo(
    () =>
      Array.from(
        new Set(Object.values(TIER_INFO).flatMap((tier) => tier.features.map((f) => f.name)))
      ),
    []
  );

  return (
    <Box
      id="data-access-tiers"
      mb={16}
      py={12}
      bg="white"
      borderRadius="xl"
      border="1px"
      borderColor="gray.200"
    >
      <Heading size="2xl" mb={6} color="blue.700" textAlign="center" fontWeight="bold">
        Data Access Tiers
      </Heading>

      <Text color="gray.600" mb={8} fontSize="lg" textAlign="center" maxW="5xl" mx="auto">
        Observer dataset is organized into four data access tiers based on privacy and
        deidentification levels.
      </Text>

      <Box maxW="6xl" mx="auto" px={8}>
        <Card.Root bg="white" border="1px" borderColor="gray.200">
          <Card.Body p={0}>
            <Box overflowX="auto">
              <Table.Root size="sm" variant="outline">
                <Table.Header bg="gray.50">
                  <Table.Row>
                    <Table.ColumnHeader
                      position="sticky"
                      left={0}
                      bg="gray.50"
                      zIndex={1}
                      minW="200px"
                    >
                      <Text fontWeight="semibold" color="gray.700">
                        Feature
                      </Text>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">
                      <VStack gap={0}>
                        <Text fontWeight="semibold" color={COLORS.tierText[1]}>
                          Tier 1
                        </Text>
                      </VStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">
                      <VStack gap={0}>
                        <Text fontWeight="semibold" color={COLORS.tierText[2]}>
                          Tier 2
                        </Text>
                      </VStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">
                      <VStack gap={0}>
                        <Text fontWeight="semibold" color={COLORS.tierText[3]}>
                          Tier 3
                        </Text>
                      </VStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">
                      <VStack gap={0}>
                        <Text fontWeight="semibold" color={COLORS.tierText[4]}>
                          Tier 4
                        </Text>
                      </VStack>
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {allFeatures.map((featureName) => (
                    <Table.Row key={featureName} _hover={{ bg: COLORS.table.rowHoverBg }}>
                      <Table.Cell
                        position="sticky"
                        left={0}
                        bg="white"
                        _hover={{ bg: COLORS.table.rowHoverBg }}
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {featureName}
                      </Table.Cell>
                      {([1, 2, 3, 4] as const).map((tierNum) => {
                        const tier = TIER_INFO[tierNum];
                        const feature = tier.features.find((f) => f.name === featureName);
                        const isEnabled = feature?.enabled ?? false;

                        return (
                          <Table.Cell key={tierNum} textAlign="center">
                            {isEnabled ? (
                              <HStack justify="center" color="green.600">
                                <FaCheck size={16} />
                              </HStack>
                            ) : (
                              <Text color="gray.300" fontSize="lg">
                                •
                              </Text>
                            )}
                          </Table.Cell>
                        );
                      })}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
        </Card.Root>
      </Box>
    </Box>
  );
});

export default TierComparisonTable;
