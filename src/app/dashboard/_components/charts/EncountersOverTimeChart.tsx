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
        <p className="intro">{`# of Encounters: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)"
      >
        {new Date(payload.value).toLocaleDateString()}
      </text>
    </g>
  );
};

const EncountersOverTimeChart: React.FC<EncountersOverTimeChartProps> = ({
  data,
}) => (
  <ResponsiveContainer width="100%" height={350}>
    <LineChart width={500} height={350} data={data}>
      <XAxis
        dataKey="date"
        height={60}
        tick={<CustomizedAxisTick />}
        interval={0}
      >
        <Label value="Date" offset={2} position="insideBottomLeft" />
      </XAxis>
      <YAxis allowDecimals={false}>
        <Label value="# of Encounters" angle={-90} position="inside" />
      </YAxis>
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="count" stroke="#3d5afe" />
    </LineChart>
  </ResponsiveContainer>
);

export default EncountersOverTimeChart;
