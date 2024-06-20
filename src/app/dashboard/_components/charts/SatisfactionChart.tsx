import {
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  Scatter,
  Label,
  ResponsiveContainer,
} from "recharts";

interface SatisfactionChartProps {
  data: { patientSatisfaction: number; providerSatisfaction: number }[];
}
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
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
        <p className="label">{`Patient Satisfaction : ${payload[0].value}`}</p>
        <p className="intro">{`Provider Satisfaction : ${payload[0].payload.providerSatisfaction}`}</p>
      </div>
    );
  }

  return null;
};
const SatisfactionChart: React.FC<SatisfactionChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart width={400} height={400}>
        <XAxis
          dataKey="patientSatisfaction"
          name="Patient Satisfaction"
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          fontSize={14}
        >
          <Label
            value="Patient Satisfaction"
            offset={-5}
            position="insideBottom"
          />
        </XAxis>
        <YAxis
          dataKey="providerSatisfaction"
          name="Provider Satisfaction"
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          fontSize={14}
        >
          <Label value="Provider Satisfaction" angle={-90} dy={10} dx={-10} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default SatisfactionChart;
