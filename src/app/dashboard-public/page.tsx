import React from "react";
import PlayGround from "./_components/PlayGround";
import axios from "axios";
import { Box, Heading, Text } from "@chakra-ui/react";

import { PublicDepartmentDataType } from "@/interfaces/department";
import { PublicPatientDataType } from "@/interfaces/patient";
import { PublicProviderDataType } from "@/interfaces/provider";
import { PublicEncounterDataType, PublicEncounterSourceDataType } from "@/interfaces/encounter";
import { PublicMultiModalDataType } from "@/interfaces/mmd";

import { getDepartmentColors } from "@/lib/utils/utils";

const fetchPatientsData = async (): Promise<PublicPatientDataType[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/public/patients/`
    );
    return response.data;
  } catch (error) {
    // Error fetching patients - return empty array
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
    // Error fetching providers - return empty array
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
    // Error fetching departments - return empty array
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
    // Error fetching encounters - return empty array
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
    // Error fetching multimodal data - return empty array
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
    // Error fetching encounter sources - return empty array
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
      px={{ base: 2, md: 4, lg: 6, xl: "2%" }}
      className="dashboard-container"
    >
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
