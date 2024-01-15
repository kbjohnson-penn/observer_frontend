"use client";

import React, { useState, useEffect } from "react";
import {
  EncouterDataType,
  DepartmentDataType,
  EncounterMediaTypeChoicesDataType,
} from "../../../interfaces";
import {
  checkBoolean,
  formatDepartmentName,
  formatVisitDate,
} from "../../../lib/utils";

interface DataTableProps {
  encounterData: EncouterDataType;
  departmentData: DepartmentDataType;
  encounterMediaTypeChoicesData: EncounterMediaTypeChoicesDataType;
}

const tableHeaderClasses =
  "px-3 py-1.5 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider";
const tableDataClasses =
  "px-3 py-2 whitespace-no-wrap border-b border-gray-200 text-left text-sm";

const DataTable: React.FC<DataTableProps> = ({
  encounterData,
  departmentData,
  encounterMediaTypeChoicesData,
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortedData, setSortedData] = useState<EncouterDataType[]>([]);
  useEffect(() => {
    let sorted: EncouterDataType = encounterData;
    if (sortField) {
      sorted.sort((a, b) => {
        // Sort other fields
        if (a[sortField] < b[sortField])
          return sortDirection === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField])
          return sortDirection === "asc" ? 1 : -1;

        return 0;
      });
    }
    setSortedData(sorted);
  }, [encounterData, sortField, sortDirection]);

  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="overflow-x-auto">
      <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
        <table className="min-w-full border-separate">
          <thead>
            <tr>
              <th
                className={tableHeaderClasses}
                onClick={() => handleSort("case_id")}
              >
                Case{" "}
                {sortField === "case_id" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className={tableHeaderClasses}
                onClick={() => handleSort("visit_date")}
              >
                Date{" "}
                {sortField === "visit_date" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className={tableHeaderClasses}
                onClick={() => handleSort("department")}
              >
                Department{" "}
                {sortField === "department" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className={tableHeaderClasses}
                onClick={() => handleSort("visit_type")}
              >
                Visit Type{" "}
                {sortField === "visit_type" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className={tableHeaderClasses}>De-Identified</th>
              <th className={tableHeaderClasses}>Access Controlled</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.map((item) => (
              <tr key={item.id}>
                <td className={tableDataClasses}>{item.case_id}</td>
                <td className={tableDataClasses}>{formatVisitDate(item.visit_date)}</td>
                <td className={tableDataClasses}>
                  {formatDepartmentName(
                    departmentData[item.department as unknown as keyof DepartmentDataType].toString()
                  )}
                </td>
                <td className={tableDataClasses}>
                  {encounterMediaTypeChoicesData[item.visit_type]}
                </td>
                <td className={tableDataClasses}>
                  {checkBoolean(item.is_deidentified)}
                </td>
                <td className={tableDataClasses}>
                  {checkBoolean(item.is_restricted)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
