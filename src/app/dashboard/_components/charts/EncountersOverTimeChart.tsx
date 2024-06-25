import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Label,
} from "recharts";

interface EncountersOverTimeChartProps {
  data: any[];
  screenWidth: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ddd",
        }}
      >
        <p className="label">{`${new Date(label).toLocaleDateString()}`}</p>
        <p className="intro">{`Encounters: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  return (
    <g transform={`translate(${x},${y})`}>
      {isMobile ? (
        <text
          x={0}
          y={0}
          dy={8}
          textAnchor="end"
          fill="#666"
          transform="rotate(-30)"
          fontSize={10}
        >
          {new Date(payload.value).toLocaleDateString()}
        </text>
      ) : isTablet ? (
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-45)"
          fontSize={12}
        >
          {new Date(payload.value).toLocaleDateString()}
        </text>
      ) : (
        <text
          x={0}
          y={0}
          dy={8}
          textAnchor="end"
          fill="#666"
          transform="rotate(-30)"
          fontSize={12}
        >
          {new Date(payload.value).toLocaleDateString()}
        </text>
      )}
    </g>
  );
};

const EncountersOverTimeChart: React.FC<EncountersOverTimeChartProps> = ({
  data,
  screenWidth,
}) => (
  <ResponsiveContainer width="100%" height={350}>
    <LineChart
      width={500}
      height={350}
      data={data}
      margin={{
        top: 0,
        bottom: 0,
        right: 5,
      }}
    >
      <XAxis
        dataKey="date"
        height={60}
        tick={<CustomizedAxisTick screenWidth={screenWidth} />}
        interval="equidistantPreserveStart"
      >
        <Label value="Date" position="insideBottom" fontSize={14} />
      </XAxis>
      <YAxis allowDecimals={false} fontSize={12}>
        <Label
          value="Encounters"
          angle={-90}
          position="inside"
          fontSize={14}
          dx={-10}
        />
      </YAxis>
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="count" stroke="#3d5afe" />
    </LineChart>
  </ResponsiveContainer>
);

export default EncountersOverTimeChart;
