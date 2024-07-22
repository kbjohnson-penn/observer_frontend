import React from "react";
import {
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  Label,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

interface SatisfactionChartProps {
  data: { patientSatisfaction: number; providerSatisfaction: number }[];
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
          className="text-sm"
          style={{ color: colors[0] }}
        >{`Patient Satisfaction : ${payload[0].value}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[1] }}
        >{`Provider Satisfaction : ${payload[0].payload.providerSatisfaction}`}</p>
      </div>
    );
  }

  return null;
};

const SatisfactionChart: React.FC<SatisfactionChartProps> = ({
  data,
  screenWidth,
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart width={400} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="patientSatisfaction"
          name="Patient Satisfaction"
          fontSize={12}
          domain={[0, 100]}
        >
          <Label
            value="Patient Satisfaction (%)"
            offset={-5}
            position="insideBottom"
            fontSize={14}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="providerSatisfaction"
          name="Provider Satisfaction"
          fontSize={12}
          domain={[0, 100]}
        >
          <Label
            value="Provider Satisfaction (%)"
            angle={-90}
            dy={10}
            dx={-10}
            fontSize={14}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Legend
          verticalAlign="top"
          iconSize={12}
          wrapperStyle={{ fontSize: "14px" }}
        />
        <Scatter
          name="Satisfaction Scores"
          data={data}
          fill="#8884d8"
          shape="circle"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default SatisfactionChart;
