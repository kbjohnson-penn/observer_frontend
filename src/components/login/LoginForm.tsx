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
  Link as ChakraLink,
  Field,
} from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(usernameOrEmail, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
                  Sign In
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Access your Observer account
                </Text>
              </VStack>
            </VStack>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                {error && (
                  <Alert.Root status="error" borderRadius="md">
                    <Alert.Title>{error}</Alert.Title>
                  </Alert.Root>
                )}

                <Field.Root required width="100%">
                  <Field.Label>
                    Username or Email <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Enter your username or email"
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

                <Field.Root required width="100%">
                  <Field.Label>
                    Password <Field.RequiredIndicator />
                  </Field.Label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                  disabled={isLoading}
                  _hover={{ bg: 'blue.700' }}
                  _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Box textAlign="center" pt={4}>
                  <Text color="gray.600" fontSize="sm">
                    Don&apos;t have an account?{' '}
                    <ChakraLink
                      as={Link}
                      href="/register"
                      color="blue.600"
                      fontWeight="medium"
                      _hover={{ color: 'blue.700' }}
                    >
                      Register here
                    </ChakraLink>
                  </Text>
                </Box>
              </VStack>
            </form>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}
