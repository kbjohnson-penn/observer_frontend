"use client";

import React, { useState } from "react";
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
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

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
  const [formData, setFormData] = useState<RegistrationForm>({
    email: "",
    first_name: "",
    last_name: "",
    organization_name: "",
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.detail || "Registration successful! Please check your email to verify your account.");
        // Clear form
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          organization_name: "",
        });
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setGeneralError(data.detail || "Registration failed. Please try again.");
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
              <Alert.Root status="success" borderRadius="md" mb={6}>
                <Alert.Title>{successMessage}</Alert.Title>
                <Box mt={2}>
                  <Text fontSize="sm" color="green.700">
                    You can close this page and check your email for the verification link.
                  </Text>
                </Box>
              </Alert.Root>
            )}

            {!successMessage && (
              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  {generalError && (
                    <Alert.Root status="error" borderRadius="md">
                      <Alert.Title>{generalError}</Alert.Title>
                    </Alert.Root>
                  )}
                  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} width="100%">
                    <Box>
                      <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                        First Name *
                      </Text>
                      <Input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        placeholder="Enter your first name"
                        bg="gray.50"
                        border="1px"
                        borderColor={errors.first_name ? "red.300" : "gray.200"}
                        color="gray.900"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: errors.first_name ? "red.400" : "blue.400", bg: "white" }}
                        required
                      />
                      {errors.first_name && (
                        <Text color="red.500" fontSize="xs" mt={1}>
                          {errors.first_name[0]}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                        Last Name *
                      </Text>
                      <Input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        placeholder="Enter your last name"
                        bg="gray.50"
                        border="1px"
                        borderColor={errors.last_name ? "red.300" : "gray.200"}
                        color="gray.900"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: errors.last_name ? "red.400" : "blue.400", bg: "white" }}
                        required
                      />
                      {errors.last_name && (
                        <Text color="red.500" fontSize="xs" mt={1}>
                          {errors.last_name[0]}
                        </Text>
                      )}
                    </Box>
                  </Grid>
                  
                  <Box width="100%">
                    <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                      Email Address *
                    </Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email address"
                      bg="gray.50"
                      border="1px"
                      borderColor={errors.email ? "red.300" : "gray.200"}
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: errors.email ? "red.400" : "blue.400", bg: "white" }}
                      required
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        {errors.email[0]}
                      </Text>
                    )}
                  </Box>

                  <Box width="100%">
                    <Text mb={2} color="gray.700" fontSize="sm" fontWeight="medium">
                      Organization
                    </Text>
                    <Input
                      type="text"
                      value={formData.organization_name}
                      onChange={(e) => handleInputChange("organization_name", e.target.value)}
                      placeholder="Enter your organization (optional)"
                      bg="gray.50"
                      border="1px"
                      borderColor={errors.organization_name ? "red.300" : "gray.200"}
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: errors.organization_name ? "red.400" : "blue.400", bg: "white" }}
                    />
                    {errors.organization_name && (
                      <Text color="red.500" fontSize="xs" mt={1}>
                        {errors.organization_name[0]}
                      </Text>
                    )}
                    <Text color="gray.500" fontSize="xs" mt={1}>
                      Your institutional affiliation (university, hospital, research center, etc.)
                    </Text>
                  </Box>
                  
                  <Button
                    type="submit"
                    bg="blue.600"
                    color="white"
                    size="lg"
                    width="100%"
                    disabled={isLoading}
                    _hover={{ bg: "blue.700" }}
                    _disabled={{ bg: "gray.400", cursor: "not-allowed" }}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>

                  <Box textAlign="center" pt={4}>
                    <Text color="gray.600" fontSize="sm">
                      Already have an account?{" "}
                      <Link href="/login">
                        <ChakraLink color="blue.600" fontWeight="medium" _hover={{ color: "blue.700" }}>
                          Sign in here
                        </ChakraLink>
                      </Link>
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
              By creating an account, you agree to Observer&apos;s terms of service and privacy policy.
            </Text>
          </Box>
        )}
      </Container>
    </Box>
  );
}