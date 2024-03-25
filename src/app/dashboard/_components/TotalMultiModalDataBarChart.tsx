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
  MultiModalDataPathsDataType,
} from "../../../interfaces";
import { getTotalMultiModalDataCount } from "../../../lib/utils";
import { MULTI_MODAL_DATA_PATHS_COLORS } from "../../../constants";

interface TotalMultiModalDataBarChartProps {
  encounterData: EncouterDataType[];
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

const TotalMultiModalDataBarChart: React.FC<
  TotalMultiModalDataBarChartProps
> = ({ encounterData, multiModalDataPathsData }) => {
  const data = getTotalMultiModalDataCount(
    encounterData,
    multiModalDataPathsData
  );

  const chartData = Object.keys(data).map((key) => ({
    multiModalDataType: key,
    count: data[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart width={500} height={300} data={chartData}>
        <XAxis
          dataKey="multiModalDataType"
          height={70}
          tick={<CustomizedAxisTick />}
          padding={{ left: 5, right: 5 }}
          label={{
            value: "Data Types",
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
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={MULTI_MODAL_DATA_PATHS_COLORS[entry.multiModalDataType]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TotalMultiModalDataBarChart;
