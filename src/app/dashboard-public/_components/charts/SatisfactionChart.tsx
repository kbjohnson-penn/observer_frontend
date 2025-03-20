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
  data: {
    patientSatisfaction: number;
    providerSatisfaction: number;
    count?: number;
  }[];
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
        >{`Encounters: ${payload[0].payload.count}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[0] }}
        >{`Patient Satisfaction: ${payload[0].value}`}</p>
        <p
          className="text-sm"
          style={{ color: colors[1] }}
        >{`Provider Satisfaction: ${payload[0].payload.providerSatisfaction}`}</p>
      </div>
    );
  }

  return null;
};

const SatisfactionChart: React.FC<SatisfactionChartProps> = ({
  data,
  screenWidth = 1024,
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart width={400} height={400}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="patientSatisfaction"
          name="Patient Satisfaction"
          style={{ fontSize: screenWidth <= 768 ? "11px" : "12px" }}
          domain={[0, 100]}
        >
          <Label
            value="Patient Satisfaction (%)"
            offset={-5}
            position="insideBottom"
            style={{ fontSize: "12px" }}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="providerSatisfaction"
          name="Provider Satisfaction"
          style={{ fontSize: screenWidth <= 768 ? "11px" : "12px" }}
          domain={[0, 100]}
        >
          <Label
            value="Provider Satisfaction (%)"
            angle={-90}
            style={{ fontSize: "12px" }}
            offset={-5}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={["#8884d8", "#82ca9d"]} />} />
        <Scatter
          name="Satisfaction Scores"
          data={data}
          fill="#8884d8"
          shape="circle"
          legendType="circle"
        ></Scatter>
        <Legend
          verticalAlign="bottom"
          align="right"
          iconSize={12}
          wrapperStyle={{ fontSize: "12px" }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default SatisfactionChart;
