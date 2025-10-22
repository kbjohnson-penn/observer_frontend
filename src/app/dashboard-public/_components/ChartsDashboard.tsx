"use client";

import React from "react";
import { Box, Text } from "@chakra-ui/react";

import StatCard from "./StatCard";
import EncounterPerDepartmentChart from "./charts/EncounterPerDepartmentChart";
import EncountersByMultiModalDataChart from "./charts/EncountersByMultiModalDataChart";
import EncountersEthnicGroupsChart from "./charts/EncountersEthnicGroupsChart";
import EncountersByRacialGroupChart from "./charts/EncountersByRacialGroupChart";
import SatisfactionChart from "./charts/SatisfactionChart";

import {
  DepartmentAccessCount,
  MultiModalDataCount,
  DemographicCount,
  SatisfactionCount,
} from "@/interfaces/interfaces";

interface ChartsDashboardProps {
  summaryStats: { [key: string]: number };
  departmentCount: number;
  accessControlByDepartment: DepartmentAccessCount[];
  encountersByMultiModalData: MultiModalDataCount[];
  encountersByEthnicGroups: DemographicCount[];
  encountersByRacialGroups: DemographicCount[];
  satisfactionData: SatisfactionCount[];
  departmentColors: { [key: string]: string };
  screenWidth: number;
  isFiltering: boolean;
  filteredEncounterDataLength: number;
  // Add encounters from props to calculate last updated date
  filteredEncounterData: any[];
}

// Function to get the most recent encounter date
const getLastUpdatedDate = (encounters: any[]): string => {
  if (!encounters || encounters.length === 0) {
    return "N/A";
  }

  let latestDate: Date | null = null;

  // Find the most recent encounter date
  encounters.forEach((encounter) => {
    if (encounter.encounter_date_and_time) {
      const encounterDate = new Date(encounter.encounter_date_and_time);

      // Check if this is a valid date
      if (!isNaN(encounterDate.getTime())) {
        if (!latestDate || encounterDate > latestDate) {
          latestDate = encounterDate;
        }
      }
    }
  });

  // Return formatted date or N/A if no valid dates found
  return latestDate ? (latestDate as Date).toLocaleDateString() : "N/A";
};

const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  summaryStats,
  departmentCount,
  accessControlByDepartment,
  encountersByMultiModalData,
  encountersByEthnicGroups,
  encountersByRacialGroups,
  satisfactionData,
  departmentColors,
  screenWidth,
  isFiltering,
  filteredEncounterDataLength,
  filteredEncounterData,
}) => {
  return (
    <Box flex="1" p={{ base: 4, md: 6 }}>
      {/* Last Updated Text */}
      <Box mb={2} textAlign="right">
        <Text fontSize="xs" color="gray.500">
          Last Updated: {getLastUpdatedDate(filteredEncounterData)}
        </Text>
      </Box>

      {/* Summary Statistics Cards */}
      <Box
        display="grid"
        gridTemplateColumns={{
          base: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        }}
        gap={4}
        mb={8}
      >
        <StatCard
          title="Total Encounters"
          value={summaryStats.totalEncounters || 0}
        />
        <StatCard
          title="Total Deidentified"
          value={summaryStats.totalDeidentified || 0}
        />
        <StatCard
          title="Total Access Controlled"
          value={summaryStats.totalAccessControlled || 0}
        />
        <StatCard title="Total Departments" value={departmentCount} />
      </Box>

      {/* No Data Message */}
      {filteredEncounterDataLength === 0 && !isFiltering && (
        <Box
          textAlign="center"
          p={8}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
          mb={8}
        >
          <Text fontSize="lg" color="gray.500">
            No data matches the current filter criteria.
          </Text>
        </Box>
      )}

      {/* Main Charts Section */}
      {(filteredEncounterDataLength > 0 || isFiltering) && (
        <>
          <Box mb={10}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
              Department & Data Visualizations
            </Text>

            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", xl: "repeat(2, 1fr)" }}
              gap={4}
            >
              {/* Encounter Per Department Chart */}
              <Box
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                height="100%"
              >
                <Text fontSize="md" fontWeight="semibold" mb={3}>
                  Encounters by Department
                </Text>
                <EncounterPerDepartmentChart
                  data={accessControlByDepartment}
                  departmentColors={departmentColors}
                  screenWidth={screenWidth}
                />
              </Box>

              {/* Multi-Modal Data Chart */}
              <Box
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                height="100%"
              >
                <Text fontSize="md" fontWeight="semibold" mb={3}>
                  Multi-Modal Data Availability
                </Text>
                <EncountersByMultiModalDataChart
                  data={encountersByMultiModalData}
                  screenWidth={screenWidth}
                />
              </Box>
            </Box>
          </Box>

          {/* Demographics Charts */}
          <Box mb={10}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
              Demographics Analysis
            </Text>

            <Box
              display="grid"
              gridTemplateColumns={{
                base: "1fr",
                xl: "repeat(2, 1fr)",
              }}
              gap={8}
            >
              {/* Ethnic Groups Chart */}
              <Box
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                height="100%"
              >
                <Text fontSize="md" fontWeight="semibold" mb={3}>
                  Ethnic Groups Distribution
                </Text>
                <EncountersEthnicGroupsChart
                  data={encountersByEthnicGroups || []}
                  screenWidth={screenWidth}
                />
              </Box>

              {/* Racial Groups Chart */}
              <Box
                bg="white"
                p={4}
                borderRadius="lg"
                boxShadow="sm"
                height="100%"
              >
                <Text fontSize="md" fontWeight="semibold" mb={3}>
                  Racial Groups Distribution
                </Text>
                <EncountersByRacialGroupChart
                  data={encountersByRacialGroups || []}
                  screenWidth={screenWidth}
                />
              </Box>
            </Box>
          </Box>

          {/* Satisfaction Analysis in a separate row */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
              Patient & Provider Satisfaction
            </Text>

            <Box bg="white" p={4} borderRadius="lg" boxShadow="sm">
              <Text fontSize="md" fontWeight="semibold" mb={3}>
                Satisfaction Analysis
              </Text>
              <Box height={{ base: "350px", md: "400px" }}>
                <SatisfactionChart
                  data={satisfactionData || []}
                  screenWidth={screenWidth}
                />
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChartsDashboard;
