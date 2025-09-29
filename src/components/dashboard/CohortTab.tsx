"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  IconButton,
  Alert,
} from "@chakra-ui/react";
import { FaTrash, FaEye, FaDownload, FaCopy } from "react-icons/fa";

interface Cohort {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  visitCount: number;
  filters: any; // Will define this properly later
}

export default function CohortTab() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load cohorts from localStorage (temporary storage)
    const loadCohorts = () => {
      try {
        const savedCohorts = localStorage.getItem("research-cohorts");
        if (savedCohorts) {
          const parsed = JSON.parse(savedCohorts);
          setCohorts(parsed.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })));
        }
      } catch (error) {
        console.error("Failed to load cohorts:", error);
      }
    };

    loadCohorts();
  }, []);

  const handleDeleteCohort = (cohortId: string) => {
    const updatedCohorts = cohorts.filter(c => c.id !== cohortId);
    setCohorts(updatedCohorts);
    localStorage.setItem("research-cohorts", JSON.stringify(updatedCohorts));
  };

  const handleDuplicateCohort = (cohort: Cohort) => {
    const newCohort: Cohort = {
      ...cohort,
      id: Date.now().toString(),
      name: `${cohort.name} (Copy)`,
      createdAt: new Date(),
    };

    const updatedCohorts = [...cohorts, newCohort];
    setCohorts(updatedCohorts);
    localStorage.setItem("research-cohorts", JSON.stringify(updatedCohorts));
  };

  const handleViewCohort = (cohort: Cohort) => {
    // TODO: Navigate to cohort detail view or show modal
    console.log("View cohort:", cohort);
  };

  const handleExportCohort = (cohort: Cohort) => {
    // TODO: Export cohort data
    console.log("Export cohort:", cohort);
  };

  if (loading) {
    return (
      <Box py={8}>
        <Text>Loading cohorts...</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">Saved Cohorts</Text>
          <Text fontSize="sm" color="gray.600">
            Manage your research cohorts and export data
          </Text>
        </Box>
        <Button colorScheme="blue" disabled>
          Create New Cohort
        </Button>
      </HStack>

      {/* Cohorts Grid */}
      {cohorts.length > 0 ? (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {cohorts.map((cohort) => (
            <Card.Root key={cohort.id} bg="white" shadow="md" border="1px" borderColor="gray.200">
              <Card.Header>
                <HStack justify="space-between" align="start">
                  <VStack align="start" gap={1} flex={1}>
                    <Text fontWeight="semibold" fontSize="md" noOfLines={2}>
                      {cohort.name}
                    </Text>
                    {cohort.description && (
                      <Text fontSize="xs" color="gray.600" noOfLines={2}>
                        {cohort.description}
                      </Text>
                    )}
                  </VStack>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Delete cohort"
                    onClick={() => handleDeleteCohort(cohort.id)}
                  >
                    <FaTrash />
                  </IconButton>
                </HStack>
              </Card.Header>

              <Card.Body pt={2}>
                <VStack align="stretch" gap={3}>
                  {/* Cohort Stats */}
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                        {cohort.visitCount.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">visits</Text>
                    </VStack>
                    <VStack align="end" gap={0}>
                      <Text fontSize="xs" color="gray.600">Created</Text>
                      <Text fontSize="xs" color="gray.500">
                        {cohort.createdAt.toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Filter Summary */}
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>Applied Filters:</Text>
                    <HStack wrap="wrap" gap={1}>
                      <Badge size="sm" variant="subtle" colorScheme="blue">
                        Demographics
                      </Badge>
                      <Badge size="sm" variant="subtle" colorScheme="green">
                        Clinical
                      </Badge>
                      {/* Add more filter badges based on actual filters */}
                    </HStack>
                  </Box>

                  {/* Actions */}
                  <HStack gap={2} pt={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<FaEye />}
                      onClick={() => handleViewCohort(cohort)}
                      flex={1}
                    >
                      View
                    </Button>
                    <IconButton
                      size="sm"
                      variant="outline"
                      aria-label="Duplicate cohort"
                      onClick={() => handleDuplicateCohort(cohort)}
                    >
                      <FaCopy />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="outline"
                      aria-label="Export cohort"
                      onClick={() => handleExportCohort(cohort)}
                    >
                      <FaDownload />
                    </IconButton>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      ) : (
        <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
          <Card.Body>
            <VStack gap={4} py={8}>
              <Text color="gray.600" textAlign="center">
                No cohorts created yet
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Use the Research Data tab to create filters and save them as cohorts
              </Text>
              <Button colorScheme="blue" variant="outline" disabled>
                Go to Research Data
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Info Alert */}
      <Alert.Root status="info">
        <Alert.Title>
          Cohorts are currently stored locally. Future versions will sync with the server.
        </Alert.Title>
      </Alert.Root>
    </VStack>
  );
}