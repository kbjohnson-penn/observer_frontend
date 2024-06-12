"use server";

import React, { Suspense } from "react";
import LoadingPage from "../../components/LoadingPage";
import PlayGround from "./_components/PlayGround";
import {
  PatientDataType,
  ProviderDataType,
  EncounterSourceDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncounterDataType,
  EncounterSimCenterDataType,
  EncounterRIASDataType,
} from "../../interfaces/interfaces";
import { getDepartmentColors } from "../../lib/utils";

const fetchPatientsData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/patients`, {
    cache: "no-store",
  });
  const data: PatientDataType[] = await res.json();
  return data;
};

const fetchProvidersData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/providers`, {
    cache: "no-store",
  });
  const data: ProviderDataType[] = await res.json();
  return data;
};

const fetchEncounterSourceData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encountersources`, {
    cache: "no-store",
  });
  const data: EncounterSourceDataType[] = await res.json();
  return data;
};

const fetchDepartmentData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/departments`, {
    cache: "no-store",
  });
  const data: DepartmentDataType[] = await res.json();
  return data;
};

const fetchMultiModalDataPathsData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/datapaths`, {
    cache: "no-store",
  });
  const data: MultiModalDataPathsDataType[] = await res.json();
  return data;
};

const fetchEncouterData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encounters`, {
    cache: "no-store",
  });
  const data: EncounterDataType[] = await res.json();
  return data;
};

const fetchEncouterSimCenterData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encounters-simcenter/`, {
    cache: "no-store",
  });
  const data: EncounterSimCenterDataType[] = await res.json();
  return data;
};

const fetchEncouterRIASData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encounters-rias/`, {
    cache: "no-store",
  });
  const data: EncounterRIASDataType[] = await res.json();
  return data;
};

const Dashboard: React.FC = async () => {
  const patientsData = await fetchPatientsData();
  const providersData = await fetchProvidersData();
  const encounterSourceData = await fetchEncounterSourceData();
  const departmentData = await fetchDepartmentData();
  const multiModalDataPathsData = await fetchMultiModalDataPathsData();
  const encounterData = await fetchEncouterData();
  const encounterSimCenterData = await fetchEncouterSimCenterData();
  const encounterRIASData = await fetchEncouterRIASData();
  const departmentColors = await getDepartmentColors(departmentData);

  return (
    <Suspense fallback={<LoadingPage />}>
      <PlayGround
        patientsData={patientsData}
        providersData={providersData}
        encounterSourceData={encounterSourceData}
        departmentData={departmentData}
        multiModalDataPathsData={multiModalDataPathsData}
        encounterData={encounterData}
        encounterSimCenterData={encounterSimCenterData}
        encounterRIASData={encounterRIASData}
        departmentColors={departmentColors}
      />
    </Suspense>
  );
};

export default Dashboard;
