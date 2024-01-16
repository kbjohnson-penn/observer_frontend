import { EncouterDataType, DepartmentDataType } from "../interfaces";

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

export const formatVisitDate = (date: string): string => {
  const [year, month, day] = date.split("-");
  const formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
};

export const getEncouterPerDepartment = (
  encounters: EncouterDataType[],
  departmentData: DepartmentDataType
): { department: string; count: number }[] => {
  const data = encounters.reduce(
    (
      acc: { department: string; count: number }[],
      encounter: EncouterDataType
    ) => {
      const departmentName =
        formatDepartmentName(departmentData[encounter.department]) || "Unknown";
      const existing = acc.find((item) => item.department === departmentName);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ department: departmentName, count: 1 });
      }
      return acc;
    },
    []
  );
  return data;
};

export const getEncouterByDate = (
  encounters: EncouterDataType[]
): { visit_date: string; count: number }[] => {
  const data = encounters.reduce(
    (
      acc: { visit_date: string; count: number }[],
      encounter: EncouterDataType
    ) => {
      const visitDate = formatVisitDate(encounter.visit_date);
      const existing = acc.find((item) => item.visit_date === visitDate);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ visit_date: visitDate, count: 1 });
      }
      return acc;
    },
    []
  );
  return data;
};

export const getEncounterByMediaType = (
  encounters: EncouterDataType[],
  encounterMediaTypeChoices: { [key: string]: string }
): { mediaType: string; count: number }[] => {
  const data = encounters.reduce(
    (
      acc: { mediaType: string; count: number }[],
      encounter: EncouterDataType
    ) => {
      const mediaType =
        encounterMediaTypeChoices[encounter.visit_type] || "Unknown";
      const existing = acc.find((item) => item.mediaType === mediaType);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ mediaType, count: 1 });
      }
      return acc;
    },
    []
  );
  return data;
};

export function countEncounters(encounterData: any[]) {
  // Initialize an empty object to hold the counts
  const counts: any = {};

  // Loop over the encounter data
  for (const encounter of encounterData) {
    // Get the categories for this encounter
    const racialCategory = encounter.racial_category;
    const ethnicCategory = encounter.ethnic_category;
    const gender = encounter.gender;

    // If this combination of categories doesn't exist in the counts object yet, initialize it
    if (!counts[racialCategory]) {
      counts[racialCategory] = {};
    }
    if (!counts[racialCategory][ethnicCategory]) {
      counts[racialCategory][ethnicCategory] = {};
    }
    if (!counts[racialCategory][ethnicCategory][gender]) {
      counts[racialCategory][ethnicCategory][gender] = 0;
    }

    // Increment the count for this combination of categories
    counts[racialCategory][ethnicCategory][gender]++;
  }
  console.log(counts);
  return counts;
}