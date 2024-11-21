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

interface EncountersEthinicGroupsChartProps {
  data: { name: string; patientCount: number; providerCount: number }[];
  screenWidth: number;
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
        <p
          className="text-base font-medium"
          style={{ color: "#CF1259" }}
        >{`${label}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[0] }}
        >{`Patient: ${payload[0].value}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[1] }}
        >{`Provider: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  let value = payload.value;
  if (value === "Unknown or Not Reported Ethnicity") {
    value = "Unknown";
  }

  const words = value.split(" ");
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
              dy={10}
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

const EncountersEthinicGroupsChart: React.FC<
  EncountersEthinicGroupsChartProps
> = ({ data, screenWidth }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        data={data}
        margin={{
          bottom: 50,
        }}
      >
        <XAxis
          dataKey="name"
          tick={<CustomizedAxisTick screenWidth={screenWidth} />}
          interval={0}
        />
        <YAxis allowDecimals={false} fontSize={12}>
          <Label
            value="Total"
            angle={-90}
            position="inside"
            fontSize={14}
            dx={-10}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Legend
          verticalAlign="top"
          iconSize={12}
          wrapperStyle={{ fontSize: "14px" }}
        />
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

export default EncountersEthinicGroupsChart;
