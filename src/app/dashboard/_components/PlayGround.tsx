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
import EncounterPerDepartmentChart from "./charts/EncounterPerDepartmentChart";
import AccessControlByDepartmentChart from "./charts/AccessControlByDepartmentChart";
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
    filteredEncounterData,
    exportFormat,
    patientsData,
    providersData,
    multiModalDataPathsData,
    departmentData,
  ]);

  return (
    <div className="p-12 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-4">
        <div className="order-first lg:order-2 lg:col-span-1">
          <div className="p-4 bg-white rounded shadow mb-4">
            <div className="flex justify-between mb-4">
              <div className="w-1/2 pr-2">
                <label className="text-lg text-blue-500">
                  Select Data Source
                </label>
                <Select
                  options={SOURCE_OPTIONS}
                  onChange={handleSourceChange}
                  isMulti
                />
              </div>
              <div className="w-1/2 pl-2">
                <label className="text-lg text-blue-500">
                  Select Deidentified data
                </label>
                <Select
                  options={DEIDENTIFIED_OPTIONS}
                  onChange={handleIsDeidentifiedChange}
                  defaultValue={DEIDENTIFIED_OPTIONS[0]}
                />
              </div>
            </div>
            <div className="p-4 bg-white rounded shadow mb-4">
              <div className="mb-2">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={isDatePickerEnabled}
                    onChange={() =>
                      setIsDatePickerEnabled(!isDatePickerEnabled)
                    }
                    className="mr-2"
                  />
                  <label>Enable Date Filter</label>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="block text-lg text-blue-500 mb-2">
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
                    <label className="block text-lg text-blue-500 mb-2">
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
              </div>
            </div>
            <div className="p-4 bg-white rounded shadow">
              <div className="flex items-center mb-4">
                <label className="block text-lg text-blue-500 mr-2">
                  Export Format
                </label>
                <Select
                  options={EXPORT_OPTIONS}
                  onChange={handleFormatChange}
                  className="mr-2"
                />
                <button
                  onClick={handleExportClick}
                  className={`px-4 py-2 rounded ${
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
            <p className="mt-2 mb-4 text-gray-600">
              <strong>RIAS:</strong> Roter interaction analysis system (RIAS) is
              a method for coding medical dialogue.
            </p>
            <p className="mt-2 mb-4 text-gray-600">
              <strong>Simulation Center:</strong> Simulation center data.
            </p>
            <p className="mt-2 mb-4 text-gray-600">
              <strong>Clinic:</strong> Clinical Encounters data.
            </p>
          </div>
        </div>
        <div className="lg:order-1 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {encounterPerDepartment && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Encounter Per Department
                </h2>
                <EncounterPerDepartmentChart
                  data={encounterPerDepartment}
                  departmentColors={departmentColors}
                />
              </div>
            )}
            {accessControlByDepartment && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Access Controlled
                </h2>
                <AccessControlByDepartmentChart
                  data={accessControlByDepartment}
                  departmentColors={departmentColors}
                />
              </div>
            )}
            {encountersByMultiModalData && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Encounters By Multi Modal Data
                </h2>
                <EncountersByMultiModalDataChart
                  data={encountersByMultiModalData}
                />
              </div>
            )}
            {encountersOverTime && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Encounters Over Time
                </h2>
                <EncountersOverTimeChart data={encountersOverTime} />
              </div>
            )}
            {encountersByEthnicGroups && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Ethnic Groups
                </h2>
                <EncountersEthnicGroupsChart data={encountersByEthnicGroups} />
              </div>
            )}
            {encountersByRacialGroups && (
              <div className="bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Racial Groups
                </h2>
                <EncountersByRacialGroupChart data={encountersByRacialGroups} />
              </div>
            )}
            {satisfactionData && (
              <div className="col-span-2 bg-white shadow-md rounded p-6">
                <h2 className="text-center text-2xl font-bold mb-4">
                  Patient and Provider Satisfaction
                </h2>
                <SatisfactionChart data={satisfactionData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayGround;
