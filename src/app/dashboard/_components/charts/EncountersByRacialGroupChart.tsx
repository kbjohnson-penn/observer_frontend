import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Label,
} from "recharts";

interface EncountersByRacialGroupChartProps {
  data: { name: string; patientCount: number; providerCount: number }[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, colors }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        <p className="label">
          <strong>{`${label}`}</strong>
        </p>
        <p
          className="intro"
          style={{ color: colors[0] }}
        >{`# Patient: ${payload[0].value}`}</p>
        <p
          className="intro"
          style={{ color: colors[1] }}
        >{`# Provider: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  let value = payload.value;
  if (value === "Unknown or Not Reported") {
    value = "Unknown";
  }

  const words = value.split(" ");

  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word: string, index: number) => (
        <text
          x={0}
          y={index * 16}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {word}
        </text>
      ))}
    </g>
  );
};

const EncountersByRacialGroupChart: React.FC<
  EncountersByRacialGroupChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        data={data}
        margin={{
          top: 5,
          bottom: 50,
        }}
      >
        <XAxis dataKey="name" tick={<CustomizedAxisTick />} interval={0} />
        <YAxis allowDecimals={false}>
          <Label value="Total" angle={-90} position="inside" />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Legend verticalAlign="top" />
        <Bar
          dataKey="patientCount"
          name="Patients"
          stackId="a"
          fill="#8884d8"
        />
        <Bar
          dataKey="providerCount"
          name="Providers"
          stackId="a"
          fill="#82ca9d"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncountersByRacialGroupChart;
