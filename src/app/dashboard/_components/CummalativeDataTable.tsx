import React from "react";
import { EncouterDataType } from "../../../interfaces";
import { countEncounters } from "../../../lib/utils";
import {
  RACIAL_CATEGORIES,
  ETHNIC_CATEGORIES,
  GENDER_CATEGORIES,
} from "../../../constants";

interface CummulativeDataTableProps {
  encounterData: EncouterDataType[];
}

const ETHNIC_CATEGORY_KEYS = Object.keys(ETHNIC_CATEGORIES);

const CummulativeDataTable: React.FC<CummulativeDataTableProps> = ({
  encounterData,
}) => {
  const totalEncounters = countEncounters(encounterData);
  const rowTotals = Object.keys(RACIAL_CATEGORIES).map((racialCategory) =>
    Object.keys(ETHNIC_CATEGORIES).reduce(
      (sum, ethnicCategory) =>
        sum +
        Object.keys(GENDER_CATEGORIES).reduce(
          (innerSum, gender) =>
            innerSum +
            (totalEncounters[racialCategory]?.[ethnicCategory]?.[gender] || 0),
          0
        ),
      0
    )
  );

  const columnTotals = ETHNIC_CATEGORY_KEYS.flatMap((ethnicCategory) =>
    Object.keys(GENDER_CATEGORIES).map((gender) =>
      Object.keys(RACIAL_CATEGORIES).reduce(
        (sum, racialCategory) =>
          sum +
          (totalEncounters[racialCategory]?.[ethnicCategory]?.[gender] || 0),
        0
      )
    )
  );

  const grandTotal = rowTotals.reduce((sum, total) => sum + total, 0);
  return (
    <table className="table-auto border-collapse border border-black">
      <thead>
        <tr>
          <th
            className="border border-black p-2 bg-blue-500 text-white"
            rowSpan={3}
          >
            Racial Categories
          </th>
          {ETHNIC_CATEGORY_KEYS.map((ethnicCategory) => (
            <th
              className="border border-black p-2 bg-blue-500 text-white"
              colSpan={Object.keys(GENDER_CATEGORIES).length}
              key={ethnicCategory}
            >
              {ETHNIC_CATEGORIES[ethnicCategory]}
            </th>
          ))}
          <th className="border border-black p-2 bg-blue-500 text-white">
            Total
          </th>
        </tr>
        <tr>
          {ETHNIC_CATEGORY_KEYS.flatMap((ethnicCategory) =>
            Object.keys(GENDER_CATEGORIES).map((gender) => (
              <th
                className="border border-black p-2 bg-blue-500 text-white"
                key={`${ethnicCategory}-${gender}`}
              >
                {GENDER_CATEGORIES[gender]}
              </th>
            ))
          )}
          <th className="border border-black p-2 bg-blue-500 text-white"></th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(RACIAL_CATEGORIES).map((racialCategory, index) => (
          <tr key={racialCategory}>
            <td className="border border-black p-2 bg-gray-200">
              {RACIAL_CATEGORIES[racialCategory]}
            </td>
            {Object.keys(ETHNIC_CATEGORIES).flatMap((ethnicCategory) =>
              Object.keys(GENDER_CATEGORIES).map((gender) => (
                <td
                  className="border border-black p-2"
                  key={`${ethnicCategory}-${gender}`}
                >
                  {totalEncounters[racialCategory]?.[ethnicCategory]?.[
                    gender
                  ] || 0}
                </td>
              ))
            )}
            <td className="border border-black p-2 bg-gray-200">
              {rowTotals[index]}
            </td>
          </tr>
        ))}
        <tr>
          <td className="border border-black p-2 bg-gray-200">Total</td>
          {columnTotals.map((total, index) => (
            <td className="border border-black p-2 bg-gray-200" key={index}>
              {total}
            </td>
          ))}
          <td className="border border-black p-2 bg-gray-200">{grandTotal}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default CummulativeDataTable;
