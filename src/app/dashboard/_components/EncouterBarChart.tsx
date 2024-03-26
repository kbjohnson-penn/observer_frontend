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
import { EncouterDataType, DepartmentDataType } from "../../../interfaces/interfaces";
import { getEncouterPerDepartment } from "../../../lib/utils";
import { DEPARTMENT_COLORS } from "../../../constants";

interface EncounterBarChartProps {
  encounterData: EncouterDataType[];
  departmentData: DepartmentDataType[];
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={5} // Decrease this value to move the ticks up
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)"
        fontSize={12} // Adjust this value to change the tick size
      >
        {payload.value}
      </text>
    </g>
  );
};

const EncounterBarChart: React.FC<EncounterBarChartProps> = ({
  encounterData,
  departmentData,
}) => {
  const data = getEncouterPerDepartment(encounterData, departmentData);
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
            offset: -5,
          }}
        />
        <YAxis
          allowDecimals={false}
          label={{ value: "No. of Encouters", angle: -90, position: "middle" }}
        />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" barSize={70}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={DEPARTMENT_COLORS[entry.department]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncounterBarChart;
