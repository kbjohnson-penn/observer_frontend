import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

// Define the mapping for grouping data types
const DATA_TYPE_GROUPING = {
  provider_view: "egocentric_view",
  patient_view: "egocentric_view",
  room_view: "room_view",
  audio: "audio",
  transcript: "transcript",
  patient_survey: "survey",
  provider_survey: "survey",
  patient_annotation: "annotations",
  provider_annotation: "annotations",
};

// Define colors for the grouped categories
const GROUP_COLORS = {
  egocentric_view: "#4285F4", // Blue
  room_view: "#34A853", // Green
  audio: "#FBBC05", // Yellow
  transcript: "#EA4335", // Red
  survey: "#8F44AD", // Purple
  annotations: "#16A085", // Teal
};

interface GroupedDataItem {
  name: string;
  count: number;
}

interface RawDataItem {
  name: string;
  count: number;
}

interface EncountersByMultiModalDataChartProps {
  data?: RawDataItem[];
  screenWidth?: number;
}

// Function to group the data
const groupData = (data: RawDataItem[]): GroupedDataItem[] => {
  // Initialize with all possible group names and zero counts
  const allGroupNames = Array.from(new Set(Object.values(DATA_TYPE_GROUPING)));
  const groupedData: Record<string, GroupedDataItem> = {};

  // Initialize all possible groups with zero counts
  allGroupNames.forEach((groupName) => {
    groupedData[groupName] = { name: groupName, count: 0 };
  });

  // Process the data we have
  data.forEach((item) => {
    const groupName =
      DATA_TYPE_GROUPING[item.name as keyof typeof DATA_TYPE_GROUPING];
    if (!groupName) {
      console.warn(`No group defined for data type: ${item.name}`);
      return;
    }

    // Groups are already initialized, just add to the count
    groupedData[groupName].count += item.count;
  });

  // Return all groups, even those with zero counts
  return Object.values(groupedData);
};

const CustomizedAxisTick: React.FC<any> = (props) => {
  const { x, y, payload, screenWidth } = props;

  // Split and capitalize words
  const words = payload.value
    .split("_")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1));

  const displayText = words.join(" ");

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  const fontSize = isMobile ? "8px" : isTablet ? "9px" : "10px";
  const lineHeight = parseInt(fontSize) * 1.2;

  // For short text (1-2 words), keep it on one line
  // For longer text, split into two lines
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

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const words = label
      .split("_")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: `1px solid ${
            GROUP_COLORS[label as keyof typeof GROUP_COLORS] || "#ccc"
          }`,
        }}
      >
        <p
          className="text-base font-medium"
          style={{
            color: GROUP_COLORS[label as keyof typeof GROUP_COLORS] || "#ccc",
          }}
        >{`${words}`}</p>
        <p className="text-sm">{`Total: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const EncountersByMultiModalDataChart: React.FC<
  EncountersByMultiModalDataChartProps
> = ({ data = [], screenWidth = 1024 }) => {
  // Group the data
  const groupedData = useMemo(() => groupData(data), [data]);

  // Create a memoized custom tick component with the current screen width
  const CustomTick = useMemo(() => {
    // Give the component a display name to fix the ESLint error
    const TickComponent = (props: any) => (
      <CustomizedAxisTick {...props} screenWidth={screenWidth} />
    );
    TickComponent.displayName = "CustomTick";
    return TickComponent;
  }, [screenWidth]);

  // Sort data by count in descending order
  const sortedData = [...groupedData].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        barGap={5}
        barCategoryGap={20}
        data={sortedData}
        // margin={{ top: 20, right: 20, left: 20, bottom: 50 }}
      >
        <XAxis
          dataKey="name"
          type="category"
          height={60}
          interval={0}
          tick={CustomTick}
          tickMargin={10}
        />
        <YAxis
          type="number"
          allowDecimals={false}
          style={{ fontSize: screenWidth <= 768 ? "10px" : "11px" }}
        >
          <Label
            value="Total Available Data"
            // position="insideLeft"
            angle={-90}
            style={{ fontSize: "12px" }}
            offset={-5}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" barSize={45}>
          {sortedData.map((entry: GroupedDataItem) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={GROUP_COLORS[entry.name as keyof typeof GROUP_COLORS]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncountersByMultiModalDataChart;
