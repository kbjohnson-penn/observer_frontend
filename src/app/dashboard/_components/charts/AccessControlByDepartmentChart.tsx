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

interface AccessControlByDepartmentChartProps {
  data: any[];
  departmentColors: { [key: string]: string };
}

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  const words = payload.value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word: string, index: number) => (
        <text
          key={index}
          x={0}
          dy={8}
          y={index * 18} // Adjust this value to change the line height
          textAnchor="end"
          fill="#666"
          transform="rotate(-20)" // Adjust this value to change the angle of rotation
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
        {payload.map((entry: any, index: number) => (
          <p key={index}>{`${
            entry.name === "accessControlled"
              ? "# Restricted"
              : "# Not Restricted"
          }: ${entry.value}`}</p>
        ))}
      </div>
    );
  }

  return null;
};

const AccessControlByDepartmentChart: React.FC<
  AccessControlByDepartmentChartProps
> = ({ data, departmentColors }) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart
      width={500}
      height={350}
      data={data}
      margin={{ top: 5, right: 5, bottom: 30, left: 5 }}
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
      <XAxis dataKey="department" tick={<CustomizedAxisTick />} interval={0} />
      <YAxis allowDecimals={false}>
        <Label value="Encounters" angle={-90} position="inside" />
      </YAxis>
      <Tooltip
        content={<CustomTooltip departmentColors={departmentColors} />}
      />
      <Bar dataKey="accessControlled" barSize={40}>
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={departmentColors[entry.department]}
          />
        ))}
      </Bar>
      <Bar dataKey="notAccessControlled" barSize={40}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={`url(#diagonalHatch-${index})`} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default AccessControlByDepartmentChart;
