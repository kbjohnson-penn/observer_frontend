import React, { Suspense } from "react";
import DataTable from "./_components/DataTable";
import LoadingPage from "../../components/LoadingPage";

import {
  EncouterDataType,
  DepartmentDataType,
  EncounterMediaTypeChoicesDataType,
} from "../../interfaces";

const fetchEncouterData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/encounters`);
  const data: EncouterDataType = await res.json();
  return data;
};

const fetchDepartmentData = async () => {
  const res = await fetch(`${process.env.BACKEND_API}/departments`);
  const data: DepartmentDataType = await res.json();
  return data;
};

const fetchEncounterMediaTypeChoicesData = async () => {
  const res = await fetch(
    `${process.env.BACKEND_API}/encounter_media_type_choices`
  );
  const data: EncounterMediaTypeChoicesDataType = await res.json();
  return data;
};

const Dashboard: React.FC = async () => {
  const encounterData = await fetchEncouterData();
  const departmentData = await fetchDepartmentData();
  const encounterMediaTypeChoicesData =
    await fetchEncounterMediaTypeChoicesData();

  return (
    <div className="flex flex-col min-h-screen items-center justify-start p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <div className="w-full max-w-4xl p-4 bg-white rounded-md shadow-md">
        <Suspense fallback={<LoadingPage />}>
          <DataTable
            encounterData={encounterData}
            departmentData={departmentData}
            encounterMediaTypeChoicesData={encounterMediaTypeChoicesData}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
