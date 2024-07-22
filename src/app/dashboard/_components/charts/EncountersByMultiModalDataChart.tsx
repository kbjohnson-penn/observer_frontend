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
  screenWidth: number;
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  const words = payload.value
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  return (
    <g transform={`translate(${x},${y})`}>
      {isMobile
        ? words.map((word: string, index: number) => (
            <text
              key={index}
              x={-5}
              y={index * 8}
              dy={8}
              textAnchor="middle"
              fill="#666"
              transform="rotate(-30)"
              fontSize={8}
            >
              {word}
            </text>
          ))
        : isTablet
        ? words.map((word: string, index: number) => (
            <text
              key={index}
              x={0}
              y={index * 10}
              dy={10}
              textAnchor="middle"
              fill="#666"
              transform="rotate(0)"
              fontSize={8}
            >
              {word}
            </text>
          ))
        : words.map((word: string, index: number) => (
            <text
              key={index}
              x={0}
              y={index * 12}
              dy={10}
              textAnchor="middle"
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
          className="text-base font-medium"
          style={{ color: MULTI_MODAL_DATA_PATHS_COLORS[label] }}
        >{`${words}`}</p>
        <p className="text-sm">{`Total: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const EncountersByMultiModalDataChart: React.FC<
  EncountersByMultiModalDataChartProps
> = ({ data, screenWidth }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        data={data}
        margin={{ top: 0, bottom: 10, left: 5 }}
        barGap={5}
        barCategoryGap={20}
      >
        <YAxis
          type="number"
          allowDecimals={false}
          fontSize={screenWidth <= 768 ? 10 : 12}
        >
          <Label
            value="Total Available Data"
            position="inside"
            angle={-90}
            fontSize={14}
            dx={-10}
          />
        </YAxis>
        <XAxis
          dataKey="name"
          type="category"
          tick={<CustomizedAxisTick screenWidth={screenWidth} />}
          interval={0}
        />
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
};

export default EncountersByMultiModalDataChart;
