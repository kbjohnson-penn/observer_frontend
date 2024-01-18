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
import { getTotalMediaCount } from "../../../lib/utils";
import { MEDIA_TYPE_COLORS } from "../../../constants";

interface TotalMediaBarChartProps {
  encounterData: EncouterDataType[];
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

const TotalMediaBarChart: React.FC<TotalMediaBarChartProps> = ({
  encounterData,
  encounterMediaChoicesData,
}) => {
  const data = getTotalMediaCount(encounterData, encounterMediaChoicesData);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart width={500} height={300} data={data}>
        <XAxis
          dataKey="mediaType"
          height={70}
          tick={<CustomizedAxisTick />}
          padding={{ left: 5, right: 5 }}
          label={{
            value: "Media Types",
            position: "insideBottomRight",
            offset: 0,
          }}
        />
        <YAxis
          allowDecimals={false}
          label={{ value: "Total", angle: -90, position: "middle" }}
        />
        <Tooltip />
        <Bar dataKey="count" barSize={70}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={MEDIA_TYPE_COLORS[entry.mediaType]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TotalMediaBarChart;
