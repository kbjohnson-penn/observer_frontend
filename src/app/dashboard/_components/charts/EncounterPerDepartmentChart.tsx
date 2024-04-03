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
        <p className="intro">{`# Encounters: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const EncounterPerDepartmentChart: React.FC<
  EncounterPerDepartmentChartProps
> = ({ data, departmentColors }) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart
      width={500}
      height={350}
      data={data}
      margin={{ top: 5, bottom: 30 }}
    >
      <XAxis dataKey="department" tick={<CustomizedAxisTick />} interval={0} />
      <YAxis allowDecimals={false}>
        <Label value="Encounters" angle={-90} position="inside" />
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
