"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
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
  Flex,
  Input,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { apiClient } from "@/lib/apiClient";

interface ResearchStats {
  totalPersons: number;
  totalVisits: number;
  totalProviders: number;
  totalObservations: number;
}

interface ResearchVisit {
  id: number;
  visit_start_date: string;
  visit_start_time: string;
  visit_source_value: string;
  visit_source_id: number;
  tier_id: number;
  person_id: number;
  provider_id: number;
}

type SortField = 'id' | 'visit_start_date' | 'visit_source_value' | 'tier_id';
type SortDirection = 'asc' | 'desc';

interface Filters {
  personId: string;
  providerId: string;
  visitSource: string;
  tier: string;
  dateFrom: string;
  dateTo: string;
}

const tierCollection = createListCollection({
  items: [
    { label: "Tier 1", value: "1" },
    { label: "Tier 2", value: "2" },
    { label: "Tier 3", value: "3" },
  ],
});

export default function ResearchTab() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [visits, setVisits] = useState<ResearchVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visitsPerPage] = useState(20);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Filters>({
    personId: '',
    providerId: '',
    visitSource: '',
    tier: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    const fetchResearchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch data from research endpoints
        const [personsRes, visitsRes, providersRes] = await Promise.all([
          apiClient.get("/research/private/persons/"),
          apiClient.get("/research/private/visits/"),
          apiClient.get("/research/private/providers/"),
        ]);

        const personsData = personsRes.data?.results || personsRes.data || [];
        const visitsData = visitsRes.data?.results || visitsRes.data || [];
        const providersData = providersRes.data?.results || providersRes.data || [];

        setVisits(visitsData);
        setStats({
          totalPersons: personsData.length,
          totalVisits: visitsData.length,
          totalProviders: providersData.length,
          totalObservations: 0, // TODO: Add observations endpoint
        });
      } catch (err) {
        setError("Failed to load research data");
        console.error("Research data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchData();
  }, []);

  // Sorting function
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Apply filters
  const filteredVisits = visits.filter((visit) => {
    if (filters.personId && !visit.person_id.toString().includes(filters.personId)) return false;
    if (filters.providerId && !visit.provider_id.toString().includes(filters.providerId)) return false;
    if (filters.visitSource && !visit.visit_source_value.toLowerCase().includes(filters.visitSource.toLowerCase())) return false;
    if (filters.tier && visit.tier_id.toString() !== filters.tier) return false;
    if (filters.dateFrom && visit.visit_start_date < filters.dateFrom) return false;
    if (filters.dateTo && visit.visit_start_date > filters.dateTo) return false;
    return true;
  });

  // Sort filtered visits
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'visit_start_date':
        aValue = new Date(`${a.visit_start_date}T${a.visit_start_time}`);
        bValue = new Date(`${b.visit_start_date}T${b.visit_start_time}`);
        break;
      case 'visit_source_value':
        aValue = a.visit_source_value.toLowerCase();
        bValue = b.visit_source_value.toLowerCase();
        break;
      case 'tier_id':
        aValue = a.tier_id;
        bValue = b.tier_id;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedVisits.length / visitsPerPage);
  const startIndex = (currentPage - 1) * visitsPerPage;
  const endIndex = startIndex + visitsPerPage;
  const currentVisits = sortedVisits.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      personId: '',
      providerId: '',
      visitSource: '',
      tier: '',
      dateFrom: '',
      dateTo: '',
    });
    setCurrentPage(1);
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FaSort color="gray" />;
    return sortDirection === 'asc' ? <FaSortUp color="blue" /> : <FaSortDown color="blue" />;
  };

  if (loading) {
    return (
      <Box py={8}>
        <Text>Loading research data...</Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
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
                <Stat.Label color="gray.600">Total Persons</Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="blue.500">
                  {stats.totalPersons}
                </Stat.ValueText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
            <Card.Body>
              <Stat.Root>
                <Stat.Label color="gray.600">Total Visits</Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="green.500">
                  {stats.totalVisits}
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
                <Stat.Label color="gray.600">Total Observations</Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold" color="orange.500">
                  {stats.totalObservations}
                </Stat.ValueText>
              </Stat.Root>
            </Card.Body>
          </Card.Root>
        </Grid>
      )}

      {/* Main Content Area */}
      <Flex gap={6}>
        {/* Filter Sidebar */}
        <Box
          w="300px"
          bg="white"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
          p={4}
          display={{ base: "none", lg: "block" }}
        >
          <HStack justify="space-between" mb={4}>
            <Text fontWeight="semibold">Filters</Text>
            <Button size="xs" variant="ghost" onClick={clearFilters}>
              Clear All
            </Button>
          </HStack>

          <VStack gap={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Person & Provider</Text>
              <VStack gap={3} align="stretch">
                <Input
                  placeholder="Person ID"
                  size="sm"
                  value={filters.personId}
                  onChange={(e) => handleFilterChange('personId', e.target.value)}
                />
                <Input
                  placeholder="Provider ID"
                  size="sm"
                  value={filters.providerId}
                  onChange={(e) => handleFilterChange('providerId', e.target.value)}
                />
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Visit Details</Text>
              <VStack gap={3} align="stretch">
                <Input
                  placeholder="Visit Source"
                  size="sm"
                  value={filters.visitSource}
                  onChange={(e) => handleFilterChange('visitSource', e.target.value)}
                />
                <Select.Root
                  collection={tierCollection}
                  size="sm"
                  value={filters.tier ? [filters.tier] : []}
                  onValueChange={(details) => handleFilterChange('tier', details.value[0] || '')}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select Tier" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {tierCollection.items.map((tier) => (
                        <Select.Item item={tier} key={tier.value}>
                          {tier.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>Date Range</Text>
              <VStack gap={3} align="stretch">
                <Input
                  type="date"
                  placeholder="From Date"
                  size="sm"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="To Date"
                  size="sm"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </VStack>
            </Box>

            <Box pt={2} borderTop="1px" borderColor="gray.100">
              <Text fontSize="xs" color="gray.600" mb={3}>
                Showing {filteredVisits.length} of {visits.length} visits
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                width="full"
                disabled={filteredVisits.length === 0}
              >
                Save as Cohort
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Data Table */}
        <Box flex={1}>
          <Card.Root bg="white" shadow="md" border="1px" borderColor="gray.200">
            <Card.Header>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Research Visits</Text>
                <Text color="gray.600" fontSize="sm">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredVisits.length)} of {filteredVisits.length} visits
                  {filteredVisits.length !== visits.length && (
                    <Text as="span" color="blue.600" fontSize="xs" ml={1}>
                      (filtered from {visits.length})
                    </Text>
                  )}
                </Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              {filteredVisits.length > 0 ? (
                <Box overflowX="auto">
                  <Table.Root size="sm" variant="outline">
                    <Table.Header bg="gray.50">
                      <Table.Row>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('id')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                          >
                            <Text>Visit ID</Text>
                            <SortIcon field="id" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Person ID</Table.ColumnHeader>
                        <Table.ColumnHeader>Provider ID</Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('visit_start_date')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                          >
                            <Text>Visit Date</Text>
                            <SortIcon field="visit_start_date" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('visit_source_value')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                          >
                            <Text>Source</Text>
                            <SortIcon field="visit_source_value" />
                          </HStack>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          <HStack
                            cursor="pointer"
                            onClick={() => handleSort('tier_id')}
                            _hover={{ bg: "gray.100" }}
                            p={2}
                            borderRadius="md"
                          >
                            <Text>Tier</Text>
                            <SortIcon field="tier_id" />
                          </HStack>
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {currentVisits.map((visit) => (
                        <Table.Row key={visit.id}>
                          <Table.Cell>
                            <Text fontWeight="medium" color="blue.600">
                              {visit.id}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{visit.person_id}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{visit.provider_id}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text fontSize="sm">
                              {new Date(`${visit.visit_start_date}T${visit.visit_start_time}`).toLocaleDateString()}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge size="sm" variant="subtle">
                              {visit.visit_source_value}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="sm"
                              colorScheme={visit.tier_id === 1 ? "green" : visit.tier_id === 2 ? "yellow" : "red"}
                            >
                              Tier {visit.tier_id}
                            </Badge>
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
                    {visits.length === 0
                      ? "No research data found. Data will appear here when available."
                      : "No visits match your current filters. Try adjusting your search criteria."
                    }
                  </Text>
                  {visits.length > 0 && filteredVisits.length === 0 && (
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  {error && (
                    <Text color="red.500" fontSize="sm" textAlign="center">
                      Error: {error}
                    </Text>
                  )}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        </Box>
      </Flex>
    </VStack>
  );
}