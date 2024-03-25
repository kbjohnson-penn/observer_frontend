import React, { Suspense } from "react";
import LoadingPage from "../../components/LoadingPage";
import EncouterBarChart from "./_components/EncouterBarChart";
import EncounterLineChart from "./_components/EncounterLineChart";
import CummulativeDataTable from "./_components/CummalativeDataTable";
import EncouterByMultiModalDataBarChart from "./_components/EncouterByMultiModalDataBarChart";
import TotalMultiModalDataBarChart from "./_components/TotalMultiModalDataBarChart";

import {
  PatientDataType,
  ProviderDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncouterDataType,
} from "../../interfaces";

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
  const data: EncouterDataType[] = await res.json();
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
  const encounterData = await fetchEncouterData();
  const departmentData = await fetchDepartmentData();
  const multiModalDataPathsData = await fetchMultiModalDataPathsData();

  return (
    <div className="flex flex-col min-h-screen items-center justify-start p-10 text-center space-y-8 bg-gray-100 py-10">
      <h1 style={{ color: "#950019" }} className="text-4xl font-bold mb-4">
        Dashboard
      </h1>
      <Suspense fallback={<LoadingPage />}>
        <div className="grid grid-cols-2 gap-4 w-full max-w-7xl">
          <div className="bg-white rounded-md shadow-md p-2">
            <h2 className="text-xl mt-4 mb-8">
              Number of Encouters by Department
            </h2>
            <EncouterBarChart
              encounterData={encounterData}
              departmentData={departmentData}
            />
          </div>
          <div className="bg-white rounded-md shadow-md p-2">
            <h2 className="text-xl mt-4 mb-8">Encounter over time</h2>
            <EncounterLineChart encounterData={encounterData} />
          </div>
          <div className="bg-white rounded-md shadow-md p-2">
            <h2 className="text-xl mt-4 mb-8">
              Number of Encouters by Department & Data Type
            </h2>
            <EncouterByMultiModalDataBarChart
              encounterData={encounterData}
              departmentData={departmentData}
              multiModalDataPathsData={multiModalDataPathsData}
            />
          </div>
          <div className="bg-white rounded-md shadow-md p-2">
            <h2 className="text-xl mt-4 mb-8">Total Multi Modal Data Types</h2>
            <TotalMultiModalDataBarChart
              encounterData={encounterData}
              multiModalDataPathsData={multiModalDataPathsData}
            />
          </div>
        </div>
        {/* <div className="w-full max-w-5xl p-6 bg-white rounded-md shadow-md border border-gray-300">
          <h2 className="text-xl mb-8">Demographics Table</h2>
          <CummulativeDataTable encounterData={encounterData} />
        </div> */}
      </Suspense>
    </div>
  );
};

export default Dashboard;
