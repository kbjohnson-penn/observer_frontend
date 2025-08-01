"use client";

import React, { useState } from "react";
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
  Spinner,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

interface VerificationForm {
  token: string;
  password: string;
  password_confirm: string;
}

interface VerificationErrors {
  token?: string[];
  password?: string[];
  password_confirm?: string[];
  non_field_errors?: string[];
}

interface VerifyEmailFormProps {
  token: string | null;
}

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<VerificationForm>({
    token: token || "",
    password: "",
    password_confirm: "",
  });
  const [errors, setErrors] = useState<VerificationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState(!token ? "Invalid verification link. Please check your email for the correct link." : "");

  const handleInputChange = (field: keyof VerificationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.detail || "Email verified successfully! You can now log in.");
        // Clear form
        setFormData(prev => ({
          ...prev,
          password: "",
          password_confirm: "",
        }));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(data.detail || "Email verification failed. Please try again.");
        }
      }
    } catch (err) {
      setGeneralError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg="gray.50" py={16} minHeight="100vh">
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
              <VStack gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900">
                  Verify Your Email
                </Text>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Set up your password to complete account activation
                </Text>
              </VStack>
            </VStack>
          </Card.Header>
          
          <Card.Body>
            {successMessage && (
              <Alert.Root status="success" borderRadius="md" mb={6}>
                <Alert.Title>{successMessage}</Alert.Title>
                <Box mt={2}>
                  <Text fontSize="sm" color="green.700">
                    Redirecting you to the login page...
                  </Text>
                  <HStack mt={2}>
                    <Spinner size="sm" color="green.500" />
                    <Link href="/login">
                      <ChakraLink color="green.600" fontSize="sm" fontWeight="medium">
                        Or click here to login now
                      </ChakraLink>
                    </Link>
                  </HStack>
                </Box>
              </Alert.Root>
            )}

            {!successMessage && !generalError && (
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  <Box width="100%">
                    <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                      Password *
                    </Text>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter your password"
                      bg="gray.50"
                      border="1px"
                      borderColor={errors.password ? "red.300" : "gray.200"}
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: errors.password ? "red.400" : "blue.400", bg: "white" }}
                      required
                    />
                    {errors.password && (
                      <VStack align="start" mt={1} gap={1}>
                        {errors.password.map((error, index) => (
                          <Text key={index} color="red.500" fontSize="xs">
                            {error}
                          </Text>
                        ))}
                      </VStack>
                    )}
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      Password must be at least 12 characters long
                    </Text>
                  </Box>

                  <Box width="100%">
                    <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                      Confirm Password *
                    </Text>
                    <Input
                      type="password"
                      value={formData.password_confirm}
                      onChange={(e) => handleInputChange("password_confirm", e.target.value)}
                      placeholder="Confirm your password"
                      bg="gray.50"
                      border="1px"
                      borderColor={errors.password_confirm ? "red.300" : "gray.200"}
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: errors.password_confirm ? "red.400" : "blue.400", bg: "white" }}
                      required
                    />
                    {errors.password_confirm && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        {errors.password_confirm[0]}
                      </Text>
                    )}
                  </Box>
                  
                  <Button
                    type="submit"
                    bg="blue.600"
                    color="white"
                    size="lg"
                    width="100%"
                    disabled={isLoading || !formData.token}
                    _hover={{ bg: "blue.700" }}
                    _disabled={{ bg: "gray.400", cursor: "not-allowed" }}
                  >
                    {isLoading ? "Verifying..." : "Verify Email & Set Password"}
                  </Button>
                </VStack>
              </form>
            )}

            {generalError && (
              <Alert.Root status="error" borderRadius="md">
                <Alert.Title>{generalError}</Alert.Title>
                <Box mt={2}>
                  <Text fontSize="sm" color="red.700">
                    Please check your email for a valid verification link, or contact support if you continue to have issues.
                  </Text>
                  <Box mt={3}>
                    <Link href="/register">
                      <ChakraLink color="red.600" fontSize="sm" fontWeight="medium">
                        Need to register again?
                      </ChakraLink>
                    </Link>
                  </Box>
                </Box>
              </Alert.Root>
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