"use client";

import React from "react";
import { useFetchData } from "../useFetchData";
import DataTable from "./components/DataTable";

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen items-center justify-start p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
    </div>
  );
};

export default Dashboard;
