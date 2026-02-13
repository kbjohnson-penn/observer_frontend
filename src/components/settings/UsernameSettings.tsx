'use client';

import React from 'react';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';

// Display field for read-only values
interface DisplayFieldProps {
  label: string;
  value: string;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value }) => (
  <HStack align="flex-start" gap={2}>
    <Box minW="160px" pt={2}>
      <Text color="gray.700" fontWeight="medium" fontSize="md">
        {label}
      </Text>
    </Box>
    <Box flex={1}>
      <Box
        p={2}
        bg="gray.50"
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        color="gray.700"
        fontFamily="mono"
        fontSize="sm"
        fontWeight="medium"
        minH="8"
        display="flex"
        alignItems="center"
      >
        {value}
      </Box>
    </Box>
  </HStack>
);

export default function UsernameSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const currentUsername = user?.username || '';

  // Show loading state during auth loading
  if (authLoading) {
    return (
      <Box>
        <Text color="gray.600">Loading username settings...</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* SettingsLayout provides the header */}

      <VStack gap={4} align="stretch">
        {/* Username Management Section */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
            Username Management
          </Text>

          <VStack gap={1} align="stretch">
            {/* Current Username - Read-only display */}
            <DisplayField label="Username" value={currentUsername} />
          </VStack>

          <Text fontSize="xs" color="gray.500" mt={2}>
            Username changes are currently disabled. Contact support if you need to change your
            username.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
