"use client";

import React, { useState, useEffect, use } from "react";
import Select from "react-select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  PatientDataType,
  ProviderDataType,
  EncounterSourceDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  EncounterDataType,
} from "../../../interfaces/interfaces";
import { SOURCE_OPTIONS, DUMMY_DATA } from "../../../constants";
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
}

const PlayGround: React.FC<PlayGroundProps> = ({
  patientsData,
  providersData,
  encounterSourceData,
  departmentData,
  multiModalDataPathsData,
  encounterData,
}) => {
  const [selectedSource, setsSlectedSource] = useState<string>("All");
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
    setsSlectedSource(selectedOption.value);
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

  console.log({ encountersOverTime });
  return (
    <div className="flex justify-around p-10">
      <div className="grid grid-cols-2 gap-4">
        <BarChart width={500} height={300} data={encounterPerDepartment}>
          <XAxis dataKey="department" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
        <BarChart width={500} height={300} data={accessControlByDepartment}>
          <XAxis dataKey="department" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="accessControlled" fill="#413ea0" />
          <Bar dataKey="notAccessControlled" fill="#8884d8" />
        </BarChart>
        <BarChart width={500} height={300} data={encountersByMultiModalData}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#413ea0" />
        </BarChart>
        <LineChart width={500} height={300} data={encountersOverTime}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      </div>
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <label>Select Source</label>
          <Select
            options={SOURCE_OPTIONS}
            onChange={handleSourceChange}
            defaultValue={SOURCE_OPTIONS[0]}
            styles={customStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayGround;
