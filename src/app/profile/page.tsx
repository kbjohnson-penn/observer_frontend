"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Grid,
  Card,
  Text,
  Button,
  VStack,
  Alert,
  Separator,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

interface UserProfile {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  date_of_birth: string;
  phone_number: string | null;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  bio: string | null;
  organization: {
    id: number;
    name: string;
  } | null;
  tier: {
    id: number;
    tier_name: string;
    level: number;
  } | null;
  date_joined: string;
  last_login: string | null;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch user profile data
        const response = await apiClient.get("/profile/");
        setProfile(response.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text color="gray.600">Loading profile...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.900">Profile</Heading>
          <Text color="gray.600">View your account information</Text>
        </Box>


        {/* Error Alert */}
        {error && (
          <Alert.Root status="error">
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        {/* Profile Information */}
        {profile && (
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
            {/* Main Profile Card */}
            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <Heading size="md" color="gray.900">Personal Information</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">First Name</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.first_name || "Not provided"}
                      </Text>
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Last Name</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.last_name || "Not provided"}
                      </Text>
                    </Box>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Username</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.username}
                      </Text>
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Email</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.email}
                      </Text>
                    </Box>
                  </Grid>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Date of Birth</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : "Not provided"}
                      </Text>
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Phone Number</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.phone_number || "Not provided"}
                      </Text>
                    </Box>
                  </Grid>

                  <Box>
                    <Text mb={2} color="gray.700" fontWeight="medium">Address</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {profile.address || "Not provided"}
                    </Text>
                  </Box>

                  <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">City</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.city || "Not provided"}
                      </Text>
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">State</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.state || "Not provided"}
                      </Text>
                    </Box>

                    <Box>
                      <Text mb={2} color="gray.700" fontWeight="medium">Zip Code</Text>
                      <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                        {profile.zip_code || "Not provided"}
                      </Text>
                    </Box>
                  </Grid>

                  <Box>
                    <Text mb={2} color="gray.700" fontWeight="medium">Country</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {profile.country || "Not provided"}
                    </Text>
                  </Box>

                  <Box>
                    <Text mb={2} color="gray.700" fontWeight="medium">Bio</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md" minHeight="100px">
                      {profile.bio || "Not provided"}
                    </Text>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Account Details */}
            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <Heading size="md" color="gray.900">Account Details</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Box>
                    <Text color="gray.700" fontWeight="medium" mb={2}>Organization</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {profile.organization?.name || "Not assigned"}
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text color="gray.700" fontWeight="medium" mb={2}>Access Tier</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {profile.tier ? `${profile.tier.tier_name} (Level ${profile.tier.level})` : "Not assigned"}
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text color="gray.700" fontWeight="medium" mb={2}>Member Since</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {new Date(profile.date_joined).toLocaleDateString()}
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text color="gray.700" fontWeight="medium" mb={2}>Last Login</Text>
                    <Text color="gray.900" bg="gray.50" p={3} borderRadius="md">
                      {profile.last_login 
                        ? new Date(profile.last_login).toLocaleString()
                        : "Never"
                      }
                    </Text>
                  </Box>

                  <Separator />

                  <Box>
                    <Text color="gray.600" fontSize="sm" mb={4}>
                      Profile information is read-only. Contact an administrator to make changes.
                    </Text>
                    
                    <Button
                      bg="red.600"
                      color="white"
                      size="lg"
                      width="100%"
                      onClick={handleLogout}
                      _hover={{ bg: "red.700" }}
                    >
                      Sign Out
                    </Button>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Grid>
        )}
      </VStack>
    </Container>
  );
}