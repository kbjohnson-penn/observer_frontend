"use client";

import React from "react";
import { useFetchData } from "./useFetchData";
import DataTable from "./components/DataTable";

const Dashboard: React.FC = () => {
  const { data, error } = useFetchData(
    `${process.env.NEXT_PUBLIC_BACKEND_API}/encounters`
  );

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-100 text-red-700 rounded-md">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-5 text-blue-700">Dashboard</h1>
      <div className="w-full max-w-4xl p-4 bg-white rounded-md shadow-md">
        <DataTable data={data} />
      </div>
    </>
  );
};

export default Dashboard;
