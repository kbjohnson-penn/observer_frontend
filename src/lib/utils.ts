import {
  EncouterDataType,
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

export const getEncouterPerDepartment = (
  encounterData: EncouterDataType[],
  departmentData: DepartmentDataType[]
): { department: string; count: number }[] => {
  const data = departmentData.map((department) => {
    const count = encounterData.filter(
      (encounter) => encounter.department === department.name
    ).length;
    return { department: department.name, count };
  });
  return data;
};

export const getEncouterByDate = (
  encounterData: EncouterDataType[]
): { encounter_date: string; count: number }[] => {
  const data = encounterData.reduce(
    (
      acc: { encounter_date: string; count: number }[],
      encounter: EncouterDataType
    ) => {
      const encounterDate = encounter.encounter_date_and_time.split("T")[0];
      const existing = acc.find(
        (item) => item.encounter_date === encounterDate
      );
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ encounter_date: encounterDate, count: 1 });
      }
      return acc;
    },
    []
  );
  return data;
};

export const getMultiModalDataByDepartments = (
  encounterData: EncouterDataType[],
  departmentData: DepartmentDataType[],
  multiModalDataPathsData: MultiModalDataPathsDataType[]
): { department: string; data: { [key: string]: number } }[] => {
  const data = departmentData.map((department) => {
    const departmentEncounters = encounterData.filter(
      (encounter) => encounter.department === department.name
    );
    const departmentMultiModalData = departmentEncounters
      .map((encounter) =>
        multiModalDataPathsData.find(
          (data) => data.multi_modal_data_id === encounter.multi_modal_data
        )
      )
      .filter(Boolean);
    const newData: { [key: string]: number } = {
      provider_view: 0,
      patient_view: 0,
      room_view: 0,
      audio: 0,
      transcript: 0,
      patient_survey: 0,
      provider_survey: 0,
    };
    departmentMultiModalData.forEach((multiModalData) => {
      if (multiModalData) {
        Object.keys(multiModalData).forEach((key) => {
          if (key !== "multi_modal_data_id" && multiModalData[key]) {
            newData[key] += 1;
          }
        });
      }
    });
    return { department: department.name, data: newData };
  });
  return data;
};

export function countEncounters(encounterData: any[]) {
  const counts: any = {};

  for (const encounter of encounterData) {
    const racialCategory = encounter.racial_category;
    const ethnicCategory = encounter.ethnic_category;
    const gender = encounter.gender;

    if (!counts[racialCategory]) {
      counts[racialCategory] = {};
    }
    if (!counts[racialCategory][ethnicCategory]) {
      counts[racialCategory][ethnicCategory] = {};
    }
    if (!counts[racialCategory][ethnicCategory][gender]) {
      counts[racialCategory][ethnicCategory][gender] = 0;
    }

    counts[racialCategory][ethnicCategory][gender]++;
  }
  return counts;
}

export const getTotalMultiModalDataCount = (
  encounterData: EncouterDataType[],
  multiModalDataPathsData: MultiModalDataPathsDataType[]
): { [key: string]: number } => {
  const multiModalDataCounts: { [key: string]: number } = {
    provider_view: 0,
    patient_view: 0,
    room_view: 0,
    audio: 0,
    transcript: 0,
    patient_survey: 0,
    provider_survey: 0,
  };

  encounterData.forEach((encounter) => {
    const multiModalData = multiModalDataPathsData.find(
      (data) => data.multi_modal_data_id === encounter.multi_modal_data
    );
    if (multiModalData) {
      Object.keys(multiModalData).forEach((key) => {
        if (key !== "multi_modal_data_id" && multiModalData[key]) {
          multiModalDataCounts[key]++;
        }
      });
    }
  });

  return multiModalDataCounts;
};
