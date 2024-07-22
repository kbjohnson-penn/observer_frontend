"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  PatientDataType,
  ProviderDataType,
  EncounterSourceDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncounterDataType,
  EncounterSimCenterDataType,
  EncounterRIASDataType,
  CombinedEncounterDataType,
  CombinedDataType,
} from "../../../interfaces/interfaces";
import StatCard from "./StatCard";
import EncounterPerDepartmentChart from "./charts/EncounterPerDepartmentChart";
import EncountersByMultiModalDataChart from "./charts/EncountersByMultiModalDataChart";
import EncountersOverTimeChart from "./charts/EncountersOverTimeChart";
import EncountersEthnicGroupsChart from "./charts/EncountersEthnicGroupsChart";
import EncountersByRacialGroupChart from "./charts/EncountersByRacialGroupChart";
import SatisfactionChart from "./charts/SatisfactionChart";
import {
  SOURCE_OPTIONS,
  DEIDENTIFIED_OPTIONS,
  EXPORT_OPTIONS,
} from "../../../constants";
import {
  getSummaryStats,
  getEncounterPerDepartment,
  getEncountersByAccess,
  getAccessControlByDepartment,
  getEncountersByMultiModalData,
  getEncountersOverTime,
  getEncountersByEthnicGroups,
  getEncountersByRacialGroups,
  getSatisfactionData,
  compileData,
  downloadData,
} from "../../../lib/utils";

interface PlayGroundProps {
  patientsData: PatientDataType[];
  providersData: ProviderDataType[];
  encounterSourceData: EncounterSourceDataType[];
  departmentData: DepartmentDataType[];
  multiModalDataPathsData: MultiModalDataPathsDataType[];
  encounterData: EncounterDataType[];
  encounterSimCenterData: EncounterSimCenterDataType[];
  encounterRIASData: EncounterRIASDataType[];
  departmentColors: { [key: string]: string };
}

interface DropDownOption {
  value: string;
  label: string;
}

const dropDownSelectStyle = {
  control: (provided: any) => ({
    ...provided,
    fontSize: "14px",
  }),
  option: (provided: any) => ({
    ...provided,
    fontSize: "14px",
  }),
};

const PlayGround: React.FC<PlayGroundProps> = ({
  patientsData,
  providersData,
  encounterSourceData,
  departmentData,
  multiModalDataPathsData,
  encounterData,
  encounterSimCenterData,
  encounterRIASData,
  departmentColors,
}) => {
  const [selectedSources, setSelectedSources] = useState<DropDownOption[]>([]);
  const [isDeidentified, setIsDeidentified] = useState<boolean | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isDatePickerEnabled, setIsDatePickerEnabled] = useState(false);
  const [summaryStats, setSummaryStats] = useState<{ [key: string]: number }>(
    {}
  );
  const [filteredEncounterData, setFilteredEncounterData] = useState<
    CombinedEncounterDataType[]
  >([]);
  const [encounterPerDepartment, setEncounterPerDepartment] = useState<
    { department: string; count: number }[]
  >([]);
  const [encountersByAccess, setEncountersByAccess] = useState<
    {
      access: string;
      count: number;
    }[]
  >([]);
  const [accessControlByDepartment, setAccessControlByDepartment] = useState<
    {
      department: string;
      accessControlled: number;
      notAccessControlled: number;
    }[]
  >([]);
  const [encountersByMultiModalData, setEncountersByMultiModalData] =
    useState<{ name: string; count: number }[]>();
  const [encountersOverTime, setEncountersOverTime] = useState<
    { date: string; count: number }[]
  >([]);
  const [encountersByEthnicGroups, setEncountersByEthnicGroups] =
    useState<{ name: string; patientCount: number; providerCount: number }[]>();

  const [encountersByRacialGroups, setEncountersByRacialGroups] =
    useState<{ name: string; patientCount: number; providerCount: number }[]>();

  const [satisfactionData, setSatisfactionData] = useState<
    {
      patientSatisfaction: number;
      providerSatisfaction: number;
    }[]
  >();

  const [exportFormat, setExportFormat] = useState<string>("");
  const [exportData, setExportData] = useState<CombinedDataType[]>([]);

  const [screenWidth, setScreenWidth] = useState(0);

  const handleSourceChange = (selectedOptions: any) => {
    if (selectedOptions === null) {
      setSelectedSources([]);
    } else {
      setSelectedSources(selectedOptions);
    }
  };

  const handleIsDeidentifiedChange = (selectedOption: any) => {
    setIsDeidentified(selectedOption.value);
  };

  const handleFormatChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (selectedOption) {
      setExportFormat(selectedOption.value);
    }
  };

  const handleExportClick = () => {
    downloadData(exportData, exportFormat);
  };

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

  useEffect(() => {
    const allEncounterData = [
      ...encounterData,
      ...encounterSimCenterData,
      ...encounterRIASData,
    ];
    setSummaryStats(getSummaryStats(allEncounterData));
  }, [encounterData, encounterSimCenterData, encounterRIASData]);

  useEffect(() => {
    const allEncounterData = [
      ...encounterData,
      ...encounterSimCenterData,
      ...encounterRIASData,
    ];

    if (selectedSources === null) {
      setFilteredEncounterData([]);
    } else {
      const updatedEncounterData = allEncounterData.filter((encounter) => {
        const encounterDate =
          "encounter_date_and_time" in encounter &&
          encounter.encounter_date_and_time
            ? new Date((encounter as EncounterDataType).encounter_date_and_time)
            : null;

        return (
          (selectedSources.length === 0 ||
            selectedSources.some(
              (source) => source.value === encounter.encounter_source
            )) &&
          (isDeidentified === null ||
            encounter.is_deidentified === isDeidentified) &&
          (!isDatePickerEnabled ||
            (encounterDate &&
              startDate <= encounterDate &&
              encounterDate <= endDate))
        );
      });
      setFilteredEncounterData(updatedEncounterData);
    }
  }, [
    selectedSources,
    isDeidentified,
    isDatePickerEnabled,
    startDate,
    endDate,
    encounterData,
    encounterSimCenterData,
    encounterRIASData,
  ]);

  useEffect(() => {
    setEncounterPerDepartment(
      getEncounterPerDepartment(filteredEncounterData, departmentData)
    );
    setEncountersByAccess(getEncountersByAccess(filteredEncounterData));

    setAccessControlByDepartment(
      getAccessControlByDepartment(filteredEncounterData, departmentData)
    );

    setEncountersByMultiModalData(
      getEncountersByMultiModalData(
        filteredEncounterData,
        multiModalDataPathsData
      )
    );
    setEncountersOverTime(
      getEncountersOverTime(
        filteredEncounterData.filter(
          (encounter) =>
            "encounter_date_and_time" in encounter &&
            encounter.encounter_date_and_time
        ) as EncounterDataType[]
      )
    );
    setEncountersByEthnicGroups(
      getEncountersByEthnicGroups(
        filteredEncounterData,
        patientsData,
        providersData
      )
    );
    setEncountersByRacialGroups(
      getEncountersByRacialGroups(
        filteredEncounterData,
        patientsData,
        providersData
      )
    );
    setSatisfactionData(
      getSatisfactionData(
        filteredEncounterData.filter(
          (encounter) =>
            "patient_satisfaction" in encounter &&
            "provider_satisfaction" in encounter
        ) as EncounterDataType[]
      )
    );
    setExportData(
      compileData(
        filteredEncounterData,
        patientsData,
        providersData,
        multiModalDataPathsData,
        exportFormat
      )
    );
  }, [
    selectedSources,
    filteredEncounterData,
    exportFormat,
    patientsData,
    providersData,
    multiModalDataPathsData,
    departmentData,
  ]);

  return (
    <div className="p-4 sm:p-8 md:p-12 bg-slate-50">
      {summaryStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Encounters"
            value={summaryStats.totalEncounters}
          />
          <StatCard
            title="Total Deidentified"
            value={summaryStats.totalDeidentified}
          />
          <StatCard
            title="Total Access Controlled"
            value={summaryStats.totalAccessControlled}
          />
          <StatCard
            title="Total Departments"
            value={summaryStats.totalDepartments}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-4">
        <div className="order-first lg:order-2 lg:col-span-1">
          <div className="p-4 bg-white rounded shadow mb-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="w-full md:w-1/2 pr-0 md:pr-2 mb-4 md:mb-0">
                <label className="text-sm text-blue-500">
                  Select Data Source
                </label>
                <Select
                  options={SOURCE_OPTIONS}
                  onChange={handleSourceChange}
                  isMulti
                  styles={dropDownSelectStyle}
                />
              </div>
              <div className="w-full md:w-1/2 pl-0 md:pl-2">
                <label className="text-sm text-blue-500">
                  Select Deidentified data
                </label>
                <Select
                  options={DEIDENTIFIED_OPTIONS}
                  onChange={handleIsDeidentifiedChange}
                  defaultValue={DEIDENTIFIED_OPTIONS[0]}
                  styles={dropDownSelectStyle}
                />
              </div>
            </div>
            <div className="p-4 bg-white rounded shadow mb-4">
              <div className="mb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date) => setStartDate(date)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${
                        isDatePickerEnabled
                          ? "focus:ring-indigo-500 focus:border-indigo-500"
                          : "bg-gray-200 cursor-not-allowed"
                      }`}
                      disabled={!isDatePickerEnabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-500 mb-2">
                      End Date
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date) => setEndDate(date)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${
                        isDatePickerEnabled
                          ? "focus:ring-indigo-500 focus:border-indigo-500"
                          : "bg-gray-200 cursor-not-allowed"
                      }`}
                      disabled={!isDatePickerEnabled}
                    />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked={isDatePickerEnabled}
                    onChange={() =>
                      setIsDatePickerEnabled(!isDatePickerEnabled)
                    }
                    className="mr-2"
                  />
                  <label className="text-xs">Enable Date Filter</label>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <label className="block text-sm text-blue-500 mb-2">
                Export Format
              </label>
              <div className="flex flex-col md:flex-row items-center mb-4">
                <Select
                  options={EXPORT_OPTIONS}
                  onChange={handleFormatChange}
                  className="mr-0 md:mr-4 mb-4 md:mb-0"
                  styles={dropDownSelectStyle}
                />
                <button
                  onClick={handleExportClick}
                  className={`px-4 py-2 text-sm rounded ${
                    exportFormat
                      ? "bg-blue-500 text-white"
                      : "bg-gray-500 text-gray-300 cursor-not-allowed"
                  }`}
                  disabled={!exportFormat}
                >
                  Export Data
                </button>
              </div>
            </div>
            <p className="mt-2 mb-4 text-sm text-gray-600">
              <strong>RIAS:</strong> Roter interaction analysis system (RIAS) is
              a method for coding medical dialogue.
            </p>
            <p className="mt-2 mb-4 text-sm text-gray-600">
              <strong>Simulation Center:</strong> Simulation center data.
            </p>
            <p className="mt-2 mb-4 text-sm text-gray-600">
              <strong>Clinic:</strong> Clinical Encounters data.
            </p>
          </div>
        </div>
        <div className="lg:order-1 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {accessControlByDepartment && (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                  <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                    Encounter Per Department
                  </h2>
                  <EncounterPerDepartmentChart
                    data={accessControlByDepartment}
                    departmentColors={departmentColors}
                    screenWidth={screenWidth}
                  />
                </div>
              </div>
            )}
            {encountersOverTime && (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                  <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                    Encounters Over Time
                  </h2>
                  <EncountersOverTimeChart
                    data={encountersOverTime}
                    screenWidth={screenWidth}
                  />
                  <div className="flex justify-end">
                    <p className="font-medium text-sm text-gray-600 mt-4">
                      Last updated:{" "}
                      {encountersOverTime[encountersOverTime.length - 1] &&
                        encountersOverTime[encountersOverTime.length - 1].date}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {satisfactionData && (
              <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                  Patient and Provider Satisfaction
                </h2>
                <SatisfactionChart
                  data={satisfactionData}
                  screenWidth={screenWidth}
                />
              </div>
            )}
            {encountersByMultiModalData && (
              <div className="col-span-1 md:col-span-2 lg:col-span-2">
                <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                  <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                    Encounters By Multi Modal Data
                  </h2>
                  <EncountersByMultiModalDataChart
                    data={encountersByMultiModalData}
                    screenWidth={screenWidth}
                  />
                </div>
              </div>
            )}
            {encountersByEthnicGroups && (
              <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                  Ethnic Groups
                </h2>
                <EncountersEthnicGroupsChart
                  data={encountersByEthnicGroups}
                  screenWidth={screenWidth}
                />
              </div>
            )}
            {encountersByRacialGroups && (
              <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
                <h2 className="text-center text-xl font-semibold text-gray-800 mb-5">
                  Racial Groups
                </h2>
                <EncountersByRacialGroupChart
                  data={encountersByRacialGroups}
                  screenWidth={screenWidth}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayGround;
