import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Legend,
} from "recharts";

import { format, toZonedTime } from "date-fns-tz";

interface EncountersOverTimeChartProps {
  data: any[];
  screenWidth: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, colors }) => {
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
        <p className="text-base font-medium">{`${new Date(
          label
        ).toLocaleDateString()}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[0] }}
        >{`Encounters: ${payload[0].value}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[1] }}
        >{`Cumulative Encounters: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  const date = new Date(payload.value + 'T00:00:00Z');
  const zonedDate = toZonedTime(date, Intl.DateTimeFormat().resolvedOptions().timeZone);

  const displayDate = format(zonedDate, 'MMM dd, yyyy');

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
          {displayDate}
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
          {displayDate}
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
          {displayDate}
        </text>
      )}
    </g>
  );
};

const EncountersOverTimeChart: React.FC<EncountersOverTimeChartProps> = ({
  data,
  screenWidth,
}) => {
  return (
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
          interval="preserveEnd"
        >
          <Label value="Date" position="insideBottom" fontSize={14} />
        </XAxis>
        <YAxis yAxisId="left" allowDecimals={false} fontSize={12}>
          <Label
            value="Encounters"
            angle={-90}
            position="inside"
            fontSize={14}
            dx={-10}
          />
        </YAxis>
        <YAxis yAxisId="right" orientation="right" fontSize={12}>
          <Label
            value="Cumulative Encounters"
            angle={-90}
            position="inside"
            fontSize={14}
            dx={10}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativeCount"
          stroke="#82ca9d"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EncountersOverTimeChart;
