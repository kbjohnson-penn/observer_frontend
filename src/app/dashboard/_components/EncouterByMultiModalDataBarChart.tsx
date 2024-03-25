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
} from "recharts";
import {
  EncouterDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
} from "../../../interfaces";
import { getMultiModalDataByDepartments } from "../../../lib/utils";
import { MULTI_MODAL_DATA_PATHS_COLORS } from "../../../constants";

interface EncouterByMultiModalDataBarChartProps {
  encounterData: EncouterDataType[];
  departmentData: DepartmentDataType[];
  multiModalDataPathsData: MultiModalDataPathsDataType[];
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10} // Decrease this value to move the ticks up
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

const EncouterByMultiModalDataBarChart: React.FC<
  EncouterByMultiModalDataBarChartProps
> = ({ encounterData, departmentData, multiModalDataPathsData }) => {
  const data = getMultiModalDataByDepartments(
    encounterData,
    departmentData,
    multiModalDataPathsData
  );

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
          label={{ value: "Total", angle: -90, position: "middle" }}
        />
        <Tooltip />
        {Object.keys(data[0].data).map((dataType) => (
          <Bar
            key={dataType}
            dataKey={`data.${dataType}`}
            stackId="a"
            fill={MULTI_MODAL_DATA_PATHS_COLORS[dataType]}
            barSize={70}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncouterByMultiModalDataBarChart;
