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
  HStack,
  Stat,
  Alert,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

interface DashboardStats {
  totalPatients: number;
  totalEncounters: number;
  totalFiles: number;
  totalProviders: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch data from private endpoints
        const [patientsRes, encountersRes, providersRes, filesRes] = await Promise.all([
          apiClient.get("/private/patients/"),
          apiClient.get("/private/encounters/"),
          apiClient.get("/private/providers/"),
          apiClient.get("/private/encounterfiles/"),
        ]);

        setStats({
          totalPatients: patientsRes.data?.results?.length || patientsRes.data?.length || 0,
          totalEncounters: encountersRes.data?.results?.length || encountersRes.data?.length || 0,
          totalProviders: providersRes.data?.results?.length || providersRes.data?.length || 0,
          totalFiles: filesRes.data?.results?.length || filesRes.data?.length || 0,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading dashboard...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="gray.900">Dashboard</Heading>
          <Text color="gray.600">Dataset repository overview</Text>
        </Box>
    
        {/* Error Alert */}
        {error && (
          <Alert.Root status="error">
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}

        {/* Stats Cards */}
        {stats && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label color="gray.600">Total Patients</Stat.Label>
                  <Stat.ValueText fontSize="3xl" fontWeight="bold" color="blue.500">
                    {stats.totalPatients}
                  </Stat.ValueText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label color="gray.600">Total Encounters</Stat.Label>
                  <Stat.ValueText fontSize="3xl" fontWeight="bold" color="green.500">
                    {stats.totalEncounters}
                  </Stat.ValueText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label color="gray.600">Total Providers</Stat.Label>
                  <Stat.ValueText fontSize="3xl" fontWeight="bold" color="purple.500">
                    {stats.totalProviders}
                  </Stat.ValueText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>

            <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Body>
                <Stat.Root>
                  <Stat.Label color="gray.600">Total Files</Stat.Label>
                  <Stat.ValueText fontSize="3xl" fontWeight="bold" color="orange.500">
                    {stats.totalFiles}
                  </Stat.ValueText>
                </Stat.Root>
              </Card.Body>
            </Card.Root>
          </Grid>
        )}

        {/* Quick Actions */}
        <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
          <Card.Header>
            <Heading size="md" color="gray.900">Quick Actions</Heading>
          </Card.Header>
          <Card.Body>
            <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
              <Button colorScheme="blue" variant="outline">
                View Patients
              </Button>
              <Button colorScheme="green" variant="outline">
                View Encounters
              </Button>
              <Button colorScheme="purple" variant="outline">
                View Files
              </Button>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Recent Activity */}
        <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
          <Card.Header>
            <Heading size="md" color="gray.900">Recent Activity</Heading>
          </Card.Header>
          <Card.Body>
            <Text color="gray.600">
              Recent activity will appear here. This is a secure, authenticated dashboard
              showing dataset repository data from the Observer platform.
            </Text>
          </Card.Body>
        </Card.Root>
        </VStack>
    </Container>
  );
}