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
  screenWidth?: number;
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
  // Format the label text
  let displayText = payload.value;
  if (displayText === "Unknown or Not Reported Ethnicity") {
    displayText = "Unknown";
  }

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  // Adjust font size based on screen size
  const fontSize = isMobile ? "8px" : isTablet ? "9px" : "10px";
  const lineHeight = parseInt(fontSize) * 1.2;

  // For short text (1-2 words), keep it on one line
  // For longer text, split into multiple lines
  const shouldSplit = displayText.length > 14;

  let firstLine = displayText;
  let secondLine = "";

  if (shouldSplit) {
    // Find a space near the middle to split on
    const middle = Math.floor(displayText.length / 2);
    let splitIndex = displayText.lastIndexOf(" ", middle);

    if (splitIndex === -1) {
      splitIndex = displayText.indexOf(" ", middle);
    }

    if (splitIndex !== -1) {
      firstLine = displayText.substring(0, splitIndex);
      secondLine = displayText.substring(splitIndex + 1);
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="middle" fill="#555" style={{ fontSize }}>
        <tspan x={0} dy="0.6em">
          {firstLine}
        </tspan>
        {secondLine && (
          <tspan x={0} dy={lineHeight}>
            {secondLine}
          </tspan>
        )}
      </text>
    </g>
  );
};

const EncountersEthinicGroupsChart: React.FC<
  EncountersEthinicGroupsChartProps
> = ({ data, screenWidth = 1024 }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        data={data}
        barGap={5}
        barCategoryGap={20}
      >
        <XAxis
          dataKey="name"
          height={60}
          tick={<CustomizedAxisTick screenWidth={screenWidth} />}
          tickMargin={10}
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          style={{ fontSize: screenWidth <= 768 ? "11px" : "12px" }}
        >
          <Label
            value="Total"
            angle={-90}
            style={{ fontSize: "12px" }}
            offset={-5}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Legend
          verticalAlign="top"
          iconSize={12}
          wrapperStyle={{ fontSize: "12px", marginBottom: "10px" }}
        />
        <Bar
          dataKey="patientCount"
          name="Patients"
          stackId="a"
          fill="#8884d8"
          barSize={38}
        />
        <Bar
          dataKey="providerCount"
          name="Providers"
          stackId="a"
          fill="#82ca9d"
          barSize={38}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncountersEthinicGroupsChart;
