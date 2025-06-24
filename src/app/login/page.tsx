"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Container,
  Input,
  Text,
  VStack,
  Alert,
} from "@chakra-ui/react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="gray.50" py={16}>
      <Container maxW="md">
        <Card.Root bg="white" shadow="lg" borderRadius="lg" border="1px" borderColor="gray.200" color="gray.900">
        <Card.Header>
          <VStack gap={4}>
            <Image
              src="/ObserverLogoLightBackground.svg"
              width={200}
              height={50}
              alt="Observer Project"
              priority
            />
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              Sign In
            </Text>
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
              
              <Box width="100%">
                <Text mb={2} color="gray.700">Username</Text>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "blue.400", bg: "white" }}
                  padding={2}
                  required
                />
              </Box>
              
              <Box width="100%">
                <Text mb={2} color="gray.700">Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  color="gray.900"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "blue.400", bg: "white" }}
                  padding={2}
                  required
                />
              </Box>
              
              <Button
                type="submit"
                bg="blue.600"
                color="white"
                size="lg"
                width="100%"
                disabled={isLoading}
                _hover={{ bg: "blue.700" }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </VStack>
          </form>
        </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}