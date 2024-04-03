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
    <div className="p-12 bg-slate-50">
      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-x-12 gap-y-4 lg:grid-flow-row-dense">
        <div className="lg:col-start-3">
          <div className="grid grid-rows-2">
            <div className="grid col-span-2">
              <div className="flex flex-col items-center p-2 bg-white shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-4">Source Selection</h2>
                <div className="mb-4">
                  <label className="text-lg text-blue-500">
                    Select from one of the data source
                  </label>
                  <Select
                    options={SOURCE_OPTIONS}
                    onChange={handleSourceChange}
                    defaultValue={SOURCE_OPTIONS[0]}
                  />
                  <p className="mt-4 text-gray-600">
                    <strong>RIAS:</strong> Roter interaction analysis system
                    (RIAS) is a method for coding medical dialogue.
                  </p>
                  <p className="mt-4 text-gray-600">
                    <strong>Simulation Center:</strong> Simulation center data.
                  </p>
                  <p className="mt-4 text-gray-600">
                    <strong>Clinic:</strong> Clinical Encounters data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {encounterPerDepartment && (
          <div className="lg:col-span-1 bg-white shadow-md rounded p-6">
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
          <div className="lg:col-span-1 bg-white shadow-md rounded p-6">
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
          <div className="lg:col-span-1 bg-white shadow-md rounded p-6">
            <h2 className="text-center text-2xl font-bold mb-4">
              Encounters By Multi Modal Data
            </h2>
            <EncountersByMultiModalDataChart
              data={encountersByMultiModalData}
            />
          </div>
        )}
        {encountersOverTime && (
          <div className="lg:col-span-1 bg-white shadow-md rounded p-6">
            <h2 className="text-center text-2xl font-bold mb-4">
              Encounters Over Time
            </h2>
            <EncountersOverTimeChart data={encountersOverTime} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayGround;
