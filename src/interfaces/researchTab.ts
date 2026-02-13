/**
 * TypeScript interfaces for ResearchTab component
 * Local filter state and helper types
 */

export type DemographicType = 'gender' | 'race' | 'ethnicity';

export interface LocalFilters {
  visitSource: string[];
  tier: string[];
  dateFrom: string;
  dateTo: string;
  personGender: string[];
  personRace: string[];
  personEthnicity: string[];
  personAgeFrom: string;
  personAgeTo: string;
  providerGender: string[];
  providerRace: string[];
  providerEthnicity: string[];
  providerAgeFrom: string;
  providerAgeTo: string;
}

export interface DemographicFilterValues {
  gender: string[];
  race: string[];
  ethnicity: string[];
  ageFrom: string;
  ageTo: string;
}

export const INITIAL_LOCAL_FILTERS: LocalFilters = {
  visitSource: [],
  tier: [],
  dateFrom: '',
  dateTo: '',
  personGender: [],
  personRace: [],
  personEthnicity: [],
  personAgeFrom: '',
  personAgeTo: '',
  providerGender: [],
  providerRace: [],
  providerEthnicity: [],
  providerAgeFrom: '',
  providerAgeTo: '',
};
