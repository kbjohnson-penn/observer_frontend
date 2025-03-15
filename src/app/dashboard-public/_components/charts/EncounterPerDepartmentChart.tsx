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
  data: {
    department: string;
    accessControlled: number;
    notAccessControlled: number;
  }[];
  departmentColors: { [key: string]: string };
  screenWidth: number;
}

const getBarSize = (screenWidth: number) => {
  if (screenWidth <= 768) return 20;
  if (screenWidth > 768 && screenWidth <= 1024) return 40;
  return 60;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  // Format the label text
  const displayText = payload.value;

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  // Adjust font size based on screen size
  const fontSize = isMobile ? "9px" : isTablet ? "10px" : "12px";
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

const CustomTooltip: React.FC<any> = ({
  active,
  payload,
  label,
  departmentColors,
}) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (acc: number, entry: any) => acc + entry.value,
      0
    );

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
          className="text-base font-medium"
          style={{ color: departmentColors[label] }}
        >{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm">{`${
            entry.name === "accessControlled" ? "Restricted" : "Not Restricted"
          }: ${entry.value}`}</p>
        ))}
        <p className="text-sm">{`Total: ${total}`}</p>
      </div>
    );
  }

  return null;
};

const EncounterPerDepartmentChart: React.FC<
  EncounterPerDepartmentChartProps
> = ({ data, departmentColors, screenWidth }) => {
  const barSize = getBarSize(screenWidth);
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={350}
        data={data}
        barGap={5}
        barCategoryGap={20}
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
        <XAxis
          dataKey="department"
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
            value="Encounters"
            angle={-90}
            style={{ fontSize: "12px" }}
            offset={-5}
          />
        </YAxis>
        <Tooltip
          content={<CustomTooltip departmentColors={departmentColors} />}
        />
        <Bar dataKey="accessControlled" barSize={barSize} stackId="a">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={departmentColors[entry.department]}
            />
          ))}
        </Bar>
        <Bar dataKey="notAccessControlled" barSize={barSize} stackId="a">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#diagonalHatch-${index})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncounterPerDepartmentChart;
