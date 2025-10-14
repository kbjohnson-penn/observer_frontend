/**
 * Filter transformation utilities for ResearchTab
 * Converts local UI filter state to server-side filter format
 */

import { LocalFilters, DemographicFilterValues } from '@/interfaces/researchTab';
import { VisitSearchFilters } from '@/interfaces/research';

/**
 * Converts age to year of birth range
 * @param ageFrom - Minimum age
 * @param ageTo - Maximum age
 * @returns Object with year_of_birth_from and year_of_birth_to
 * @throws Error if age values are invalid
 */
function ageToYearOfBirth(
  ageFrom: string,
  ageTo: string
): { year_of_birth_from?: number; year_of_birth_to?: number } {
  const currentYear = new Date().getFullYear();
  const result: { year_of_birth_from?: number; year_of_birth_to?: number } = {};

  if (ageFrom) {
    const age = parseInt(ageFrom, 10);  // Always specify radix
    if (isNaN(age) || age < 0 || age > 150) {
      throw new Error('Invalid minimum age: must be between 0 and 150');
    }
    // Min age means max year of birth (someone who is at least X years old)
    result.year_of_birth_to = currentYear - age;
  }

  if (ageTo) {
    const age = parseInt(ageTo, 10);  // Always specify radix
    if (isNaN(age) || age < 0 || age > 150) {
      throw new Error('Invalid maximum age: must be between 0 and 150');
    }
    // Max age means min year of birth (someone who is at most X years old)
    result.year_of_birth_from = currentYear - age;
  }

  // Validate logical consistency
  if (ageFrom && ageTo) {
    const minAge = parseInt(ageFrom, 10);
    const maxAge = parseInt(ageTo, 10);
    if (minAge > maxAge) {
      throw new Error('Minimum age cannot be greater than maximum age');
    }
  }

  return result;
}

/**
 * Builds demographic filter object from local filter values
 * @param values - Demographic filter values (gender, race, ethnicity, age)
 * @returns Demographic filters object or undefined if no filters
 */
function buildDemographicFilters(
  values: DemographicFilterValues
): VisitSearchFilters['person_demographics'] | undefined {
  const hasFilters =
    values.gender.length > 0 ||
    values.race.length > 0 ||
    values.ethnicity.length > 0 ||
    values.ageFrom ||
    values.ageTo;

  if (!hasFilters) {
    return undefined;
  }

  const filters: VisitSearchFilters['person_demographics'] = {};

  if (values.gender.length > 0) {
    filters.gender = values.gender;
  }

  if (values.race.length > 0) {
    filters.race = values.race;
  }

  if (values.ethnicity.length > 0) {
    filters.ethnicity = values.ethnicity;
  }

  if (values.ageFrom || values.ageTo) {
    const yearOfBirth = ageToYearOfBirth(values.ageFrom, values.ageTo);
    Object.assign(filters, yearOfBirth);
  }

  return filters;
}

/**
 * Builds visit filter object from local filter values
 * @param localFilters - Local filter state
 * @returns Visit filters object or undefined if no filters
 */
function buildVisitFilters(
  localFilters: LocalFilters
): VisitSearchFilters['visit'] | undefined {
  const hasFilters =
    localFilters.tier.length > 0 ||
    localFilters.visitSource.length > 0 ||
    localFilters.dateFrom ||
    localFilters.dateTo;

  if (!hasFilters) {
    return undefined;
  }

  const filters: VisitSearchFilters['visit'] = {};

  if (localFilters.tier.length > 0) {
    filters.tier_id = localFilters.tier.map((t) => parseInt(t));
  }

  if (localFilters.visitSource.length > 0) {
    filters.visit_source_value = localFilters.visitSource.join(',');
  }

  if (localFilters.dateFrom) {
    filters.date_from = localFilters.dateFrom;
  }

  if (localFilters.dateTo) {
    filters.date_to = localFilters.dateTo;
  }

  return filters;
}

/**
 * Converts local filter state to server-side filter format
 * @param localFilters - Local filter state from component
 * @returns Server-side filter object for API request
 */
export function buildServerFilters(
  localFilters: LocalFilters
): VisitSearchFilters {
  const serverFilters: VisitSearchFilters = {};

  // Visit filters
  const visitFilters = buildVisitFilters(localFilters);
  if (visitFilters) {
    serverFilters.visit = visitFilters;
  }

  // Person demographics filters
  const personDemographics = buildDemographicFilters({
    gender: localFilters.personGender,
    race: localFilters.personRace,
    ethnicity: localFilters.personEthnicity,
    ageFrom: localFilters.personAgeFrom,
    ageTo: localFilters.personAgeTo,
  });
  if (personDemographics) {
    serverFilters.person_demographics = personDemographics;
  }

  // Provider demographics filters
  const providerDemographics = buildDemographicFilters({
    gender: localFilters.providerGender,
    race: localFilters.providerRace,
    ethnicity: localFilters.providerEthnicity,
    ageFrom: localFilters.providerAgeFrom,
    ageTo: localFilters.providerAgeTo,
  });
  if (providerDemographics) {
    serverFilters.provider_demographics = providerDemographics;
  }

  return serverFilters;
}
