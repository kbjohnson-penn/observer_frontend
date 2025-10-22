'use client';

import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Input, Text, Button, Alert } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';

// Reusable form field component for regular inputs
interface FormFieldProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
  required = false,
}) => (
  <HStack align="flex-start" gap={2}>
    <Box minW="160px" pt={2}>
      <Text color="gray.700" fontWeight="medium" fontSize="md">
        {label}
      </Text>
    </Box>
    <Box flex={1}>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        size="sm"
        variant="outline"
        border="1px solid"
        bg={readOnly ? 'gray.50' : 'white'}
        borderColor="gray.300"
        color={readOnly ? 'gray.600' : 'gray.900'}
        p={2}
        _focus={{ borderColor: readOnly ? 'gray.300' : 'blue.500' }}
        _hover={{ borderColor: readOnly ? 'gray.300' : 'gray.400' }}
        _placeholder={{ color: 'gray.400' }}
      />
    </Box>
  </HStack>
);

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
  const { user, isLoading: authLoading, refreshToken } = useAuth();
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Load current username when user data is available
  useEffect(() => {
    if (user?.username) {
      setCurrentUsername(user.username);
      setNewUsername(user.username);
    }
  }, [user]);

  // Show loading state during auth loading
  if (authLoading) {
    return (
      <Box>
        <Text color="gray.600">Loading username settings...</Text>
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername === currentUsername) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1'}/accounts/profile/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ username: newUsername }),
        }
      );

      if (response.ok) {
        setCurrentUsername(newUsername);
        setMessage({ type: 'success', text: 'Username updated successfully!' });
        // Refresh AuthContext user data to keep it in sync
        await refreshToken();
      } else {
        const errorData = await response.json();
        setMessage({
          type: 'error',
          text: errorData.username?.[0] || errorData.detail || 'Failed to update username',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred while updating your username',
      });
    }

    setIsLoading(false);
  };

  return (
    <Box>
      {/* SettingsLayout provides the header */}

      {message && (
        <Alert.Root
          status={message.type}
          mb={4}
          borderRadius="lg"
          border="1px"
          borderColor={message.type === 'success' ? 'green.200' : 'red.200'}
          bg={message.type === 'success' ? 'green.50' : 'red.50'}
        >
          <Alert.Title color={message.type === 'success' ? 'green.800' : 'red.800'}>
            {message.text}
          </Alert.Title>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={4} align="stretch">
          {/* Username Management Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
              Username Management
            </Text>

            <VStack gap={1} align="stretch">
              {/* Current Username */}
              <DisplayField label="Current Username" value={currentUsername} />

              {/* New Username */}
              <FormField
                label="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter your new username"
                required
              />
            </VStack>
          </Box>

          {/* Save Button */}
          <Box pt={3} borderTop="1px" borderColor="gray.200">
            <Button
              type="submit"
              bg="blue.600"
              color="white"
              size="md"
              px={6}
              borderRadius="md"
              disabled={isLoading || newUsername === currentUsername}
              _hover={{ bg: 'blue.700' }}
              _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
              fontWeight="semibold"
              fontSize="sm"
              h="9"
              minW="120px"
            >
              {isLoading ? 'Updating...' : 'Update Username'}
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
}
