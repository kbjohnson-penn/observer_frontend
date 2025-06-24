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
  Table,
  Badge,
} from "@chakra-ui/react";
import { apiClient } from "@/lib/apiClient";
import { Encounter, EncounterListResponse } from "@/interfaces/encounter";

interface DashboardStats {
  totalPatients: number;
  totalEncounters: number;
  totalFiles: number;
  totalProviders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [providers, setProviders] = useState<Record<number, any>>({});
  const [patients, setPatients] = useState<Record<number, any>>({});
  const [departments, setDepartments] = useState<Record<number, any>>({});
  const [encounterSources, setEncounterSources] = useState<Record<number, any>>({});
  const [encounterFiles, setEncounterFiles] = useState<Record<number, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [encountersPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch data from private endpoints
        const [patientsRes, encountersRes, providersRes, filesRes, departmentsRes, encounterSourcesRes] = await Promise.all([
          apiClient.get("/private/patients/"),
          apiClient.get<EncounterListResponse>("/private/encounters/"),
          apiClient.get("/private/providers/"),
          apiClient.get("/private/encounterfiles/"),
          apiClient.get("/public/departments/"),
          apiClient.get("/public/encountersources/"),
        ]);

        const encountersData = encountersRes.data?.results || encountersRes.data || [];
        setEncounters(encountersData);

        // Create lookup maps for full data objects
        const providersData = providersRes.data?.results || providersRes.data || [];
        const patientsData = patientsRes.data?.results || patientsRes.data || [];
        const departmentsData = departmentsRes.data?.results || departmentsRes.data || [];
        const sourcesData = encounterSourcesRes.data?.results || encounterSourcesRes.data || [];
        const filesData = filesRes.data?.results || filesRes.data || [];

        // Store full objects for rich lookups
        const providersMap = providersData.reduce((acc: Record<number, any>, provider: any) => {
          acc[provider.id] = provider;
          return acc;
        }, {});

        const patientsMap = patientsData.reduce((acc: Record<number, any>, patient: any) => {
          acc[patient.id] = patient;
          return acc;
        }, {});

        // Departments and sources don't have id field, use index-based mapping
        const departmentsMap = departmentsData.reduce((acc: Record<number, any>, dept: any, index: number) => {
          acc[index + 1] = dept; // Assuming 1-based indexing
          return acc;
        }, {});

        const sourcesMap = sourcesData.reduce((acc: Record<number, any>, source: any, index: number) => {
          acc[index + 1] = source; // Assuming 1-based indexing
          return acc;
        }, {});

        const filesMap = filesData.reduce((acc: Record<number, any>, file: any) => {
          acc[file.id] = file;
          return acc;
        }, {});

        setProviders(providersMap);
        setPatients(patientsMap);
        setDepartments(departmentsMap);
        setEncounterSources(sourcesMap);
        setEncounterFiles(filesMap);

        setStats({
          totalPatients: patientsData.length,
          totalEncounters: encountersData.length,
          totalProviders: providersData.length,
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


  const handleEncounterClick = (encounterId: number) => {
    // For now, just log the encounter ID
    // In a real app, this would navigate to encounter detail page
    console.log(`Clicked encounter ID: ${encounterId}`);
    // TODO: Navigate to encounter detail page
    // router.push(`/encounters/${encounterId}`);
  };

  // Calculate pagination
  const totalPages = Math.ceil(encounters.length / encountersPerPage);
  const startIndex = (currentPage - 1) * encountersPerPage;
  const endIndex = startIndex + encountersPerPage;
  const currentEncounters = encounters.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

        {/* Encounters List */}
        <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
          <Card.Header>
            <HStack justify="space-between">
              <Heading size="md" color="gray.900">Encounters</Heading>
              <Text color="gray.600" fontSize="sm">
                Showing {startIndex + 1}-{Math.min(endIndex, encounters.length)} of {encounters.length} encounters
              </Text>
            </HStack>
          </Card.Header>
          <Card.Body>
            {encounters.length > 0 ? (
              <Box overflowX="auto">
                <Table.Root size="sm" variant="outline">
                  <Table.Header bg="gray.50">
                    <Table.Row>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Case ID</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Patient</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Provider</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Department</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Date</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Status</Table.ColumnHeader>
                      <Table.ColumnHeader color="gray.700" fontWeight="semibold">Files</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {currentEncounters.map((encounter) => (
                      <Table.Row 
                        key={encounter.id}
                        cursor="pointer"
                        bg="white"
                        _hover={{ bg: "gray.50" }}
                        onClick={() => handleEncounterClick(encounter.id)}
                      >
                        <Table.Cell>
                          <Text fontWeight="medium" color="blue.600">
                            {encounter.case_id}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <VStack align="start" gap={1}>
                            <Text color="gray.900" fontWeight="medium">
                              Patient {patients[encounter.patient]?.patient_id || encounter.patient}
                            </Text>
                            {patients[encounter.patient] && (
                              <Text color="gray.500" fontSize="xs">
                                {patients[encounter.patient].sex} • Born {patients[encounter.patient].year_of_birth}
                              </Text>
                            )}
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          <VStack align="start" gap={1}>
                            <Text color="gray.900" fontWeight="medium">
                              Provider {providers[encounter.provider]?.provider_id || encounter.provider}
                            </Text>
                            {providers[encounter.provider] && (
                              <Text color="gray.500" fontSize="xs">
                                {providers[encounter.provider].sex} • Born {providers[encounter.provider].year_of_birth}
                              </Text>
                            )}
                          </VStack>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="gray.900">
                            {departments[encounter.department]?.name || `Department ${encounter.department}`}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="sm" color="gray.700">
                            {new Date(encounter.encounter_date_and_time).toLocaleDateString()}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <HStack gap={1}>
                            {encounter.is_deidentified && (
                              <Badge bg="green.100" color="green.700" size="sm">De-ID</Badge>
                            )}
                            {encounter.is_restricted && (
                              <Badge bg="red.100" color="red.700" size="sm">Restricted</Badge>
                            )}
                            {!encounter.is_deidentified && !encounter.is_restricted && (
                              <Badge bg="gray.100" color="gray.700" size="sm">Open Data</Badge>
                            )}
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>
                          <VStack align="start" gap={1}>
                            <Text fontSize="sm" color="gray.700" fontWeight="medium">
                              {encounter.encounterfile_ids?.length || 0} files
                            </Text>
                            {encounter.encounterfile_ids?.length > 0 && (
                              <Text fontSize="xs" color="gray.500">
                                {(() => {
                                  const fileTypes = encounter.encounterfile_ids
                                    .map(id => encounterFiles[id]?.file_type)
                                    .filter(Boolean);
                                  const uniqueTypes = Array.from(new Set(fileTypes));
                                  return uniqueTypes.slice(0, 3).join(', ') + (uniqueTypes.length > 3 ? '...' : '');
                                })()}
                              </Text>
                            )}
                          </VStack>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <HStack justify="space-between" mt={4} align="center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <HStack gap={2}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 2
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <Text color="gray.400">...</Text>
                            )}
                            <Button
                              size="sm"
                              variant={currentPage === page ? "solid" : "outline"}
                              bg={currentPage === page ? "blue.500" : "white"}
                              color={currentPage === page ? "white" : "gray.700"}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                    </HStack>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </HStack>
                )}
              </Box>
            ) : (
              <VStack gap={4} py={8}>
                <Text color="gray.600" textAlign="center">
                  No encounters found. Data will appear here when encounters are available.
                </Text>
                {error && (
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    Error: {error}
                  </Text>
                )}
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Check browser console for API response details.
                </Text>
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
        </VStack>
    </Container>
  );
}