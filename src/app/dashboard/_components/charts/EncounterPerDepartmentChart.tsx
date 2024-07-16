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
  data: {
    department: string;
    accessControlled: number;
    notAccessControlled: number;
  }[];
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
    const total = payload.reduce(
      (acc: number, entry: any) => acc + entry.value,
      0
    );

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
          className="text-base font-medium"
          style={{ color: departmentColors[label] }}
        >{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm">{`${
            entry.name === "accessControlled" ? "Restricted" : "Not Restricted"
          }: ${entry.value}`}</p>
        ))}
        <p className="text-sm">{`Total: ${total}`}</p>
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
      {data.map((entry, index) => (
        <defs key={`def-${index}`}>
          <pattern
            id={`diagonalHatch-${index}`}
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
          >
            <path
              d="M-1,1 l2,-2
                 M0,4 l4,-4
                 M3,5 l2,-2"
              style={{
                stroke: departmentColors[entry.department],
                strokeWidth: 1.5,
              }}
            />
          </pattern>
        </defs>
      ))}
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
      <Bar dataKey="accessControlled" barSize={40} stackId="a">
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={departmentColors[entry.department]}
          />
        ))}
      </Bar>
      <Bar dataKey="notAccessControlled" barSize={40} stackId="a">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={`url(#diagonalHatch-${index})`} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default EncounterPerDepartmentChart;
