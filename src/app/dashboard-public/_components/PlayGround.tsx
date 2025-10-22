"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { MultiValue, SingleValue } from "react-select";

import FilterPanel from "./FilterPanel";
import ChartsDashboard from "./ChartsDashboard";

import { PublicDepartmentDataType } from "@/interfaces/department";
import { PublicPatientDataType } from "@/interfaces/patient";
import { PublicProviderDataType } from "@/interfaces/provider";
import { PublicMultiModalDataType } from "@/interfaces/mmd";
import {
  PublicEncounterDataType,
  CombinedDataType,
} from "@/interfaces/encounter";
import { DropDownOption } from "@/interfaces/interfaces";

import {
  getSummaryStats,
  getAccessControlByDepartment,
  getEncountersByMultiModalData,
  getEncountersByEthnicGroups,
  getEncountersByRacialGroups,
  getSatisfactionData,
  compileData,
  downloadData,
} from "@/lib/utils/utils";

// Define interfaces for state and props
interface PlayGroundProps {
  patients: PublicPatientDataType[];
  providers: PublicProviderDataType[];
  departments: PublicDepartmentDataType[];
  encounters: PublicEncounterDataType[];
  multiModalData: PublicMultiModalDataType[];
  departmentColors: { [key: string]: string };
}

interface FilterState {
  selectedSources: DropDownOption[];
  isDeidentified: boolean | null;
  isDatePickerEnabled: boolean;
  startDate: Date;
  endDate: Date;
}

const PlayGround: React.FC<PlayGroundProps> = ({
  patients,
  providers,
  departments,
  encounters,
  multiModalData,
  departmentColors,
}) => {
  // Set initial dates - start date to 30 days ago, end date to today
  const initialStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    selectedSources: [],
    isDeidentified: null,
    isDatePickerEnabled: false,
    startDate: initialStartDate,
    endDate: new Date(),
  });

  // Destructure filter state for easier access
  const {
    selectedSources,
    isDeidentified,
    isDatePickerEnabled,
    startDate,
    endDate,
  } = filterState;

  // Data state
  const [summaryStats, setSummaryStats] = useState<{ [key: string]: number }>(
    {}
  );
  const [filteredEncounterData, setFilteredEncounterData] = useState<
    PublicEncounterDataType[]
  >([]);
  const [exportFormat, setExportFormat] = useState<string>("");
  const [exportData, setExportData] = useState<CombinedDataType[]>([]);
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Memoized derived data for visualizations
  const accessControlByDepartment = useMemo(
    () => getAccessControlByDepartment(filteredEncounterData, departments),
    [filteredEncounterData, departments]
  );

  const encountersByMultiModalData = useMemo(
    () => getEncountersByMultiModalData(filteredEncounterData, multiModalData),
    [filteredEncounterData, multiModalData]
  );

  const encountersByEthnicGroups = useMemo(
    () =>
      getEncountersByEthnicGroups(filteredEncounterData, patients, providers),
    [filteredEncounterData, patients, providers]
  );

  const encountersByRacialGroups = useMemo(
    () =>
      getEncountersByRacialGroups(filteredEncounterData, patients, providers),
    [filteredEncounterData, patients, providers]
  );

  const satisfactionData = useMemo(() => {
    const encountersWithSatisfaction = filteredEncounterData.filter(
      (encounter) =>
        typeof encounter.patient_satisfaction !== "undefined" &&
        typeof encounter.provider_satisfaction !== "undefined"
    );
    return getSatisfactionData(encountersWithSatisfaction);
  }, [filteredEncounterData]);

  // Memoized calculation for department counts
  const departmentCount = useMemo(() => departments.length, [departments]);

  // Helper function to normalize dates for comparison
  const normalizeDate = useCallback((date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }, []);

  // Event handlers with proper typing
  const handleSourceChange = useCallback(
    (selectedOptions: MultiValue<DropDownOption> | null) => {
      setFilterState((prev) => ({
        ...prev,
        selectedSources: selectedOptions ? Array.from(selectedOptions) : [],
      }));
    },
    []
  );

  const handleIsDeidentifiedChange = useCallback(
    (selectedOption: SingleValue<{ value: boolean | null; label: string }>) => {
      setFilterState((prev) => ({
        ...prev,
        isDeidentified: selectedOption?.value ?? null,
      }));
    },
    []
  );

  const handleStartDateChange = useCallback((date: Date) => {
    setFilterState((prev) => ({
      ...prev,
      startDate: date,
    }));
  }, []);

  const handleEndDateChange = useCallback((date: Date) => {
    setFilterState((prev) => ({
      ...prev,
      endDate: date,
    }));
  }, []);

  const handleFormatChange = useCallback(
    (selectedOption: SingleValue<DropDownOption>) => {
      if (selectedOption) {
        setExportFormat(selectedOption.value);
      }
    },
    []
  );

  const handleExportClick = useCallback(() => {
    if (exportFormat) {
      downloadData(exportData, exportFormat);
    }
  }, [exportData, exportFormat]);

  const toggleDateFilter = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      isDatePickerEnabled: !prev.isDatePickerEnabled,
    }));
  }, []);

  // Handle screen width for responsive design
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };

      setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Calculate summary stats
  useEffect(() => {
    setSummaryStats(getSummaryStats(encounters));
  }, [encounters]);

  // Filter encounters based on selected criteria
  useEffect(() => {
    const performFiltering = () => {
      setIsLoading(true);

      try {
        const normalizedStartDate = normalizeDate(startDate);
        const normalizedEndDate = new Date(normalizeDate(endDate));
        // Set end date to end of day for inclusive filtering
        normalizedEndDate.setHours(23, 59, 59, 999);

        const updatedEncounterData = encounters.filter((encounter) => {
          // Source filter check
          const sourceFilterPassed =
            selectedSources.length === 0 ||
            selectedSources.some(
              (source) => source.value === encounter.encounter_source
            );

          // De-identified filter check
          const deidentifiedFilterPassed =
            isDeidentified === null ||
            encounter.is_deidentified === isDeidentified;

          // Date filter check
          let dateFilterPassed = true;

          if (isDatePickerEnabled && encounter.encounter_date_and_time) {
            try {
              // Parse the encounter date
              const encounterDate = new Date(encounter.encounter_date_and_time);

              // Check if the date is valid
              if (isNaN(encounterDate.getTime())) {
                dateFilterPassed = false;
              } else {
                // Normalize the encounter date for comparison
                const normalizedEncounterDate = normalizeDate(encounterDate);

                // Check if encounter date is within selected range
                dateFilterPassed =
                  normalizedEncounterDate >= normalizedStartDate &&
                  normalizedEncounterDate <= normalizedEndDate;
              }
            } catch {
              // Error parsing date - skip this entry
              dateFilterPassed = false;
            }
          }

          // Return true only if all filters pass
          return (
            sourceFilterPassed && deidentifiedFilterPassed && dateFilterPassed
          );
        });

        setFilteredEncounterData(updatedEncounterData);
      } catch {
        // Error filtering data - return original data
        // Reset to all encounters if there's an error
        setFilteredEncounterData(encounters);
      } finally {
        setIsLoading(false);
      }
    };

    // Use requestAnimationFrame to prevent blocking the UI during filtering
    const timeoutId = setTimeout(performFiltering, 0);
    return () => clearTimeout(timeoutId);
  }, [
    selectedSources,
    isDeidentified,
    isDatePickerEnabled,
    startDate,
    endDate,
    encounters,
    normalizeDate,
  ]);

  // Export data preparation
  useEffect(() => {
    if (exportFormat) {
      setExportData(
        compileData(
          filteredEncounterData,
          patients,
          providers,
          multiModalData,
          exportFormat
        )
      );
    }
  }, [
    filteredEncounterData,
    exportFormat,
    patients,
    providers,
    multiModalData,
  ]);

  // Loading state to prevent UI blocking during filtering
  const isFiltering = isLoading;

  return (
    <Box
      className="dashboard-content"
      bg="gray.50"
      borderRadius="xl"
      overflow="hidden"
    >
      {/* Dashboard Layout with Sidebar and Main Content */}
      <Flex direction={{ base: "column", lg: "row" }}>
        {/* Filters Sidebar */}
        <FilterPanel
          selectedSources={selectedSources}
          isDatePickerEnabled={isDatePickerEnabled}
          startDate={startDate}
          endDate={endDate}
          exportFormat={exportFormat}
          isFiltering={isFiltering}
          onSourceChange={handleSourceChange}
          onIsDeidentifiedChange={handleIsDeidentifiedChange}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onFormatChange={handleFormatChange}
          onExportClick={handleExportClick}
          onToggleDateFilter={toggleDateFilter}
        />

        {/* Main Dashboard Content */}
        <ChartsDashboard
          summaryStats={summaryStats}
          departmentCount={departmentCount}
          accessControlByDepartment={accessControlByDepartment}
          encountersByMultiModalData={encountersByMultiModalData}
          encountersByEthnicGroups={encountersByEthnicGroups}
          encountersByRacialGroups={encountersByRacialGroups}
          satisfactionData={satisfactionData}
          departmentColors={departmentColors}
          screenWidth={screenWidth}
          isFiltering={isFiltering}
          filteredEncounterDataLength={filteredEncounterData.length}
          filteredEncounterData={filteredEncounterData}
        />
      </Flex>
    </Box>
  );
};

export default PlayGround;
