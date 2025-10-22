import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Label } from 'recharts';

interface EncountersByRacialGroupChartProps {
  data: { name: string; patientCount: number; providerCount: number }[];
  screenWidth?: number;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, colors }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        <p className="text-base font-medium" style={{ color: '#CF1259' }}>{`${label}`}</p>
        <p className="text-sm" style={{ color: colors[0] }}>{`Patient: ${payload[0].value}`}</p>
        <p className="text-sm" style={{ color: colors[1] }}>{`Provider: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const CustomizedAxisTick: React.FC<any> = ({ x, y, payload, screenWidth }) => {
  // Get the original label text
  const displayText = payload.value;

  // Create optimized display text based on specific label values
  // This handles the exact updated labels you provided
  const labelMap: Record<string, string[]> = {
    'American Indian or Alaska Native': ['American', 'Indian or', 'Alaska Native'],
    Asian: ['Asian'],
    'Native Hawaiian or Other Pacific Islander': [
      'Native Hawaiian',
      'or Other',
      'Pacific Islander',
    ],
    'Black or African American': ['Black', 'or', 'African American'],
    White: ['White'],
    'More than One Race': ['More than', 'One Race'],
    Unknown: ['Unknown'],
  };

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  // Adjust font size based on screen size
  const fontSize = isMobile ? '8px' : isTablet ? '9px' : '10px';
  const lineHeight = parseInt(fontSize) * 1.2;

  // Get predefined lines for this label if available
  let lines = labelMap[displayText] || [];

  // If no predefined mapping exists, handle it generically
  if (lines.length === 0) {
    const words = displayText.split(' ');

    if (words.length >= 4) {
      // For very long text, split into 3 lines
      const third = Math.ceil(words.length / 3);
      lines = [
        words.slice(0, third).join(' '),
        words.slice(third, third * 2).join(' '),
        words.slice(third * 2).join(' '),
      ];
    } else if (words.length >= 2) {
      // For medium text, split into 2 lines
      const half = Math.ceil(words.length / 2);
      lines = [words.slice(0, half).join(' '), words.slice(half).join(' ')];
    } else {
      // For short text, keep as is
      lines = [displayText];
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="middle"
        fill="#555"
        style={{ fontSize }}
        // Apply rotation for better spacing if needed
        transform={isMobile && lines.length < 2 ? 'rotate(-30)' : ''}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={0} dy={index === 0 ? '0.6em' : lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const EncountersByRacialGroupChart: React.FC<EncountersByRacialGroupChartProps> = ({
  data,
  screenWidth = 1024,
}) => {
  // Increase the chart height based on the number of X-axis labels
  // Long labels with multiple lines need more vertical space
  const baseHeight = 350;
  const hasLongLabels = data.some((item) =>
    [
      'American Indian or Alaska Native',
      'Native Hawaiian or Other Pacific Islander',
      'Black or African American',
    ].includes(item.name)
  );

  // Calculate dynamic height - more height for charts with long labels
  const dynamicHeight = hasLongLabels ? Math.max(baseHeight, 320 + data.length * 10) : baseHeight;

  // Calculate the appropriate bar category gap
  // For your specific labels, use targeted values
  const categoryGap =
    data.length <= 7
      ? screenWidth <= 768
        ? 8
        : screenWidth <= 1024
          ? 15
          : 22
      : screenWidth <= 768
        ? 10
        : 20;

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart
        width={500}
        height={dynamicHeight}
        data={data}
        barGap={5}
        barCategoryGap={categoryGap}
      >
        <XAxis
          dataKey="name"
          height={90} // Adequate height for the X-axis with line breaks
          tick={<CustomizedAxisTick screenWidth={screenWidth} />}
          tickMargin={12} // Moderate tick margin
          interval={0}
        />
        <YAxis allowDecimals={false} style={{ fontSize: screenWidth <= 768 ? '10px' : '11px' }}>
          <Label value="Total" angle={-90} style={{ fontSize: '11px' }} offset={-5} />
        </YAxis>
        <Tooltip content={<CustomTooltip colors={['#8884d8', '#82ca9d']} />} />
        <Legend
          verticalAlign="top"
          iconSize={12}
          wrapperStyle={{ fontSize: '12px', marginBottom: '5px' }}
        />
        <Bar
          dataKey="patientCount"
          name="Patients"
          stackId="a"
          fill="#8884d8"
          barSize={screenWidth <= 768 ? 28 : 34} // Slightly smaller bars to allow more space between them
        />
        <Bar
          dataKey="providerCount"
          name="Providers"
          stackId="a"
          fill="#82ca9d"
          barSize={screenWidth <= 768 ? 28 : 34}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EncountersByRacialGroupChart;
