import React from "react";
import PlayGround from "./_components/PlayGround";
import axios from "axios";
import { Box, Heading, Text } from "@chakra-ui/react";

import { PublicDepartmentDataType } from "@/interfaces/department";
import { PublicPatientDataType } from "@/interfaces/patient";
import { PublicProviderDataType } from "@/interfaces/provider";
import { PublicEncounterDataType } from "@/interfaces/encounter";
import { PublicMultiModalDataType } from "@/interfaces/mmd";
import { PublicEncounterSourceDataType } from "@/interfaces/encounter";

import { getDepartmentColors } from "@/lib/utils/utils";

const fetchPatientsData = async (): Promise<PublicPatientDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/patients/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
};

const fetchProvidersData = async (): Promise<PublicProviderDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/providers/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return [];
  }
};

const fetchDepartmentData = async (): Promise<PublicDepartmentDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/departments/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

const fetchEncounterData = async (): Promise<PublicEncounterDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/encounters/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching encounters:", error);
    return [];
  }
};

const fetchMultiModalData = async (): Promise<PublicMultiModalDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/mmdata/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching multimodal data:", error);
    return [];
  }
};

const fetchEncounterSourceData = async (): Promise<
  PublicEncounterSourceDataType[]
> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/encountersources/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching encounter sources:", error);
    return [];
  }
};

const DashboardPublic = async () => {
  const patients = await fetchPatientsData();
  const providers = await fetchProvidersData();
  const departments = await fetchDepartmentData();
  const encounters = await fetchEncounterData();
  const multiModalData = await fetchMultiModalData();
  const encounterSources = await fetchEncounterSourceData();
  const departmentColors = await getDepartmentColors(departments);

  return (
    <Box
      w="full"
      px={{ base: 2, md: 4, lg: 6, xl: "5%", "2xl": "10%" }}
      className="dashboard-container"
    >
      <Box as="header" mb={6} pt={4}>
        <Heading
          as="h1"
          size="xl"
          fontWeight="bold"
          color="brand.penn-dark-blue"
        >
          Observer Platform Dashboard
        </Heading>
      </Box>

      <PlayGround
        patients={patients}
        providers={providers}
        departments={departments}
        encounters={encounters}
        multiModalData={multiModalData}
        encounterSources={encounterSources}
        departmentColors={departmentColors}
      />
    </Box>
  );
};

export default DashboardPublic;
