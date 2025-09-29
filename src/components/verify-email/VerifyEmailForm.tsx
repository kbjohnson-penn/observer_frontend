"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Container,
  Text,
  VStack,
  Alert,
  Spinner,
  HStack,
  Link as ChakraLink,
  Field,
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
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

    // Validate passwords before sending to backend
    const validationErrors: VerificationErrors = {};

    if (formData.password.length < 8) {
      validationErrors.password = ['Password must be at least 8 characters long'];
    }

    if (formData.password !== formData.password_confirm) {
      validationErrors.password_confirm = ['Passwords do not match'];
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/auth/verify-email/`, {
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
    <Box bg="gray.50" py={10}>
      <Container maxW="xl">
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
              <VStack gap={4} mb={6}>
                <Alert.Root status="success" borderRadius="md">
                  <Alert.Title>{successMessage}</Alert.Title>
                </Alert.Root>
                
                <Box border="1px" borderRadius="md" p={4}>
                  <VStack align="start" gap={3}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Redirecting to login page...
                    </Text>
                    <HStack>
                      <Spinner size="sm" />
                      <ChakraLink
                        as={Link}
                        href="/login"
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        Or click here to login now
                      </ChakraLink>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            )}

            {!successMessage && !generalError && (
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  <Field.Root required invalid={!!errors.password} width="100%">
                    <Field.Label>
                      Password <Field.RequiredIndicator />
                    </Field.Label>
                    <PasswordInput
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter your password"
                      size="sm"
                      variant="outline"
                      border="1px solid"
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      p={2}
                      _focus={{ borderColor: "blue.500" }}
                      _hover={{ borderColor: "gray.400" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <Field.ErrorText>
                      {errors.password?.[0]}
                    </Field.ErrorText>
                    <Field.HelperText>
                      Password must be at least 12 characters long
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root required invalid={!!errors.password_confirm} width="100%">
                    <Field.Label>
                      Confirm Password <Field.RequiredIndicator />
                    </Field.Label>
                    <PasswordInput
                      value={formData.password_confirm}
                      onChange={(e) => handleInputChange("password_confirm", e.target.value)}
                      placeholder="Confirm your password"
                      size="sm"
                      variant="outline"
                      border="1px solid"
                      bg="white"
                      borderColor="gray.300"
                      color="gray.900"
                      p={2}
                      _focus={{ borderColor: "blue.500" }}
                      _hover={{ borderColor: "gray.400" }}
                      _placeholder={{ color: "gray.400" }}
                    />
                    <Field.ErrorText>
                      {errors.password_confirm?.[0]}
                    </Field.ErrorText>
                  </Field.Root>
                  
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
              <VStack gap={4} mb={6}>
                <Alert.Root status="error" borderRadius="md">
                  <Alert.Title>{generalError}</Alert.Title>
                </Alert.Root>
                
                <Box border="1px" borderRadius="md" p={4}>
                  <VStack align="start" gap={3}>
                    <Text fontSize="sm">
                      Please check your email for a valid verification link, or contact support if you continue to have issues.
                    </Text>
                    <ChakraLink
                      as={Link}
                      href="/register"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Need to register again?
                    </ChakraLink>
                  </VStack>
                </Box>
              </VStack>
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