"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EncouterDataType } from "../../../interfaces/interfaces";
import { getEncouterByDate } from "../../../lib/utils";

interface EncounterLineChartProps {
  encounterData: EncouterDataType[];
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)"
      >
        {payload.value}
      </text>
    </g>
  );
};

const EncounterLineChart: React.FC<EncounterLineChartProps> = ({
  encounterData,
}) => {
  const data = getEncouterByDate(encounterData);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart width={500} height={300} data={data}>
        <XAxis
          dataKey="encounter_date"
          height={70}
          tick={<CustomizedAxisTick />}
          padding={{ left: 10, right: 10 }}
          label={{
            value: "Date",
            position: "insideBottomRight",
            offset: 0,
          }}
        />
        <YAxis
          allowDecimals={false}
          label={{ value: "No. of Encouters", angle: -90, position: "middle" }}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          activeDot={{ r: 10 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EncounterLineChart;
