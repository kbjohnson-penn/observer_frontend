import * as d3 from "d3";
import {
  PatientDataType,
  ProviderDataType,
  EncounterDataType,
  EncounterSimCenterDataType,
  EncounterRIASDataType,
  CombinedEncounterDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
  CombinedDataType,
  FlattenedCombinedDataType,
  NestedCombinedDataType,
} from "../interfaces/interfaces";
import {
  ETHNIC_CATEGORIES,
  RACIAL_CATEGORIES,
  CSV_COLUMN_ORDER,
} from "../constants";

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
  filteredEncounterData: CombinedEncounterDataType[],
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
  filteredEncounterData: CombinedEncounterDataType[]
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
  filteredEncounterData: CombinedEncounterDataType[],
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
  filteredEncounterData: CombinedEncounterDataType[],
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
      lookup[dataPath.id] = dataPath;
      return lookup;
    },
    {} as { [key: string]: MultiModalDataPathsDataType }
  );

  filteredEncounterData.forEach((encounter) => {
    const matchedMultiModalDataPath =
      multiModalDataPathsLookup[encounter.multi_modal_data_id];

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

  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return data;
};

export const getEncountersByGroup = (
  filteredEncounterData: CombinedEncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[],
  groupKey: "race" | "ethnicity",
  groupCategories: { [key: string]: string }
): { name: string; patientCount: number; providerCount: number }[] => {
  const groupNames = Object.keys(groupCategories);
  const counts: {
    [key: string]: { patientCount: Set<number>; providerCount: Set<number> };
  } = {};

  for (const encounter of filteredEncounterData) {
    const patient = patientsData.find((p) => p.id === encounter.patient_id);
    const provider = providerData.find((p) => p.id === encounter.provider_id);

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
  filteredEncounterData: CombinedEncounterDataType[],
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
  filteredEncounterData: CombinedEncounterDataType[],
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

const orderObject = (
  obj: Record<string, any>,
  order: string[]
): Record<string, any> => {
  const ordered: Record<string, any> = {};
  for (const key of order) {
    ordered[key] = obj[key] === undefined ? "" : obj[key];
  }
  return ordered;
};

export const compileData = (
  filteredEncounterData: CombinedEncounterDataType[],
  patientsData: PatientDataType[],
  providerData: ProviderDataType[],
  multiModalData: MultiModalDataPathsDataType[],
  format: string
): CombinedDataType[] => {
  const patientsMap = new Map(patientsData.map((item) => [item.id, item]));
  const providersMap = new Map(providerData.map((item) => [item.id, item]));
  const multiModalDataMap = new Map(
    multiModalData.map((item) => [item.id, item])
  );

  const combinedData = filteredEncounterData.map((encounter) => {
    const patient = patientsMap.get(encounter.patient_id);
    const provider = providersMap.get(encounter.provider_id);
    const multiModalDataPath = multiModalDataMap.get(
      encounter.multi_modal_data_id
    );
    if (!patient || !provider || !multiModalDataPath) {
      throw new Error("Patient, provider, or multi-modal data not found");
    }

    const safeEncounter = {
      ...encounter,
      encounter_date_and_time:
        "encounter_date_and_time" in encounter
          ? (encounter as EncounterDataType | EncounterSimCenterDataType)
              .encounter_date_and_time
          : null,
      patient_satisfaction:
        "patient_satisfaction" in encounter
          ? (encounter as EncounterDataType).patient_satisfaction
          : null,
      provider_satisfaction:
        "provider_satisfaction" in encounter
          ? (encounter as EncounterDataType).provider_satisfaction
          : null,
      is_deidentified: encounter.is_deidentified,
      is_restricted: encounter.is_restricted,
    };

    if (format === "csv") {
      const { id: _, ...patientWithoutId } = addPrefixToKeys(
        patient,
        "patient_"
      );
      const { id: __, ...providerWithoutId } = addPrefixToKeys(
        provider,
        "provider_"
      );

      const flattenedData = {
        ...safeEncounter,
        ...patientWithoutId,
        ...providerWithoutId,
        ...multiModalDataPath,
        id: encounter.id,
      } as FlattenedCombinedDataType;

      return orderObject(flattenedData, CSV_COLUMN_ORDER);
    } else {
      return {
        encounter: safeEncounter,
        patient,
        provider,
        multi_modal_data: multiModalDataPath,
      } as NestedCombinedDataType;
    }
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
    const flattenObject = (obj: any, prefix = "") => {
      return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + "." : "";
        if (
          typeof obj[k] === "object" &&
          obj[k] !== null &&
          !Array.isArray(obj[k])
        ) {
          Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
          acc[pre + k] = obj[k];
        }
        return acc;
      }, {} as Record<string, any>);
    };

    const flattenedData = combinedData.map((item) => flattenObject(item));
    const orderedData = flattenedData.map((item) =>
      orderObject(item, CSV_COLUMN_ORDER)
    );
    const header = CSV_COLUMN_ORDER.join(",");
    const csvRows = [header];

    for (const row of orderedData) {
      const values = Object.values(row).map((value) =>
        typeof value === "object"
          ? JSON.stringify(value)
          : value === null
          ? ""
          : String(value)
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
