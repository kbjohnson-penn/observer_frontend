import * as d3 from 'd3';
import { PublicDepartmentDataType } from '@/interfaces/department';
import { PublicPatientDataType } from '@/interfaces/patient';
import { PublicProviderDataType } from '@/interfaces/provider';
import {
  PublicEncounterDataType,
  CombinedDataType,
  FlattenedCombinedDataType,
  NestedCombinedDataType,
} from '@/interfaces/encounter';
import { PublicMultiModalDataType } from '@/interfaces/mmd';
import {
  ETHNIC_CATEGORIES,
  RACIAL_CATEGORIES,
  GENDER_CATEGORIES,
  CSV_COLUMN_ORDER,
  NULL_MARKER,
} from '../../constants';

export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const parseLocalDate = (dateString: string): Date => {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return new Date(NaN); // Return Invalid Date for malformed input
  }
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date(NaN);
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return new Date(NaN);
  }
  return new Date(year, month - 1, day);
};

export const formatDateForDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) {
    return 'N/A';
  }

  // Validate format: must be YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return 'N/A';
  }

  const [year, month, day] = parts.map(Number);

  // Validate parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return 'N/A';
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return 'N/A';
  }

  return new Date(year, month - 1, day).toLocaleDateString();
};

export const getDepartmentColors = (departmentData: PublicDepartmentDataType[]) => {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const departmentColors: { [key: string]: string } = {}; // Add index signature

  departmentData.forEach((department, index) => {
    departmentColors[department.name] = colorScale(String(index));
  });

  return departmentColors;
};

export const getSummaryStats = (
  allEncounterData: PublicEncounterDataType[]
): { [key: string]: number } => {
  const stats: { [key: string]: number } = {
    totalEncounters: allEncounterData.length,
    totalPatients: new Set(allEncounterData.map((e) => e.patient_id)).size,
    totalProviders: new Set(allEncounterData.map((e) => e.provider_id)).size,
    totalDepartments: new Set(allEncounterData.map((e) => e.department)).size,
    totalAccessControlled: allEncounterData.filter((e) => e.is_restricted).length,
    totalNotAccessControlled: allEncounterData.filter((e) => !e.is_restricted).length,
    totalDeidentified: allEncounterData.filter((e) => e.is_deidentified).length,
    totalNotDeidentified: allEncounterData.filter((e) => !e.is_deidentified).length,
  };

  return stats;
};

export const getAccessControlByDepartment = (
  filteredEncounterData: PublicEncounterDataType[],
  departmentData: PublicDepartmentDataType[]
): {
  department: string;
  accessControlled: number;
  notAccessControlled: number;
}[] => {
  const data = departmentData.map((department) => {
    const accessControlled = filteredEncounterData.filter(
      (encounter) => encounter.department === department.name && encounter.is_restricted
    ).length;
    const notAccessControlled = filteredEncounterData.filter(
      (encounter) => encounter.department === department.name && !encounter.is_restricted
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
  filteredEncounterData: PublicEncounterDataType[],
  multiModalDataPathsData: PublicMultiModalDataType[]
): { name: string; count: number }[] => {
  const data: { [key: string]: number } = {
    provider_view: 0,
    patient_view: 0,
    room_view: 0,
    audio: 0,
    transcript: 0,
    patient_survey: 0,
    provider_survey: 0,
    patient_annotation: 0,
    provider_annotation: 0,
    // rias_transcript: 0,
    // rias_codes: 0,
  };

  // Convert multiModalDataPathsData array to a lookup map
  const multiModalDataPathsLookup = multiModalDataPathsData.reduce(
    (lookup, dataPath) => {
      // Handle both number and string IDs
      lookup[String(dataPath.id)] = dataPath;
      return lookup;
    },
    {} as { [key: string]: PublicMultiModalDataType }
  );

  filteredEncounterData.forEach((encounter) => {
    // Convert multi_modal_data_id to string to ensure consistent lookup
    // Skip encounters that don't have a valid multi_modal_data_id
    if (!encounter.multi_modal_data_id) {
      // Encounter has no multi_modal_data_id - skip
      return;
    }

    const matchedMultiModalDataPath =
      multiModalDataPathsLookup[String(encounter.multi_modal_data_id)];

    if (matchedMultiModalDataPath) {
      Object.keys(data).forEach((key) => {
        if (matchedMultiModalDataPath[key as keyof PublicMultiModalDataType]) {
          data[key]++;
        }
      });
    } else {
      // No multimodal data found for encounter - skip
    }
  });

  // Return all data types, including those with zero counts
  return Object.keys(data).map((key) => ({
    name: key,
    count: data[key],
  }));
};

export const getEncountersByGroup = (
  filteredEncounterData: PublicEncounterDataType[],
  patientsData: PublicPatientDataType[],
  providerData: PublicProviderDataType[],
  groupKey: 'race' | 'ethnicity',
  groupCategories: { [key: string]: string }
): { name: string; patientCount: number; providerCount: number }[] => {
  const groupNames = Object.keys(groupCategories);
  const counts: {
    [key: string]: {
      patientCount: Set<number | string>;
      providerCount: Set<number | string>;
    };
  } = {};

  // Initialize all possible groups
  groupNames.forEach((group) => {
    counts[group] = {
      patientCount: new Set<number | string>(),
      providerCount: new Set<number | string>(),
    };
  });

  // Convert to lookup maps for more efficient lookup
  const patientsMap = new Map(patientsData.map((patient) => [String(patient.id), patient]));
  const providersMap = new Map(providerData.map((provider) => [String(provider.id), provider]));

  for (const encounter of filteredEncounterData) {
    // Skip if patient_id or provider_id is missing
    if (!encounter.patient_id || !encounter.provider_id) {
      // Encounter has missing patient_id or provider_id - skip
      continue;
    }

    // Convert to string for consistent comparison
    const patientId = String(encounter.patient_id);
    const providerId = String(encounter.provider_id);

    // Find matching patient and provider using Map lookup
    const patient = patientsMap.get(patientId);
    const provider = providersMap.get(providerId);

    // Handle patient data
    if (patient && patient[groupKey]) {
      const patientGroup = patient[groupKey];
      if (counts[patientGroup]) {
        counts[patientGroup].patientCount.add(patient.id);
      } else {
        // Unknown group for patient - skip
      }
    }

    // Handle provider data
    if (provider && provider[groupKey]) {
      const providerGroup = provider[groupKey];
      if (counts[providerGroup]) {
        counts[providerGroup].providerCount.add(provider.id);
      } else {
        // Unknown group for provider - skip
      }
    }
  }

  // Generate result with all categories, even if count is zero
  return groupNames.map((group) => ({
    name: groupCategories[group],
    patientCount: counts[group]?.patientCount.size || 0,
    providerCount: counts[group]?.providerCount.size || 0,
  }));
};

export const getEncountersByEthnicGroups = (
  filteredEncounterData: PublicEncounterDataType[],
  patientsData: PublicPatientDataType[],
  providerData: PublicProviderDataType[]
): { name: string; patientCount: number; providerCount: number }[] => {
  return getEncountersByGroup(
    filteredEncounterData,
    patientsData,
    providerData,
    'ethnicity',
    ETHNIC_CATEGORIES
  );
};

export const getEncountersByRacialGroups = (
  filteredEncounterData: PublicEncounterDataType[],
  patientsData: PublicPatientDataType[],
  providerData: PublicProviderDataType[]
): { name: string; patientCount: number; providerCount: number }[] => {
  return getEncountersByGroup(
    filteredEncounterData,
    patientsData,
    providerData,
    'race',
    RACIAL_CATEGORIES
  );
};

interface GroupedDataType {
  [key: string]: {
    patientSatisfaction: number;
    providerSatisfaction: number;
    count: number;
  };
}

export const getSatisfactionData = (
  filteredEncounterData: PublicEncounterDataType[]
): {
  patientSatisfaction: number;
  providerSatisfaction: number;
  count: number;
}[] => {
  const groupedData: GroupedDataType = filteredEncounterData
    .filter((encounter) => {
      // Skip encounters without satisfaction data
      if (
        encounter.patient_satisfaction === undefined ||
        encounter.provider_satisfaction === undefined ||
        encounter.patient_satisfaction === null ||
        encounter.provider_satisfaction === null
      ) {
        return false;
      }

      try {
        // Convert string satisfaction to number if needed and check if both aren't zero
        const patientSat =
          typeof encounter.patient_satisfaction === 'string'
            ? parseFloat(encounter.patient_satisfaction)
            : encounter.patient_satisfaction;

        const providerSat =
          typeof encounter.provider_satisfaction === 'string'
            ? parseFloat(encounter.provider_satisfaction)
            : encounter.provider_satisfaction;

        // Only include if the values are valid numbers
        if (isNaN(patientSat) || isNaN(providerSat)) {
          return false;
        }

        return !(patientSat === 0 && providerSat === 0);
      } catch {
        // Error processing satisfaction data - skip encounter
        return false;
      }
    })
    .map((encounter) => {
      try {
        // Parse satisfaction values to numbers if they're strings
        const patientSat =
          typeof encounter.patient_satisfaction === 'string'
            ? parseFloat(encounter.patient_satisfaction)
            : encounter.patient_satisfaction;

        const providerSat =
          typeof encounter.provider_satisfaction === 'string'
            ? parseFloat(encounter.provider_satisfaction)
            : encounter.provider_satisfaction;

        // Use a default max score of 5 if id is missing
        const patientMaxScore = encounter.id && encounter.id <= 35 ? 4 : 5;
        const providerMaxScore = encounter.id && encounter.id <= 35 ? 4 : 5;

        // Prevent division by zero with fallback to 0
        const normalizedPatientSatisfaction = Math.min(
          ((patientSat || 0) / patientMaxScore) * 100,
          100
        );
        const normalizedProviderSatisfaction = Math.min(
          ((providerSat || 0) / providerMaxScore) * 100,
          100
        );

        return {
          patientSatisfaction: normalizedPatientSatisfaction,
          providerSatisfaction: normalizedProviderSatisfaction,
        };
      } catch {
        // Error normalizing satisfaction data - skip encounter
        // Return default values if there's an error
        return {
          patientSatisfaction: 0,
          providerSatisfaction: 0,
        };
      }
    })
    .reduce((acc: GroupedDataType, curr) => {
      const key = `${curr.patientSatisfaction}-${curr.providerSatisfaction}`;
      if (!acc[key]) {
        acc[key] = { ...curr, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});

  return Object.values(groupedData);
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

const orderObject = (obj: Record<string, any>, order: string[]): Record<string, any> => {
  const ordered: Record<string, any> = {};
  for (const key of order) {
    ordered[key] = obj[key] === undefined ? '' : obj[key];
  }
  return ordered;
};

export const compileData = (
  filteredEncounterData: PublicEncounterDataType[],
  patientsData: PublicPatientDataType[],
  providerData: PublicProviderDataType[],
  multiModalData: PublicMultiModalDataType[],
  format: string
): CombinedDataType[] => {
  const patientsMap = new Map(patientsData.map((item) => [item.id, item]));
  const providersMap = new Map(providerData.map((item) => [item.id, item]));
  const multiModalDataMap = new Map(multiModalData.map((item) => [item.id, item]));

  // Filter out encounters with missing related data
  const validEncounters = filteredEncounterData.filter((encounter) => {
    // Handle string or number ids for lookup
    const patient = patientsMap.get(
      typeof encounter.patient_id === 'string'
        ? parseInt(encounter.patient_id, 10)
        : encounter.patient_id
    );

    const provider = providersMap.get(
      typeof encounter.provider_id === 'string'
        ? parseInt(encounter.provider_id, 10)
        : encounter.provider_id
    );

    const multiModalDataPath = multiModalDataMap.get(
      typeof encounter.multi_modal_data_id === 'string'
        ? parseInt(encounter.multi_modal_data_id, 10)
        : encounter.multi_modal_data_id
    );

    return patient && provider && multiModalDataPath;
  });

  const combinedData = validEncounters.map((encounter) => {
    // Handle string or number ids for lookup
    const patient = patientsMap.get(
      typeof encounter.patient_id === 'string'
        ? parseInt(encounter.patient_id, 10)
        : encounter.patient_id
    );

    const provider = providersMap.get(
      typeof encounter.provider_id === 'string'
        ? parseInt(encounter.provider_id, 10)
        : encounter.provider_id
    );

    const multiModalDataPath = multiModalDataMap.get(
      typeof encounter.multi_modal_data_id === 'string'
        ? parseInt(encounter.multi_modal_data_id, 10)
        : encounter.multi_modal_data_id
    );

    // This check is now redundant because of our filtering above, but kept for safety
    if (!patient || !provider || !multiModalDataPath) {
      // Skipping encounter due to missing related data
      return null;
    }

    const safeEncounter = {
      ...encounter,
      encounter_date_and_time:
        'encounter_date_and_time' in encounter
          ? (encounter as PublicEncounterDataType).encounter_date_and_time
          : null,
      patient_satisfaction:
        'patient_satisfaction' in encounter
          ? (encounter as PublicEncounterDataType).patient_satisfaction
          : null,
      provider_satisfaction:
        'provider_satisfaction' in encounter
          ? (encounter as PublicEncounterDataType).provider_satisfaction
          : null,
      is_deidentified: encounter.is_deidentified,
      is_restricted: encounter.is_restricted,
    };

    if (format === 'csv') {
      const { id: _, ...patientWithoutId } = addPrefixToKeys(patient, 'patient_');
      const { id: __, ...providerWithoutId } = addPrefixToKeys(provider, 'provider_');

      // Explicitly type the flattened data to match the interface
      const flattenedData: FlattenedCombinedDataType = {
        ...safeEncounter,
        ...patientWithoutId,
        ...providerWithoutId,
        ...multiModalDataPath,
        id: encounter.id,
        provider_id: encounter.provider_id,
        patient_id: encounter.patient_id,
        multi_modal_data_id: encounter.multi_modal_data_id,
        patient_satisfaction: encounter.patient_satisfaction,
        provider_satisfaction: encounter.provider_satisfaction,
        is_deidentified: encounter.is_deidentified,
        is_restricted: encounter.is_restricted,
      };

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

  // Filter out any null values that might have been returned
  const filteredCombinedData = combinedData.filter((data) => data !== null);

  return filteredCombinedData as CombinedDataType[];
};

export const downloadData = (combinedData: CombinedDataType[], format: string) => {
  let dataString: string;
  let mimeType: string;
  let fileExtension: string;

  if (format === 'csv') {
    const flattenObject = (obj: any, prefix = '') => {
      return Object.keys(obj).reduce(
        (acc, k) => {
          const pre = prefix.length ? prefix + '.' : '';
          if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
          } else {
            acc[pre + k] = obj[k];
          }
          return acc;
        },
        {} as Record<string, any>
      );
    };

    const flattenedData = combinedData.map((item) => flattenObject(item));
    const orderedData = flattenedData.map((item) => orderObject(item, CSV_COLUMN_ORDER));
    const header = CSV_COLUMN_ORDER.join(',');
    const csvRows = [header];

    for (const row of orderedData) {
      const values = Object.values(row).map((value) =>
        typeof value === 'object' ? JSON.stringify(value) : value === null ? '' : String(value)
      );
      csvRows.push(values.join(','));
    }

    dataString = csvRows.join('\n');
    mimeType = 'text/csv';
    fileExtension = 'csv';
  } else if (format === 'json') {
    dataString = JSON.stringify(combinedData, null, 2);
    mimeType = 'application/json';
    fileExtension = 'json';
  } else {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const blob = new Blob([dataString], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `observer_platform_data_export.${fileExtension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Visit source formatting
 */

/**
 * Maps visit source values to their display labels
 */
const VISIT_SOURCE_LABELS: Record<string, string> = {
  clinic: 'Clinic',
  simcenter: 'Sim Center',
};

/**
 * Formats visit source values to display labels
 * Handles known values with explicit mapping, falls back to title case
 * @param source - The visit source value (e.g., 'clinic', 'sim_center')
 * @returns Formatted display label (e.g., 'Clinic', 'Sim Center')
 */
export const formatVisitSource = (source: string): string => {
  const normalizedSource = source.toLowerCase();
  if (VISIT_SOURCE_LABELS[normalizedSource]) {
    return VISIT_SOURCE_LABELS[normalizedSource];
  }
  // Fallback: split on underscores and capitalize each word
  return source
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Demographics utilities
 */
type DemographicType = 'gender' | 'race' | 'ethnicity';

/**
 * Expands demographic codes to full text
 * @param code - The demographic code (e.g., 'M', 'W', 'NH')
 * @param type - The type of demographic data
 * @returns Full text representation (e.g., 'Male', 'White', 'Not Hispanic or Latino')
 */
export const expandDemographic = (code: string | null, type: DemographicType): string => {
  if (!code) {
    return 'N/A';
  }

  // Handle the NULL marker from backend for filter display
  if (code === NULL_MARKER) {
    return 'Not Specified';
  }

  const normalizedCode = code.toUpperCase();

  const mappings: Record<DemographicType, Record<string, string>> = {
    gender: GENDER_CATEGORIES,
    race: RACIAL_CATEGORIES,
    ethnicity: ETHNIC_CATEGORIES,
  };

  return mappings[type][normalizedCode] || code;
};
