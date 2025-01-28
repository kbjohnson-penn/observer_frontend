"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Spinner,
  VStack,
  HStack,
  Text,
  Grid,
  Separator,
  For,
} from "@chakra-ui/react";
import { FiFile } from "react-icons/fi";
import apiClient from "@/lib/apiClient";
import {
  EncounterDataType,
  EncounterSourceDataType,
  EncounterFileDataType,
} from "@/interfaces/encounter";
import { PatientDataType } from "@/interfaces/patient";
import { ProviderDataType } from "@/interfaces/provider";
import { DepartmentDataType } from "@/interfaces/department";
import { formatDateToLocaleString } from "@/lib/utils/playground";

const EncounterDetails: React.FC = () => {
  const { id } = useParams();
  const [encounter, setEncounter] = useState<EncounterDataType | null>(null);
  const [patient, setPatient] = useState<PatientDataType | null>(null);
  const [provider, setProvider] = useState<ProviderDataType | null>(null);
  const [department, setDepartment] = useState<DepartmentDataType | null>(null);
  const [encounterSource, setEncounterSource] =
    useState<EncounterSourceDataType | null>(null);
  const [encounterFile, setEncounterFile] = useState<EncounterFileDataType[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEncounter = async () => {
      try {
        const { data } = await apiClient.get<EncounterDataType>(
          `/private/encounters/${id}`
        );
        setEncounter(data);
      } catch (error) {
        console.error("Failed to fetch encounter details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEncounter();
  }, [id]);

  useEffect(() => {
    const fetchEncounterDetails = async () => {
      if (!encounter) return;

      setLoading(true);

      try {
        const [
          patientResponse,
          providerResponse,
          departmentResponse,
          encounterSourceResponse,
        ] = await Promise.all([
          apiClient.get<PatientDataType>(
            `/private/patients/${encounter.patient}`
          ),
          apiClient.get<ProviderDataType>(
            `/private/providers/${encounter.provider}`
          ),
          apiClient.get<DepartmentDataType>(
            `/private/departments/${encounter.department}`
          ),
          apiClient.get<EncounterSourceDataType>(
            `/private/encountersources/${encounter.encounter_source}`
          ),
        ]);

        setPatient(patientResponse.data);
        setProvider(providerResponse.data);
        setDepartment(departmentResponse.data);
        setEncounterSource(encounterSourceResponse.data);

        if (
          encounter.encounterfile_ids &&
          encounter.encounterfile_ids.length > 0
        ) {
          const encounterFileResponse = await apiClient.post<
            EncounterFileDataType[]
          >(`/private/encounterfiles/by-ids/`, {
            ids: encounter.encounterfile_ids,
          });
          setEncounterFile(encounterFileResponse.data);
        } else {
          setEncounterFile([]);
        }
      } catch (error) {
        console.error("Failed to fetch encounter details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEncounterDetails();
  }, [encounter]);

  if (loading) {
    return (
      <Box p={6}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!encounter) {
    return (
      <Box p={6}>
        <Text fontSize="lg" color="red.500">
          Encounter not found. Please try again later.
        </Text>
      </Box>
    );
  }

  const encounterStats = [
    { label: "Department", value: department?.name || "N/A" },
    { label: "Encounter Source", value: encounterSource?.name || "N/A" },
  ];

  const patientStats = [
    {
      label: "Patient ID",
      value: `PT${patient?.patient_id.toString()}` || "N/A",
    },
    { label: "Date of Birth", value: patient?.year_of_birth || "N/A" },
    { label: "Sex", value: patient?.sex || "N/A" },
    { label: "Race", value: patient?.race || "N/A" },
    { label: "Ethnicity", value: patient?.ethnicity || "N/A" },
  ];

  const providerStats = [
    {
      label: "Provider ID",
      value: `PR${provider?.provider_id.toString()}` || "N/A",
    },
    { label: "Date of Birth", value: provider?.year_of_birth || "N/A" },
    { label: "Sex", value: provider?.sex || "N/A" },
    { label: "Race", value: provider?.race || "N/A" },
    { label: "Ethnicity", value: provider?.ethnicity || "N/A" },
  ];

  return (
    <Box p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        {encounter.case_id}
      </Text>

      <Box mb={6}>
        <Text fontSize="lg" fontWeight="bold" color="blue.600" mb={2}>
          Encounter Information
        </Text>
        <Grid w="full" templateColumns="150px 1fr" mb={2}>
          <For each={encounterStats}>
            {(item) => (
              <React.Fragment key={item.label}>
                <Text fontWeight="semibold" minW="120px" mb={2}>
                  {item.label}:
                </Text>
                <Text>{item.value}</Text>
              </React.Fragment>
            )}
          </For>
        </Grid>
      </Box>

      <Separator size="lg" />

      <Grid w="full" templateColumns="repeat(2, 1fr)" mb={2}>
        <VStack align="start">
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            Patient Demographics
          </Text>
          <For each={patientStats}>
            {(item) => (
              <HStack key={item.label} alignItems="center">
                <Text fontWeight="semibold" minW="120px">
                  {item.label}:
                </Text>
                <Text>{item.value}</Text>
              </HStack>
            )}
          </For>
        </VStack>
        <VStack align="start">
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            Provider Demographics
          </Text>
          <For each={providerStats}>
            {(item) => (
              <HStack key={item.label} alignItems="center">
                <Text fontWeight="semibold" minW="120px">
                  {item.label}:
                </Text>
                <Text>{item.value}</Text>
              </HStack>
            )}
          </For>
        </VStack>
      </Grid>

      <Separator size="lg" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" color="blue.600" mt={6}>
          Encounter Files
        </Text>
        {encounterFile.length > 0 ? (
          <VStack align="start" mt={2} w="full" gap={3}>
            <HStack
              w="full"
              bg="gray.200"
              color="gray.600"
              p={3}
              borderRadius="md"
              justifyContent="space-between"
              fontWeight="bold"
            >
              <Text flex={1}>File Name</Text>
              <Text flex={0.5}>File Type</Text>
              <Text flex={0.7}>Uploaded</Text>
              <Text flex={0.5} />
            </HStack>
            <For each={encounterFile}>
              {(file) => (
                <HStack
                  key={file.id}
                  w="full"
                  p={1}
                  bg="gray.50"
                  borderRadius="md"
                  _hover={{ bg: "gray.100" }}
                  justifyContent="space-between"
                >
                  <HStack flex={1}>
                    <FiFile size={20} color="blue.500" />
                    <Text ml={2} fontWeight="medium">
                      {file.file_name}
                    </Text>
                  </HStack>
                  <Text flex={0.5} color="gray.600">
                    {file.file_type}
                  </Text>
                  <Text flex={0.7} color="gray.600">
                    {formatDateToLocaleString(file.timestamp)}
                  </Text>
                  <Box flex={0.5} textAlign="right">
                    <a
                      href={file.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Text
                        color="blue.500"
                        fontWeight="bold"
                        _hover={{ textDecoration: "underline" }}
                        mr={2}
                      >
                        View
                      </Text>
                    </a>
                  </Box>
                </HStack>
              )}
            </For>
          </VStack>
        ) : (
          <Text color="gray.500">No files available for this encounter.</Text>
        )}
      </Box>
    </Box>
  );
};

export default EncounterDetails;
