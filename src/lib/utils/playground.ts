import { EncounterDataType } from "../../interfaces/encounter";
import { SOURCE_OPTIONS } from "../../constants";

export const formatEncounterData = (data: EncounterDataType) => {
  if (!data) {
    return null;
  }

  return {
    caseId: data.case_id,
    encounterSource: data.encounter_source,
    department: data.department,
    provider: data.provider,
    patient: data.patient,
    encounterDateAndTime: data.encounter_date_and_time,
    providerSatisfaction: data.provider_satisfaction,
    patientSatisfaction: data.patient_satisfaction,
    isDeidentified: data.is_deidentified,
    isRestricted: data.is_restricted,
    type: data.type,
    encounterfileIds: data.encounterfile_ids,
    tier: data.tier,
  };
};

export const formatDateToLocaleString = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
