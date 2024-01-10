import React from 'react';
import { DataType } from '../useFetchData';
import { DEPARTMENTS_NAMES, VISIT_TYPE } from '../../../constants';
import {capitalizeWords} from '../../../lib/utils';

interface DataTableProps {
  data: DataType[];
}

const tableHeaderClasses = "px-3 py-1.5 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider";
const tableDataClasses = "px-3 py-2 whitespace-no-wrap border-b border-gray-200 text-left text-sm";

const DataTable: React.FC<DataTableProps> = ({ data }) => (
  <div className="overflow-x-auto">
    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
      <table className="min-w-full border-separate">
        <thead>
          <tr>
            <th className={tableHeaderClasses}>Case</th>
            <th className={tableHeaderClasses}>Visit</th>
            <th className={tableHeaderClasses}>Department</th>
            <th className={tableHeaderClasses}>Audio</th>
            <th className={tableHeaderClasses}>Video</th>
            <th className={tableHeaderClasses}>Transcript</th>
            <th className={tableHeaderClasses}>Other</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item) => (
            <tr key={item.encounter_id}>
              <td className={tableDataClasses}>{item.case}</td>
              <td className={tableDataClasses}>{VISIT_TYPE[item.visit]}</td>
              <td className={tableDataClasses}>{capitalizeWords(DEPARTMENTS_NAMES[item.department])}</td>
              <td className={tableDataClasses}>{item.files.audio ? 'Exists' : 'Does not exist'}</td>
              <td className={tableDataClasses}>{item.files.video ? 'Exists' : 'Does not exist'}</td>
              <td className={tableDataClasses}>{item.files.transcript ? 'Exists' : 'Does not exist'}</td>
              <td className={tableDataClasses}>{item.files.other ? 'Exists' : 'Does not exist'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;