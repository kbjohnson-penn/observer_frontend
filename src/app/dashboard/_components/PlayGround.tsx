"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import {
  EncounterDataType,
  EncounterSourceDataType,
} from "@/interfaces/encounter";
import { Alert } from "@/components/ui/alert";
import { StatLabel, StatRoot, StatValueText } from "@/components/ui/stat";
import { formatDateToLocaleString } from "@/lib/utils/playground";

const PlayGround: React.FC = () => {
  const [encounters, setEncounters] = useState<EncounterDataType[]>([]);
  const [encounterSource, setEncounterSource] = useState<
    EncounterSourceDataType[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEncounters = async () => {
      setLoading(true);
      setError(null);
      try {
        const [encounterResponse, encounterSourceResponse] = await Promise.all([
          apiClient.get<EncounterDataType[]>("/encounters"),
          apiClient.get<EncounterSourceDataType[]>("/encountersources"),
        ]);
        setEncounters(encounterResponse.data);
        setEncounterSource(encounterSourceResponse.data);
      } catch (err) {
        console.error("Failed to fetch encounter details:", err);
        setError("Failed to load encounters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEncounters();
  }, []);

  const totalEncounters = encounters.length;
  const uniqueSources = new Set(
    encounters.map((encounter) => encounter.encounter_source)
  ).size;

  return (
    <Box p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Encounters
      </Text>

      {loading ? (
        <VStack justifyContent="center" my={6}>
          <Spinner size="lg" />
        </VStack>
      ) : error ? (
        <Alert status="error" title="Error Loading Data">
          {error}
        </Alert>
      ) : encounters && encounters.length > 0 ? (
        <Box w="full">
          {/* Stats Section */}
          {/* <HStack mb={6} gap={8}>
            <StatRoot>
              <StatLabel>Total Encounters</StatLabel>
              <StatValueText>{totalEncounters}</StatValueText>
            </StatRoot>
            <StatRoot>
              <StatLabel>Unique Sources</StatLabel>
              <StatValueText>{uniqueSources}</StatValueText>
            </StatRoot>
          </HStack> */}

          {/* Table Header */}
          <HStack
            w="full"
            bg="gray.200"
            color="gray.600"
            p={3}
            borderRadius="md"
            fontWeight="bold"
            justifyContent="space-between"
          >
            <Text flex={1}>Encounter</Text>
            <Text flex={1}>Source</Text>
            <Text flex={1}>Encounter Date</Text>
          </HStack>

          {/* Table Rows */}
          <VStack w="full" gap={2} mt={4}>
            {encounters.map((encounter) => {
              const sourceName =
                encounterSource.find(
                  (src) => src.id === encounter.encounter_source
                )?.name || "N/A";

              return (
                <HStack
                  key={encounter.id}
                  w="full"
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  _hover={{ bg: "blue.50" }}
                  cursor="pointer"
                  justifyContent="space-between"
                  onClick={() => router.push(`/dashboard/${encounter.id}`)}
                >
                  <HStack flex={1} align="center">
                    <FiFolder size={20} color="blue.500" />
                    <Text fontWeight="medium" color="gray.700" ml={2}>
                      {encounter.case_id || "N/A"}
                    </Text>
                  </HStack>
                  <Text flex={1} color="gray.600">
                    {sourceName}
                  </Text>
                  <Text flex={1} color="gray.600">
                    {formatDateToLocaleString(
                      encounter.encounter_date_and_time
                    )}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      ) : (
        <Text color="gray.500">No encounters available.</Text>
      )}
    </Box>
  );
};

export default PlayGround;
