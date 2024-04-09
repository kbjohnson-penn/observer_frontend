import * as d3 from "d3";
import { unparse } from "papaparse";
import {
  PatientDataType,
  ProviderDataType,
  EncounterDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  CombinedDataType,
} from "../interfaces/interfaces";
import { ETHNIC_CATEGORIES, RACIAL_CATEGORIES } from "../constants";

export const capitalizeWords = (input: string): string => {
  return input.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const checkBoolean = (input: boolean): string => {
  return input ? "Yes" : "No";
};

export const formatDepartmentName = (name: string): string => {
  let formattedName = name.replace(/-/g, " ");
  formattedName = formattedName.replace(/\b\w/g, (l) => l.toUpperCase());
  return formattedName;
};

export const formatVisitDate = (date: string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getDepartmentColors = (departmentData: DepartmentDataType[]) => {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const departmentColors: { [key: string]: string } = {}; // Add index signature

  departmentData.forEach((department, index) => {
    departmentColors[department.name] = colorScale(String(index));
  });

  return departmentColors;
};

export const getEncounterPerDepartment = (
  filteredEncounterData: EncounterDataType[],
  departmentData: DepartmentDataType[]
): { department: string; count: number }[] => {
  const data = departmentData.map((department) => {
    const count = filteredEncounterData.filter(
      (encounter) => encounter.department === department.name
    ).length;
    return { department: department.name, count };
  });
  return data;
};

export const getEncountersByAccess = (
  filteredEncounterData: EncounterDataType[]
): { access: string; count: number }[] => {
  const data = ["Access Controlled", "Not Access Controlled"].map((access) => {
    const count = filteredEncounterData.filter(
      (encounter) =>
        (access === "Access Controlled" && encounter.is_restricted) ||
        (access === "Not Access Controlled" && !encounter.is_restricted)
    ).length;
    return { access, count };
  });
  return data;
};

export const getAccessControlByDepartment = (
  filteredEncounterData: EncounterDataType[],
  departmentData: DepartmentDataType[]
): {
  department: string;
  accessControlled: number;
  notAccessControlled: number;
}[] => {
  const data = departmentData.map((department) => {
    const accessControlled = filteredEncounterData.filter(
      (encounter) =>
        encounter.department === department.name && encounter.is_restricted
    ).length;
    const notAccessControlled = filteredEncounterData.filter(
      (encounter) =>
        encounter.department === department.name && !encounter.is_restricted
    ).length;
    return {
      department: department.name,
      accessControlled,
      notAccessControlled,
    };
  });
  return data;
};

export const getEncountersByMultiModalData = (
  filteredEncounterData: EncounterDataType[],
  multiModalDataPathsData: MultiModalDataPathsDataType[]
): { name: string; count: number }[] => {
  const data: { [key: string]: number } = {
    provider_view: 0,
    patient_view: 0,
    room_view: 0,
    audio: 0,
    transcript: 0,
    patient_survey: 0,
    provider_survey: 0,
    rias_transcript: 0,
    rias_codes: 0,
  };

  const multiModalDataPathsLookup = multiModalDataPathsData.reduce(
    (lookup, dataPath) => {
      lookup[dataPath.multi_modal_data_id] = dataPath;
      return lookup;
    },
    {} as { [key: string]: MultiModalDataPathsDataType }
  );

  filteredEncounterData.forEach((encounter) => {
    const matchedMultiModalDataPath =
      multiModalDataPathsLookup[encounter.multi_modal_data];

    if (matchedMultiModalDataPath) {
      Object.keys(data).forEach((key) => {
        if (
          matchedMultiModalDataPath[key as keyof MultiModalDataPathsDataType]
        ) {
          data[key]++;
        }
      });
    }
  });

  return Object.keys(data).map((key) => ({
    name: key,
    count: data[key],
  }));
};

export const getEncountersOverTime = (
  filteredEncounterData: EncounterDataType[]
): { date: string; count: number }[] => {
  const data = filteredEncounterData.reduce((acc, encounter) => {
    const date = new Date(encounter.encounter_date_and_time)
      .toISOString()
      .split("T")[0];
    const found = acc.find((item) => item.date === date);
    if (found) {
      found.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, [] as { date: string; count: number }[]);

  return data;
};

export const getEncountersByGroup = (
  filteredEncounterData: EncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[],
  groupKey: "race" | "ethnicity",
  groupCategories: { [key: string]: string }
): { name: string; patientCount: number; providerCount: number }[] => {
  const groupNames = Object.keys(groupCategories);
  const counts: {
    [key: string]: { patientCount: Set<string>; providerCount: Set<string> };
  } = {};

  for (const encounter of filteredEncounterData) {
    const patient = patientsData.find(
      (p) => p.patient_id === encounter.patient
    );
    const provider = providerData.find(
      (p) => p.provider_id === encounter.provider
    );

    if (patient && provider && patient[groupKey] && provider[groupKey]) {
      if (!counts[patient[groupKey]]) {
        counts[patient[groupKey]] = {
          patientCount: new Set(),
          providerCount: new Set(),
        };
      }

      counts[patient[groupKey]].patientCount.add(patient.patient_id);

      if (!counts[provider[groupKey]]) {
        counts[provider[groupKey]] = {
          patientCount: new Set(),
          providerCount: new Set(),
        };
      }

      counts[provider[groupKey]].providerCount.add(provider.provider_id);
    }
  }

  return groupNames.map((group) => ({
    name: groupCategories[group],
    patientCount: counts[group]?.patientCount.size || 0,
    providerCount: counts[group]?.providerCount.size || 0,
  }));
};

export const getEncountersByEthnicGroups = (
  filteredEncounterData: EncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[]
): { name: string; patientCount: number; providerCount: number }[] => {
  return getEncountersByGroup(
    filteredEncounterData,
    patientsData,
    providerData,
    "ethnicity",
    ETHNIC_CATEGORIES
  );
};

export const getEncountersByRacialGroups = (
  filteredEncounterData: EncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[]
): { name: string; patientCount: number; providerCount: number }[] => {
  return getEncountersByGroup(
    filteredEncounterData,
    patientsData,
    providerData,
    "race",
    RACIAL_CATEGORIES
  );
};

export const getSatisfactionData = (
  filteredEncounterData: EncounterDataType[]
): { patientSatisfaction: number; providerSatisfaction: number }[] => {
  const data = filteredEncounterData.map((encounter) => {
    return {
      patientSatisfaction: encounter.patient_satisfaction,
      providerSatisfaction: encounter.provider_satisfaction,
    };
  });

  return data;
};

const addPrefixToKeys = (
  obj: Record<string, any> | undefined,
  prefix: string
): Record<string, any> => {
  const result: Record<string, any> = {};
  if (obj) {
    for (const key in obj) {
      result[prefix + key] = obj[key];
    }
  }
  return result;
};

export const compileData = (
  filteredEncounterData: EncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[],
  multiModalData: MultiModalDataPathsDataType[],
  format: string
): CombinedDataType[] => {
  const patientsMap = new Map(
    patientsData.map((item) => [item.patient_id, item])
  );
  const providersMap = new Map(
    providerData.map((item) => [item.provider_id, item])
  );
  const multiModalDataMap = new Map(
    multiModalData.map((item) => [item.multi_modal_data_id, item])
  );

  const combinedData = filteredEncounterData.map((encounter) => {
    const patient =
      format === "csv"
        ? addPrefixToKeys(patientsMap.get(encounter.patient), "patient_")
        : patientsMap.get(encounter.patient);
    const provider =
      format === "csv"
        ? addPrefixToKeys(providersMap.get(encounter.provider), "provider_")
        : providersMap.get(encounter.provider);
    const multiModalDataPath = multiModalDataMap.get(
      encounter.multi_modal_data
    );

    return format === "csv"
      ? {
          ...encounter,
          ...patient,
          ...provider,
          ...multiModalDataPath,
        }
      : {
          ...encounter,
          patient,
          provider,
          multiModalDataPath,
        };
  });

  return combinedData as CombinedDataType[];
};

export const downloadData = (
  combinedData: CombinedDataType[],
  format: string
) => {
  let dataString: string;
  let mimeType: string;
  let fileExtension: string;

  if (format === "csv") {
    const header = Object.keys(combinedData[0]).join(",");
    const csvRows = [header];

    for (const row of combinedData) {
      const values = Object.values(row).map((value) =>
        typeof value === "object" ? JSON.stringify(value) : String(value)
      );
      csvRows.push(values.join(","));
    }

    dataString = csvRows.join("\n");
    mimeType = "text/csv";
    fileExtension = "csv";
  } else if (format === "json") {
    dataString = JSON.stringify(combinedData, null, 2);
    mimeType = "application/json";
    fileExtension = "json";
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const blob = new Blob([dataString], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `observer_platform_data_export.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
