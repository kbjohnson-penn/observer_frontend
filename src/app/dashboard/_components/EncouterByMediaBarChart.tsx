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
  EncounterMediaChoicesDataType,
} from "../../../interfaces";
import { getMediaChoicesByDepartments } from "../../../lib/utils";
import { MEDIA_TYPE_COLORS } from "../../../constants";

interface EncouterByMediaBarChartProps {
  encounterData: EncouterDataType[];
  departmentData: DepartmentDataType;
  encounterMediaChoicesData: EncounterMediaChoicesDataType;
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

const EncouterByMediaBarChart: React.FC<EncouterByMediaBarChartProps> = ({
  encounterData,
  departmentData,
  encounterMediaChoicesData,
}) => {
  const data = getMediaChoicesByDepartments(
    encounterData,
    departmentData,
    encounterMediaChoicesData
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
        {Object.keys(MEDIA_TYPE_COLORS).map((mediaType) => (
          <Bar
            key={mediaType}
            dataKey={mediaType}
            stackId="a"
            fill={MEDIA_TYPE_COLORS[mediaType]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncouterByMediaBarChart;
