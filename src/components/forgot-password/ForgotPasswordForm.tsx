'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Input,
  Text,
  VStack,
  Alert,
  Link as ChakraLink,
  Field,
} from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1'}/accounts/auth/password-reset/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.detail ||
            'If an account exists with this email, you will receive a password reset link.'
        );
        setEmail('');
      } else {
        if (data.errors?.email) {
          setError(data.errors.email[0]);
        } else {
          setError(data.detail || 'Failed to process request. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
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
                  Forgot Password
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Enter your email address and we&apos;ll send you a link to reset your password
                </Text>
              </VStack>
            </VStack>
          </Card.Header>

          <Card.Body>
            {successMessage ? (
              <VStack gap={4}>
                <Alert.Root status="success" borderRadius="md">
                  <Alert.Title>{successMessage}</Alert.Title>
                </Alert.Root>

                <Box border="1px" borderRadius="md" p={4} borderColor="gray.200">
                  <VStack align="start" gap={3}>
                    <Text fontSize="sm">
                      Check your email for a password reset link. The link will expire in 1 hour.
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Didn&apos;t receive the email? Check your spam folder or{' '}
                      <ChakraLink
                        as="button"
                        onClick={() => setSuccessMessage('')}
                        color="blue.600"
                        fontWeight="medium"
                        _hover={{ color: 'blue.700' }}
                      >
                        try again
                      </ChakraLink>
                    </Text>
                  </VStack>
                </Box>

                <Box textAlign="center" pt={4}>
                  <ChakraLink
                    as={Link}
                    href="/login"
                    color="blue.600"
                    fontWeight="medium"
                    _hover={{ color: 'blue.700' }}
                  >
                    Back to Sign In
                  </ChakraLink>
                </Box>
              </VStack>
            ) : (
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  {error && (
                    <Alert.Root status="error" borderRadius="md">
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Root>
                  )}

                  <Field.Root required width="100%">
                    <Field.Label>
                      Email Address <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      size="sm"
                      variant="outline"
                      border="1px solid"
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      p={2}
                      _focus={{ borderColor: 'blue.500' }}
                      _hover={{ borderColor: 'gray.400' }}
                      _placeholder={{ color: 'gray.400' }}
                    />
                  </Field.Root>

                  <Button
                    type="submit"
                    bg="blue.600"
                    color="white"
                    size="lg"
                    width="100%"
                    disabled={isLoading || !email}
                    _hover={{ bg: 'blue.700' }}
                    _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Box textAlign="center" pt={4}>
                    <Text color="gray.600" fontSize="sm">
                      Remember your password?{' '}
                      <ChakraLink
                        as={Link}
                        href="/login"
                        color="blue.600"
                        fontWeight="medium"
                        _hover={{ color: 'blue.700' }}
                      >
                        Sign In
                      </ChakraLink>
                    </Text>
                  </Box>
                </VStack>
              </form>
            )}
          </Card.Body>
        </Card.Root>

        <Box mt={6} textAlign="center">
          <Text color="gray.500" fontSize="xs">
            Having trouble? Contact support for assistance.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
