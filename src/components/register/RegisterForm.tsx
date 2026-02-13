'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Input,
  Text,
  VStack,
  Alert,
  Grid,
  Link as ChakraLink,
  Field,
} from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface RegistrationForm {
  email: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

interface RegistrationErrors {
  email?: string[];
  first_name?: string[];
  last_name?: string[];
  organization_name?: string[];
  non_field_errors?: string[];
}

export default function RegisterForm() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const [formData, setFormData] = useState<RegistrationForm>({
    email: '',
    first_name: '',
    last_name: '',
    organization_name: '',
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  // Get test domains only in development mode
  const getTestDomains = () => {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ALLOW_TEST_EMAILS === 'true'
    ) {
      return ['gmail.com', 'outlook.com', 'yahoo.com'];
    }
    return [];
  };

  // Allowed email domains for registration
  const allowedDomains = [
    'edu', // Educational institutions
    'ac.uk', // UK academic institutions
    'gov', // Government institutions
    'mil', // Military institutions
    ...getTestDomains(), // Test domains only in development
  ];

  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Check if domain or any parent domain is in the whitelist
    const isDomainAllowed = allowedDomains.some(
      (allowedDomain) => domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );

    if (!isDomainAllowed) {
      return {
        isValid: false,
        error: 'Please use an institutional email address (.edu, .gov, .ac.uk, etc.)',
      };
    }

    return { isValid: true };
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSuccessMessage('');
    setIsLoading(true);

    // Validate email before sending to backend
    const emailValidation = validateEmail(formData.email.trim());
    if (!emailValidation.isValid) {
      setErrors({ email: [emailValidation.error!] });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/accounts/auth/register/', formData);

      setSuccessMessage(
        response.data.detail ||
          'Registration successful! Please check your email to verify your account.'
      );
      // Clear form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        organization_name: '',
      });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.detail) {
        setGeneralError(err.response.data.detail);
      } else {
        setGeneralError(
          err.message || 'Network error. Please check your connection and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="gray.50" py={10}>
      <Container maxW="xl">
        <Card.Root
          bg="white"
          shadow="lg"
          borderRadius="lg"
          border="1px"
          borderColor="gray.200"
          color="gray.900"
        >
          <Card.Header>
            <VStack gap={4}>
              <Image
                src="/ObserverLogoLightBackground.svg"
                width={200}
                height={50}
                alt="Observer Project"
                priority
              />
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Create Account
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Join Observer to access healthcare research data
                </Text>
              </VStack>
            </VStack>
          </Card.Header>

          <Card.Body>
            {successMessage && (
              <VStack gap={4} mb={6}>
                <Alert.Root status="success" borderRadius="md">
                  <Alert.Title>{successMessage}</Alert.Title>
                </Alert.Root>

                <Box border="1px" borderRadius="md" p={4}>
                  <VStack align="start" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Next steps:
                    </Text>
                    <VStack align="start" gap={1} fontSize="sm">
                      <Text>• Check your email inbox for a verification link</Text>
                      <Text>• Check your spam/junk folder if you don&apos;t see it</Text>
                      <Text>• Make sure you entered your email correctly</Text>
                      <Text>• The verification link expires in 24 hours</Text>
                    </VStack>
                    <Text fontSize="xs" mt={2}>
                      If you don&apos;t receive the email after a few minutes, please try
                      registering again or contact support.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            )}

            {!successMessage && (
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  {generalError && (
                    <Alert.Root status="error" borderRadius="md">
                      <Alert.Title>{generalError}</Alert.Title>
                    </Alert.Root>
                  )}

                  <Grid
                    templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                    gap={4}
                    width="100%"
                  >
                    <Field.Root required invalid={!!errors.first_name}>
                      <Field.Label>
                        First Name <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Enter your first name"
                        size="sm"
                        variant="outline"
                        border="1px solid"
                        bg={'white'}
                        borderColor="gray.300"
                        color={'gray.900'}
                        p={2}
                        _focus={{ borderColor: 'blue.500' }}
                        _hover={{ borderColor: 'gray.400' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <Field.ErrorText>{errors.first_name?.[0]}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!errors.last_name}>
                      <Field.Label>
                        Last Name <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Enter your last name"
                        size="sm"
                        variant="outline"
                        border="1px solid"
                        bg={'white'}
                        borderColor="gray.300"
                        color={'gray.900'}
                        p={2}
                        _focus={{ borderColor: 'blue.500' }}
                        _hover={{ borderColor: 'gray.400' }}
                        _placeholder={{ color: 'gray.400' }}
                      />
                      <Field.ErrorText>{errors.last_name?.[0]}</Field.ErrorText>
                    </Field.Root>
                  </Grid>

                  <Field.Root required invalid={!!errors.email} width="100%">
                    <Field.Label>
                      Email Address <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      size="sm"
                      variant="outline"
                      border="1px solid"
                      bg={'white'}
                      borderColor="gray.300"
                      color={'gray.900'}
                      p={2}
                      _focus={{ borderColor: 'blue.500' }}
                      _hover={{ borderColor: 'gray.400' }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <Field.ErrorText>{errors.email?.[0]}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root required invalid={!!errors.organization_name} width="100%">
                    <Field.Label>
                      Organization <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="text"
                      value={formData.organization_name}
                      onChange={(e) => handleInputChange('organization_name', e.target.value)}
                      placeholder="Enter your organization"
                      size="sm"
                      variant="outline"
                      border="1px solid"
                      bg={'white'}
                      borderColor="gray.300"
                      color={'gray.900'}
                      p={2}
                      _focus={{ borderColor: 'blue.500' }}
                      _hover={{ borderColor: 'gray.400' }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                    <Field.ErrorText>{errors.organization_name?.[0]}</Field.ErrorText>
                    <Field.HelperText>
                      Your institutional affiliation (university, hospital, research center, etc.)
                    </Field.HelperText>
                  </Field.Root>

                  <Button
                    type="submit"
                    bg="blue.600"
                    color="white"
                    size="lg"
                    width="100%"
                    disabled={isLoading}
                    _hover={{ bg: 'blue.700' }}
                    _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <Box textAlign="center" pt={4}>
                    <Text color="gray.600" fontSize="sm">
                      Already have an account?{' '}
                      <ChakraLink
                        as={Link}
                        href="/login"
                        color="blue.600"
                        fontWeight="medium"
                        _hover={{ color: 'blue.700' }}
                      >
                        Sign in here
                      </ChakraLink>
                    </Text>
                  </Box>
                </VStack>
              </form>
            )}
          </Card.Body>
        </Card.Root>

        {!successMessage && (
          <Box mt={6} textAlign="center">
            <Text color="gray.500" fontSize="xs">
              By creating an account, you agree to Observer&apos;s terms of service and privacy
              policy.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}
