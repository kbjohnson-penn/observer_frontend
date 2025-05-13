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
        <p
          className="text-base font-medium"
          style={{ color: "#CF1259" }}
        >{`${new Date(label).toLocaleDateString()}`}</p>
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

  const date = new Date(payload.value + "T00:00:00Z");
  const zonedDate = toZonedTime(
    date,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Format date as "MMM dd" and "yyyy" for multi-line display
  const month = format(zonedDate, "MMM");
  const day = format(zonedDate, "dd");
  const year = format(zonedDate, "yyyy");

  const fontSize = isMobile ? "9px" : isTablet ? "10px" : "12px";
  const lineHeight = parseInt(fontSize) * 1.2;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="middle" fill="#666" style={{ fontSize }}>
        <tspan x={0} dy="0.6em">{`${month} ${day}`}</tspan>
        <tspan x={0} dy={lineHeight}>
          {year}
        </tspan>
      </text>
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
          top: 20,
          right: 20,
          left: 20,
          bottom: 40,
        }}
      >
        <XAxis
          dataKey="date"
          height={60}
          tick={<CustomizedAxisTick screenWidth={screenWidth} />}
          interval="preserveEnd"
        >
          <Label value="Date" position="bottom" fontSize={14} dy={-16} />
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
