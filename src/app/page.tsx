import React, { Suspense } from "react";
import DataTable from "./dashboard/_components/DataTable";
import LoadingPage from "../components/LoadingPage";

import {
  EncouterDataType,
  DepartmentDataType,
  EncounterMediaTypeChoicesDataType,
} from "../interfaces";

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

const Home: React.FC = async () => {
  const encounterData = await fetchEncouterData();
  const departmentData = await fetchDepartmentData();
  const encounterMediaTypeChoicesData =
    await fetchEncounterMediaTypeChoicesData();

  return (
    <main>
      <div className="flex flex-col min-h-screen items-center justify-start p-10 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Observer Project
        </h1>
        <p className="text-lg text-justify mx-8 py-8">
          The mission of the Observer Repository is to build a repository of
          clinical encounter data that supports clinical care research,
          translation, improvement, and education related to clinical care and
          technology. This project will collect data on the clinic visit in
          multiple formats, including screen captures, EHR audit log data, room
          videos, and encounter reviews, which will be used later in different
          research studies.
        </p>
        <p className="text-lg text-justify mx-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
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
    </main>
  );
};

export default Home;
