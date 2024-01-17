"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { EncouterDataType, DepartmentDataType } from "../../../interfaces";
import { getEncouterPerDepartment } from "../../../lib/utils";

interface EncounterBarChartProps {
  encounters: EncouterDataType[];
  departmentData: DepartmentDataType;
}

const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red", "pink"];

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10} // Decrease this value to move the ticks up
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)" // Decrease this value to reduce the rotation
        fontSize={12} // Adjust this value to change the tick size
      >
        {payload.value}
      </text>
    </g>
  );
};

const EncounterBarChart: React.FC<EncounterBarChartProps> = ({
  encounters,
  departmentData,
}) => {
  const data = getEncouterPerDepartment(encounters, departmentData);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart width={500} height={300} data={data}>
        <XAxis
          dataKey="department"
          height={70}
          tick={<CustomizedAxisTick />}
          padding={{ left: 5, right: 5 }}
          label={{
            value: "Departments",
            position: "insideBottomRight",
            offset: 0,
          }}
        />
        <YAxis
          allowDecimals={false}
          label={{ value: "No. of Patients", angle: -90, position: "middle" }}
        />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" label={{ position: "top" }}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncounterBarChart;
