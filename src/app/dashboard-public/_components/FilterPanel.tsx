"use client";

import React, { useCallback } from "react";
import { Box, Flex, Text, Button, Checkbox } from "@chakra-ui/react";
import Select, { MultiValue, SingleValue } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  SOURCE_OPTIONS,
  DEIDENTIFIED_OPTIONS,
  EXPORT_OPTIONS,
} from "@/constants";

interface DropDownOption {
  value: string;
  label: string;
}

interface FilterPanelProps {
  selectedSources: DropDownOption[];
  isDeidentified: boolean | null;
  isDatePickerEnabled: boolean;
  startDate: Date;
  endDate: Date;
  exportFormat: string;
  isFiltering: boolean;
  onSourceChange: (selectedOptions: MultiValue<DropDownOption> | null) => void;
  onIsDeidentifiedChange: (
    selectedOption: SingleValue<{ value: boolean | null; label: string }>
  ) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onFormatChange: (selectedOption: SingleValue<DropDownOption>) => void;
  onExportClick: () => void;
  onToggleDateFilter: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedSources,
  isDeidentified,
  isDatePickerEnabled,
  startDate,
  endDate,
  exportFormat,
  isFiltering,
  onSourceChange,
  onIsDeidentifiedChange,
  onStartDateChange,
  onEndDateChange,
  onFormatChange,
  onExportClick,
  onToggleDateFilter,
}) => {
  return (
    <Box
      width={{ base: "100%", lg: "300px" }}
      bg="white"
      p={5}
      borderBottomWidth={{ base: "1px", lg: 0 }}
      borderRightWidth={{ base: 0, lg: "1px" }}
      borderColor="gray.200"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Filters
      </Text>

      {/* Source Filter */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
          Source
        </Text>
        <Select
          options={SOURCE_OPTIONS}
          onChange={onSourceChange}
          isMulti
          value={selectedSources}
          placeholder="Filter by Source"
          className="filter-select"
          classNamePrefix="react-select"
          isDisabled={isFiltering}
        />
      </Box>

      {/* De-identified Data Filter */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
          De-identified Data
        </Text>
        <Select
          options={DEIDENTIFIED_OPTIONS}
          onChange={onIsDeidentifiedChange}
          placeholder="Filter by De-identified Data"
          className="filter-select"
          classNamePrefix="react-select"
          isDisabled={isFiltering}
        />
      </Box>

      {/* Date Range Filter */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
          Date Range
        </Text>
        <Flex mb={2} alignItems="center">
          <Checkbox.Root
            checked={isDatePickerEnabled}
            onChange={onToggleDateFilter}
            id="date-filter-toggle"
            variant={"solid"}
            colorPalette={"blue"}
            disabled={isFiltering}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              <Text fontSize="sm" color="gray.600">
                Enable Date Filter
              </Text>
            </Checkbox.Label>
          </Checkbox.Root>
        </Flex>

        <Box mb={3}>
          <Text fontSize="sm" mb={1} color="gray.600">
            Start Date
          </Text>
          <Box position="relative" className="date-picker-container">
            <DatePicker
              selected={startDate}
              onChange={onStartDateChange}
              disabled={!isDatePickerEnabled || isFiltering}
              className="date-picker w-full"
              dateFormat="yyyy-MM-dd"
              wrapperClassName="date-picker-wrapper"
              maxDate={endDate}
            />
          </Box>
        </Box>

        <Box>
          <Text fontSize="sm" mb={1} color="gray.600">
            End Date
          </Text>
          <Box position="relative" className="date-picker-container">
            <DatePicker
              selected={endDate}
              onChange={onEndDateChange}
              disabled={!isDatePickerEnabled || isFiltering}
              className="date-picker w-full"
              dateFormat="yyyy-MM-dd"
              wrapperClassName="date-picker-wrapper"
              minDate={startDate}
            />
          </Box>
        </Box>
      </Box>

      {/* Export Data Section */}
      <Box mt={8} pt={6} borderTopWidth="1px" borderColor="gray.200">
        <Text fontSize="md" fontWeight="bold" mb={3}>
          Export Data
        </Text>
        <Box mb={3}>
          <Select
            options={EXPORT_OPTIONS}
            onChange={onFormatChange}
            placeholder="Select Format"
            className="filter-select"
            classNamePrefix="react-select"
            isDisabled={isFiltering}
          />
        </Box>
        <Button
          onClick={onExportClick}
          disabled={!exportFormat || isFiltering}
          width="full"
          py={2}
          px={4}
          borderRadius="md"
          color="white"
          bg={exportFormat && !isFiltering ? "blue.500" : "gray.300"}
          _hover={exportFormat && !isFiltering ? { bg: "blue.600" } : {}}
          cursor={exportFormat && !isFiltering ? "pointer" : "not-allowed"}
        >
          {isFiltering ? "Filtering..." : "Export Data"}
        </Button>
      </Box>
    </Box>
  );
};

export default FilterPanel;
