import {
  EncouterDataType,
  DepartmentDataType,
  EncounterMediaChoicesDataType,
} from "../interfaces";

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
  encounterData: EncouterDataType[]
): { department: string; count: number }[] => {
  const data = encounterData.reduce(
    (
      acc: { department: string; count: number }[],
      encounter: EncouterDataType
    ) => {
      const departmentName =
        formatDepartmentName(String(encounter.department)) || "Unknown";
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
  encounterData: EncouterDataType[]
): { visit_date: string; count: number }[] => {
  const data = encounterData.reduce(
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

export const getMediaChoicesByDepartments = (
  encounterData: EncouterDataType[],
  departmentData: DepartmentDataType,
  encounterMediaChoicesData: EncounterMediaChoicesDataType
) => {
  const data = Object.values(departmentData).reduce((acc, department) => {
    const formattedDepartment = formatDepartmentName(department);
    // Initialize the department in the accumulator with all media types set to 0
    acc[formattedDepartment] = { department: formattedDepartment };
    Object.values(encounterMediaChoicesData).forEach((mediaType) => {
      acc[formattedDepartment][mediaType] = 0;
    });

    // Iterate over the encounters and increment the count of the media types for the department
    encounterData.forEach((encounter) => {
      if (formatDepartmentName(encounter.department) === formattedDepartment) {
        (encounter.media_types || []).forEach((mediaType) => {
          if (Object.values(encounterMediaChoicesData).includes(mediaType)) {
            acc[formattedDepartment][mediaType]++;
          }
        });
      }
    });

    return acc;
  }, {} as { [key: string]: any });

  return Object.values(data);
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

export const getTotalMediaCount = (
  encounterData: EncouterDataType[],
  encounterMediaChoicesData: EncounterMediaChoicesDataType
) => {
  const mediaCounts = Object.values(encounterMediaChoicesData).reduce(
    (acc, mediaType) => {
      acc[mediaType] = 0;
      return acc;
    },
    {} as { [key: string]: number }
  );

  encounterData.forEach((encounter) => {
    encounter.media_types.forEach((mediaType) => {
      if (mediaCounts[mediaType] !== undefined) {
        mediaCounts[mediaType]++;
      }
    });
  });

  return Object.entries(mediaCounts).map(([mediaType, count]) => ({
    mediaType,
    count,
  }));
};
