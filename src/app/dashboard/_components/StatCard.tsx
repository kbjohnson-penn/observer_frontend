"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-2 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
      <h2 className="text-start text-sm font-semibold text-gray-800 mb-2">
        {title}
      </h2>
      <p className="text-center text-2xl font-bold text-blue-500">{value}</p>
    </div>
  );
};

export default StatCard;
