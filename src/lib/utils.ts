import {
  PatientDataType,
  ProviderDataType,
  EncounterDataType,
  DepartmentDataType,
  MultiModalDataPathsDataType,
} from "../interfaces/interfaces";

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

  // Convert the data object to an array of objects
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
