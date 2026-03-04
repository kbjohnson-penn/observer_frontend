/**
 * Filter transformation utilities for ResearchTab
 * Converts local UI filter state to server-side filter format
 */

import { LocalFilters, DemographicFilterValues } from '@/interfaces/researchTab';
import { VisitSearchFilters } from '@/interfaces/research';

/**
 * Parses and validates age range values.
 * Returns age_from/age_to for backend filtering on age at time of visit.
 * @param ageFrom - Minimum age string
 * @param ageTo - Maximum age string
 * @returns Object with age_from and age_to
 */
function parseAgeRange(ageFrom: string, ageTo: string): { age_from?: number; age_to?: number } {
  const result: { age_from?: number; age_to?: number } = {};

  if (ageFrom) {
    const age = parseInt(ageFrom, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      return {};
    }
    result.age_from = age;
  }

  if (ageTo) {
    const age = parseInt(ageTo, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      return {};
    }
    result.age_to = age;
  }

  // Validate logical consistency only if both values are valid numbers
  if (ageFrom && ageTo) {
    const minAge = parseInt(ageFrom, 10);
    const maxAge = parseInt(ageTo, 10);
    if (!isNaN(minAge) && !isNaN(maxAge) && minAge > maxAge) {
      // Don't throw error during typing - just skip the invalid range
      return {};
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
    const ageRange = parseAgeRange(values.ageFrom, values.ageTo);
    Object.assign(filters, ageRange);
  }

  return filters;
}

/**
 * Builds visit filter object from local filter values
 * @param localFilters - Local filter state
 * @returns Visit filters object or undefined if no filters
 */
function buildVisitFilters(localFilters: LocalFilters): VisitSearchFilters['visit'] | undefined {
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
    filters.tier_level = localFilters.tier.map((t) => parseInt(t, 10));
  }

  if (localFilters.visitSource.length > 0) {
    filters.visit_source_value = localFilters.visitSource;
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
export function buildServerFilters(localFilters: LocalFilters): VisitSearchFilters {
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
