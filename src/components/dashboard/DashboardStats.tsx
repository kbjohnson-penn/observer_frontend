'use client';

import React from 'react';
import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import { FaDatabase, FaUsers, FaFilter } from 'react-icons/fa';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.3s"
      height="100%"
      className="hover:-translate-y-1 hover:shadow-md"
      border="1px"
      borderColor="gray.200"
    >
      <Flex direction="column" align="start" height="100%" position="relative">
        <Text
          fontSize="sm"
          fontWeight="medium"
          color="gray.500"
          mb={2}
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {title}
        </Text>

        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color={color}
          mt="auto"
          pt={2}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>

        <Box position="absolute" top={4} right={4} color={color} opacity={0.2} fontSize="3xl">
          {icon}
        </Box>
      </Flex>
    </Box>
  );
};

interface DashboardStatsProps {
  totalVisits?: number;
  cohortCount?: number;
  filterCount?: number;
  isLoading?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalVisits = 0,
  cohortCount = 0,
  filterCount = 0,
  isLoading = false,
}) => {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
      }}
      gap={6}
      mb={8}
    >
      <StatCard
        title="Total Visits"
        value={isLoading ? '...' : totalVisits}
        icon={<FaDatabase />}
        color="blue.600"
      />
      <StatCard
        title="Saved Cohorts"
        value={isLoading ? '...' : cohortCount}
        icon={<FaUsers />}
        color="green.600"
      />
      <StatCard
        title="Available Filters"
        value={isLoading ? '...' : filterCount}
        icon={<FaFilter />}
        color="purple.600"
      />
    </Grid>
  );
};

export default DashboardStats;
