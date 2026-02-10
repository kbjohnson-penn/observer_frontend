'use client';

import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Alert } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

// Reusable password field component
interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <HStack align="flex-start" gap={2}>
    <Box minW="200px" pt={2}>
      <Text color="gray.700" fontWeight="medium" fontSize="md">
        {label}
      </Text>
    </Box>
    <Box flex={1}>
      <PasswordInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        size="sm"
        variant="outline"
        border="1px solid"
        borderColor="gray.300"
        _focus={{ borderColor: 'blue.500' }}
        color="gray.900"
        p={2}
        _hover={{ borderColor: 'gray.400' }}
        _placeholder={{ color: 'gray.400' }}
      />
    </Box>
  </HStack>
);

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function PasswordSettings() {
  const { logout } = useAuth();
  const [formData, setFormData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.new_password.length < 12) {
      setMessage({ type: 'error', text: 'Password must be at least 12 characters long' });
      setIsLoading(false);
      return;
    }

    // Password strength validation
    const hasUppercase = /[A-Z]/.test(formData.new_password);
    const hasLowercase = /[a-z]/.test(formData.new_password);
    const hasNumber = /\d/.test(formData.new_password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setMessage({
        type: 'error',
        text: 'Password must contain uppercase, lowercase, number, and special character',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/accounts/auth/change-password/', {
        old_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirm: formData.confirm_password,
      });

      setMessage({
        type: 'success',
        text:
          response.data.detail ||
          'Password updated successfully! You will be logged out in 3 seconds...',
      });
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      // Check if backend requires logout (for security after password change)
      if (response.data.logout_required) {
        // Wait 3 seconds to show the success message, then logout
        setTimeout(() => {
          logout();
        }, 3000);
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Failed to update password';

      // Handle different error formats from the API
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.old_password?.[0]) {
        errorMessage = errorData.old_password[0];
      } else if (errorData?.new_password?.[0]) {
        errorMessage = errorData.new_password[0];
      } else if (errorData?.new_password_confirm?.[0]) {
        errorMessage = errorData.new_password_confirm[0];
      } else if (err.message) {
        errorMessage = err.message;
      }

      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
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
          {/* Password Security Section */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={2}>
              Password Security
            </Text>

            <VStack gap={1} align="stretch">
              {/* Current Password */}
              <PasswordField
                label="Current Password"
                value={formData.current_password}
                onChange={(e) => handleInputChange('current_password', e.target.value)}
                placeholder="Enter your current password"
                required
              />

              {/* New Password */}
              <PasswordField
                label="New Password"
                value={formData.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                placeholder="Enter your new password"
                required
              />

              {/* Confirm New Password */}
              <PasswordField
                label="Confirm New Password"
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                placeholder="Confirm your new password"
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
              disabled={isLoading}
              _hover={{ bg: 'blue.700' }}
              _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
              fontWeight="semibold"
              fontSize="sm"
              h="9"
              minW="120px"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </VStack>
      </form>
    </Box>
  );
}
