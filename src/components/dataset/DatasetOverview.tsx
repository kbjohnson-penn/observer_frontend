'use client';

import React from 'react';
import { Box, Text, Grid, Spinner } from '@chakra-ui/react';
import type { DatasetStats } from '@/interfaces/observer-omop';
import COLORS from '@/constants/colors';

interface StatItemProps {
  value: number | string;
  label: string;
  color: string;
  isLoading?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, color, isLoading }) => (
  <Box textAlign="center">
    <Text fontSize="3xl" fontWeight="bold" color={color}>
      {isLoading ? <Spinner size="md" color={color} /> : value}
    </Text>
    <Text color="gray.600" fontSize="sm" fontWeight="medium">
      {label}
    </Text>
  </Box>
);

interface DatasetOverviewProps {
  stats: DatasetStats;
  isLoading: boolean;
}

const DatasetOverview: React.FC<DatasetOverviewProps> = ({ stats, isLoading }) => {
  const statItems = [
    {
      value: stats.totalTables,
      label: 'OMOP Tables',
      color: COLORS.primary[500],
    },
    {
      value: stats.totalVisits,
      label: 'Clinical Visits',
      color: COLORS.primary[500],
    },
    {
      value: stats.totalVideos,
      label: 'Video Files',
      color: COLORS.primary[500],
    },
    {
      value: stats.totalRecords,
      label: 'Total Records',
      color: COLORS.primary[500],
    },
  ];

  return (
    <Box p={6}>
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
        gap={6}
      >
        {statItems.map((item, index) => (
          <StatItem
            key={index}
            value={item.value}
            label={item.label}
            color={item.color}
            isLoading={isLoading}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default DatasetOverview;
