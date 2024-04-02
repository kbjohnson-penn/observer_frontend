"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  PatientDataType,
  ProviderDataType,
  EncounterSourceDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncounterDataType,
} from "../../../interfaces/interfaces";
import EncounterPerDepartmentChart from "./charts/EncounterPerDepartmentChart";
import AccessControlByDepartmentChart from "./charts/AccessControlByDepartmentChart";
import EncountersByMultiModalDataChart from "./charts/EncountersByMultiModalDataChart";
import EncountersOverTimeChart from "./charts/EncountersOverTimeChart";
import { SOURCE_OPTIONS } from "../../../constants";
import {
  getEncounterPerDepartment,
  getEncountersByAccess,
  getAccessControlByDepartment,
  getEncountersByMultiModalData,
  getEncountersOverTime,
} from "../../../lib/utils";

interface PlayGroundProps {
  patientsData: PatientDataType[];
  providersData: ProviderDataType[];
  encounterSourceData: EncounterSourceDataType[];
  departmentData: DepartmentDataType[];
  multiModalDataPathsData: MultiModalDataPathsDataType[];
  encounterData: EncounterDataType[];
  departmentColors: { [key: string]: string };
}

const PlayGround: React.FC<PlayGroundProps> = ({
  patientsData,
  providersData,
  encounterSourceData,
  departmentData,
  multiModalDataPathsData,
  encounterData,
  departmentColors,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [filteredEncounterData, setFilteredEncounterData] = useState<
    EncounterDataType[]
  >([]);
  const [encounterPerDepartment, setEncounterPerDepartment] = useState<
    { department: string; count: number }[]
  >([]);
  const [encountersByAccess, setEncountersByAccess] = useState<
    { access: string; count: number }[]
  >([]);
  const [accessControlByDepartment, setAccessControlByDepartment] = useState<
    {
      department: string;
      accessControlled: number;
      notAccessControlled: number;
    }[]
  >([]);
  const [encountersByMultiModalData, setEncountersByMultiModalData] = useState<
    { name: string; count: number }[] | undefined
  >();
  const [encountersOverTime, setEncountersOverTime] = useState<
    { date: string; count: number }[]
  >([]);

  const handleSourceChange = (selectedOption: any) => {
    setSelectedSource(selectedOption.value);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      width: 300,
      background: "#fff",
      borderColor: "#9e9e9e",
      minHeight: "30px",
      height: "30px",
      boxShadow: state.isFocused ? null : null,
    }),

    valueContainer: (provided: any, state: any) => ({
      ...provided,
      height: "30px",
      padding: "0 6px",
    }),

    input: (provided: any, state: any) => ({
      ...provided,
      margin: "0px",
    }),

    indicatorSeparator: (state: any) => ({
      display: "none",
    }),

    indicatorsContainer: (provided: any, state: any) => ({
      ...provided,
      height: "30px",
    }),
  };

  useEffect(() => {
    const updatedEncounterData = encounterData.filter((encounter) => {
      return (
        selectedSource === "All" ||
        encounter.encounter_source === selectedSource
      );
    });
    setFilteredEncounterData(updatedEncounterData);
  }, [selectedSource]);

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
    setEncountersOverTime(getEncountersOverTime(filteredEncounterData));
  }, [filteredEncounterData]);

  return (
    <div className="flex justify-around p-10 bg-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {encounterPerDepartment && (
          <EncounterPerDepartmentChart
            data={encounterPerDepartment}
            departmentColors={departmentColors}
          />
        )}
        {accessControlByDepartment && (
          <AccessControlByDepartmentChart
            data={accessControlByDepartment}
            departmentColors={departmentColors}
          />
        )}
        <div className="flex flex-col items-center p-5 bg-gray-300 rounded-lg">
          <div className="mb-4">
            <label className="text-lg text-blue-500">Select Source</label>
            <Select
              options={SOURCE_OPTIONS}
              onChange={handleSourceChange}
              defaultValue={SOURCE_OPTIONS[0]}
              styles={customStyles}
            />
          </div>
        </div>
        {encountersByMultiModalData && (
          <EncountersByMultiModalDataChart data={encountersByMultiModalData} />
        )}
        {encountersOverTime && (
          <EncountersOverTimeChart data={encountersOverTime} />
        )}
      </div>
    </div>
  );
};

export default PlayGround;
