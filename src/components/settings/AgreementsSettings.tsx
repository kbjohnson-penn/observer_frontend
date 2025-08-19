"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Table,
  Button,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";

interface Agreement {
  id: number;
  date: string;
  agreement: string;
  project: string;
  viewUrl?: string;
  version: string;
  name: string;
}

interface AgreementsData {
  data_use_agreements: Agreement[];
  code_of_conduct: Agreement[];
}

export default function AgreementsSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [agreements, setAgreements] = useState<AgreementsData>({
    data_use_agreements: [],
    code_of_conduct: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load agreements data
  useEffect(() => {
    const loadAgreements = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/agreements/user-agreements/grouped/`,
          {
            method: "GET",
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAgreements(data);
        } else {
          console.error("Failed to load agreements");
        }
      } catch (error) {
        console.error("Error loading agreements:", error);
      }
      setIsLoading(false);
    };

    loadAgreements();
  }, [user]);

  const handleViewAgreement = (url: string) => {
    if (url && url !== "#") {
      window.open(url, '_blank');
    }
  };

  // Show loading state during auth loading
  if (authLoading) {
    return (
      <Box>
        <Text color="gray.600">Loading agreements...</Text>
      </Box>
    );
  }

  return (
    <Box>{/* SettingsLayout provides the header */}

      <VStack gap={6} align="stretch">
        {/* Data Use Agreements Section */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={4} pb={2} borderBottom="2px" borderColor="gray.100">
            Data Use Agreements
          </Text>
          <Text color="gray.600" mb={4}>
            You have signed the following Data Use Agreements:
          </Text>

          <Box bg="white" borderRadius="lg" border="1px" borderColor="gray.200" overflow="hidden">
            <Table.Root variant="outline" size="md">
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Date of Agreement
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Agreement
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Project
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    View Agreement
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {agreements.data_use_agreements.length > 0 ? (
                  agreements.data_use_agreements.map((agreement, index) => (
                    <Table.Row key={agreement.id} bg={index % 2 === 0 ? "white" : "gray.50"}>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {agreement.date}
                      </Table.Cell>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {agreement.agreement || `${agreement.name} v${agreement.version}`}
                      </Table.Cell>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {agreement.project || "N/A"}
                      </Table.Cell>
                      <Table.Cell 
                        p={4}
                      >
                        {agreement.viewUrl ? (
                          <Button
                            variant="ghost"
                            color="blue.600"
                            size="sm"
                            p={2}
                            h="auto"
                            fontWeight="medium"
                            borderRadius="md"
                            _hover={{ color: "blue.700", bg: "blue.50" }}
                            onClick={() => handleViewAgreement(agreement.viewUrl!)}
                          >
                            View Document
                          </Button>
                        ) : (
                          <Text color="gray.400" fontSize="sm">Not Available</Text>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} textAlign="center" p={8} color="gray.500">
                      {isLoading ? (
                        <Text fontSize="sm">Loading agreements...</Text>
                      ) : (
                        <Box>
                          <Text fontSize="sm" mb={2}>No data use agreements signed</Text>
                          <Text fontSize="xs" color="gray.400">Contact your administrator to sign required agreements</Text>
                        </Box>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>

        {/* Code of Conduct Section */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.900" mb={4} pb={2} borderBottom="2px" borderColor="gray.100">
            Code of Conduct
          </Text>
          <Text color="gray.600" mb={4}>
            You have signed the following Code of Conduct agreements:
          </Text>

          <Box bg="white" borderRadius="lg" border="1px" borderColor="gray.200" overflow="hidden">
            <Table.Root variant="outline" size="md">
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Date of Agreement
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Name
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    fontWeight="semibold" 
                    color="gray.900" 
                    p={4}
                    fontSize="sm"
                  >
                    Version
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {agreements.code_of_conduct.length > 0 ? (
                  agreements.code_of_conduct.map((conduct, index) => (
                    <Table.Row key={conduct.id} bg={index % 2 === 0 ? "white" : "gray.50"}>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {conduct.date}
                      </Table.Cell>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {conduct.name}
                      </Table.Cell>
                      <Table.Cell 
                        p={4}
                        color="gray.900"
                        fontSize="sm"
                      >
                        {conduct.version}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign="center" p={8} color="gray.500">
                      {isLoading ? (
                        <Text fontSize="sm">Loading agreements...</Text>
                      ) : (
                        <Box>
                          <Text fontSize="sm" mb={2}>No code of conduct agreements signed</Text>
                          <Text fontSize="xs" color="gray.400">Contact your administrator to sign required agreements</Text>
                        </Box>
                      )}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}