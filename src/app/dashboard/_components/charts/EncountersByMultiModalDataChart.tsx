import React from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { MULTI_MODAL_DATA_PATHS_COLORS } from "../../../../constants";

interface EncountersByMultiModalDataChartProps {
  data: any[];
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  const words = payload.value
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word: string, index: number) => (
        <text
          key={index}
          x={0}
          y={index * 12}
          dy={-3}
          textAnchor="end"
          fill="#666"
          transform="rotate(0)"
          fontSize={12}
        >
          {word}
        </text>
      ))}
    </g>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const words = label
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: `1px solid ${MULTI_MODAL_DATA_PATHS_COLORS[label]}`,
        }}
      >
        <p
          className="label"
          style={{ color: MULTI_MODAL_DATA_PATHS_COLORS[label] }}
        >{`${words}`}</p>
        <p>{`Total: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const EncountersByMultiModalDataChart: React.FC<
  EncountersByMultiModalDataChartProps
> = ({ data }) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart
      width={500}
      height={350}
      data={data}
      layout="vertical"
      margin={{ top: 5, right: 5, bottom: 30, left: 50 }}
      barGap={5}
      barCategoryGap={20}
    >
      <YAxis
        dataKey="name"
        type="category"
        tick={<CustomizedAxisTick />}
        interval={0}
      />
      <XAxis type="number" allowDecimals={false} fontSize={12}>
        <Label
          value="Total Available Data "
          offset={-10}
          position="insideBottom"
          fontSize={14}
        />
      </XAxis>
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="count" barSize={50}>
        {data.map((entry: any) => (
          <Cell
            key={`cell-${entry.name}`}
            fill={MULTI_MODAL_DATA_PATHS_COLORS[entry.name]}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default EncountersByMultiModalDataChart;
