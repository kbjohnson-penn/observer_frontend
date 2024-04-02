import React, { Suspense } from "react";
import * as d3 from "d3";
import LoadingPage from "../../components/LoadingPage";
import PlayGround from "./_components/PlayGround";
import {
  PatientDataType,
  ProviderDataType,
  EncounterSourceDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncounterDataType,
} from "../../interfaces/interfaces";
import { getDepartmentColors } from "../../lib/utils";

const fetchPatientsData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/patients`);
  const data: PatientDataType[] = await res.json();
  return data;
};

const fetchProvidersData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/providers`);
  const data: ProviderDataType[] = await res.json();
  return data;
};

const fetchEncouterData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encounters`);
  const data: EncounterDataType[] = await res.json();
  return data;
};

const fetchEncounterSourceData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encountersources`);
  const data: EncounterSourceDataType[] = await res.json();
  return data;
};

const fetchDepartmentData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/departments`);
  const data: DepartmentDataType[] = await res.json();
  return data;
};

const fetchMultiModalDataPathsData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/datapaths`);
  const data: MultiModalDataPathsDataType[] = await res.json();
  return data;
};

const Dashboard: React.FC = async () => {
  const patientsData = await fetchPatientsData();
  const providersData = await fetchProvidersData();
  const encounterSourceData = await fetchEncounterSourceData();
  const departmentData = await fetchDepartmentData();
  const multiModalDataPathsData = await fetchMultiModalDataPathsData();
  const encounterData = await fetchEncouterData();
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
        departmentColors={departmentColors}
      />
    </Suspense>
  );
};

export default Dashboard;
