import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Label,
} from "recharts";

interface EncounterPerDepartmentChartProps {
  data: any[];
  departmentColors: { [key: string]: string };
  screenWidth: number;
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  const words = payload.value.split(" ");
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  return (
    <g transform={`translate(${x},${y})`}>
      {isMobile
        ? words.map((word: string, index: number) => (
            <text
              key={index}
              x={-5}
              y={index * 12}
              dy={8}
              textAnchor="middle"
              fill="#666"
              transform="rotate(0)"
              fontSize={10}
            >
              {word}
            </text>
          ))
        : isTablet
        ? words.map((word: string, index: number) => (
            <text
              key={index}
              x={0}
              y={index * 12}
              dy={8}
              textAnchor="end"
              fill="#666"
              transform="rotate(-30)"
              fontSize={10}
            >
              {word}
            </text>
          ))
        : words.map((word: string, index: number) => (
            <text
              key={index}
              x={0}
              y={index * 12}
              dy={8}
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

const CustomTooltip: React.FC<any> = ({
  active,
  payload,
  label,
  departmentColors,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p
          className="label"
          style={{ color: departmentColors[label] }}
        >{`${label}`}</p>
        <p className="intro">{`Encounters: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const EncounterPerDepartmentChart: React.FC<
  EncounterPerDepartmentChartProps
> = ({ data, departmentColors, screenWidth }) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart
      width={500}
      height={350}
      data={data}
      margin={{ top: 0, bottom: 30 }}
    >
      <XAxis
        dataKey="department"
        tick={<CustomizedAxisTick screenWidth={screenWidth} />}
        interval={0}
      />
      <YAxis allowDecimals={false} fontSize={12}>
        <Label
          value="Encounters"
          angle={-90}
          position="inside"
          fontSize={14}
          dx={-10}
        />
      </YAxis>
      <Tooltip
        content={<CustomTooltip departmentColors={departmentColors} />}
      />
      <Bar dataKey="count" barSize={50}>
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={departmentColors[entry.department]}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default EncounterPerDepartmentChart;
