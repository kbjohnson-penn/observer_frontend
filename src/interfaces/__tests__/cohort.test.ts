/**
 * Tests for cohort interfaces and utility functions
 */

import { getCohortFilterSummary, getDetailedFilterSummary } from '../cohort';
import type { VisitSearchFilters } from '../research';

describe('cohort interfaces', () => {
  describe('getCohortFilterSummary', () => {
    it('should count visit filters correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [1, 2],
          visit_source_value: ['ER'],
          date_from: '2024-01-01',
          date_to: '2024-12-31',
        },
        person_demographics: {},
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(4);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(4);
    });

    it('should count person demographic filters correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          gender: ['M', 'F'],
          race: ['W'],
          ethnicity: ['H'],
          year_of_birth_from: 1980,
          year_of_birth_to: 2000,
        },
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(4); // gender, race, ethnicity, year_of_birth range
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(4);
    });

    it('should count provider demographic filters correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {
          gender: ['M'],
          race: ['W', 'B'],
          ethnicity: ['NH'],
          year_of_birth_from: 1970,
        },
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(4); // gender, race, ethnicity, year_of_birth
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(4);
    });

    it('should count clinical filters correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {
          conditions: { condition_codes: ['123'] },
          labs: { procedure_names: ['Lab1'] },
          drugs: { drug_names: ['Drug1'] },
          procedures: { procedure_names: ['Proc1'] },
          notes: { note_types: ['Type1'] },
          observations: { file_types: ['pdf'] },
          measurements: { bp_systolic_min: 120 },
        },
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(7);
      expect(summary.totalActiveFilters).toBe(7);
    });

    it('should handle mixed filters from all categories', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [1],
          date_from: '2024-01-01',
        },
        person_demographics: {
          gender: ['M'],
        },
        provider_demographics: {
          race: ['W'],
        },
        clinical: {
          conditions: { condition_codes: ['123'] },
          drugs: { drug_names: ['Aspirin'] },
        },
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(2);
      expect(summary.personDemographicFilters).toBe(1);
      expect(summary.providerDemographicFilters).toBe(1);
      expect(summary.clinicalFilters).toBe(2);
      expect(summary.totalActiveFilters).toBe(6);
    });

    it('should handle empty filters', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(0);
    });

    it('should not count empty arrays as filters', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [], // Empty array should not count
          visit_source_value: [], // Empty array should not count
        },
        person_demographics: {
          gender: [], // Empty array should not count
        },
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(0);
    });

    it('should count year_of_birth range as one filter when both from and to are present', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          year_of_birth_from: 1980,
          year_of_birth_to: 2000,
        },
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.personDemographicFilters).toBe(1); // Only one filter for the range
    });

    it('should count year_of_birth as one filter when only from is present', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          year_of_birth_from: 1980,
        },
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.personDemographicFilters).toBe(1);
    });

    it('should count year_of_birth as one filter when only to is present', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          year_of_birth_to: 2000,
        },
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.personDemographicFilters).toBe(1);
    });

    it('should handle partial clinical filters', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {
          conditions: { condition_codes: ['123'] },
          // Other clinical filters undefined/missing
        },
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary.clinicalFilters).toBe(1);
      expect(summary.totalActiveFilters).toBe(1);
    });

    it('should return correct structure with all expected fields', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {},
      };

      const summary = getCohortFilterSummary(filters);

      expect(summary).toHaveProperty('visitFilters');
      expect(summary).toHaveProperty('personDemographicFilters');
      expect(summary).toHaveProperty('providerDemographicFilters');
      expect(summary).toHaveProperty('clinicalFilters');
      expect(summary).toHaveProperty('totalActiveFilters');
    });

    it('should handle null filters gracefully', () => {
      const summary = getCohortFilterSummary(null);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(0);
    });

    it('should handle undefined filters gracefully', () => {
      const summary = getCohortFilterSummary(undefined);

      expect(summary.visitFilters).toBe(0);
      expect(summary.personDemographicFilters).toBe(0);
      expect(summary.providerDemographicFilters).toBe(0);
      expect(summary.clinicalFilters).toBe(0);
      expect(summary.totalActiveFilters).toBe(0);
    });
  });

  describe('getDetailedFilterSummary', () => {
    it('should return empty result for null filters', () => {
      const result = getDetailedFilterSummary(null);

      expect(result.visit.tiers).toEqual([]);
      expect(result.visit.visitSources).toEqual([]);
      expect(result.visit.dateFrom).toBeNull();
      expect(result.visit.dateTo).toBeNull();
      expect(result.personDemographics.gender).toEqual([]);
      expect(result.personDemographics.race).toEqual([]);
      expect(result.personDemographics.ethnicity).toEqual([]);
      expect(result.personDemographics.yearOfBirthFrom).toBeNull();
      expect(result.personDemographics.yearOfBirthTo).toBeNull();
      expect(result.providerDemographics.gender).toEqual([]);
      expect(result.providerDemographics.race).toEqual([]);
      expect(result.providerDemographics.ethnicity).toEqual([]);
      expect(result.providerDemographics.yearOfBirthFrom).toBeNull();
      expect(result.providerDemographics.yearOfBirthTo).toBeNull();
      expect(result.clinical.hasConditions).toBe(false);
      expect(result.clinical.hasLabs).toBe(false);
      expect(result.clinical.hasDrugs).toBe(false);
      expect(result.clinical.hasProcedures).toBe(false);
      expect(result.clinical.hasNotes).toBe(false);
      expect(result.clinical.hasObservations).toBe(false);
      expect(result.clinical.hasMeasurements).toBe(false);
      expect(result.totalActiveFilters).toBe(0);
    });

    it('should return empty result for undefined filters', () => {
      const result = getDetailedFilterSummary(undefined);

      expect(result.totalActiveFilters).toBe(0);
      expect(result.visit.tiers).toEqual([]);
    });

    it('should extract visit filter details correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [1, 2, 3],
          visit_source_value: ['clinic', 'simcenter'],
          date_from: '2024-01-01',
          date_to: '2024-12-31',
        },
        person_demographics: {},
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.visit.tiers).toEqual([1, 2, 3]);
      expect(result.visit.visitSources).toEqual(['clinic', 'simcenter']);
      expect(result.visit.dateFrom).toBe('2024-01-01');
      expect(result.visit.dateTo).toBe('2024-12-31');
      expect(result.totalActiveFilters).toBe(4);
    });

    it('should extract person demographic details correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          gender: ['M', 'F'],
          race: ['W', 'B'],
          ethnicity: ['H'],
          year_of_birth_from: 1980,
          year_of_birth_to: 2000,
        },
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.personDemographics.gender).toEqual(['M', 'F']);
      expect(result.personDemographics.race).toEqual(['W', 'B']);
      expect(result.personDemographics.ethnicity).toEqual(['H']);
      expect(result.personDemographics.yearOfBirthFrom).toBe(1980);
      expect(result.personDemographics.yearOfBirthTo).toBe(2000);
      expect(result.totalActiveFilters).toBe(4); // gender, race, ethnicity, year range
    });

    it('should extract provider demographic details correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {
          gender: ['F'],
          race: ['A'],
          ethnicity: ['NH'],
          year_of_birth_from: 1970,
        },
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.providerDemographics.gender).toEqual(['F']);
      expect(result.providerDemographics.race).toEqual(['A']);
      expect(result.providerDemographics.ethnicity).toEqual(['NH']);
      expect(result.providerDemographics.yearOfBirthFrom).toBe(1970);
      expect(result.providerDemographics.yearOfBirthTo).toBeNull();
      expect(result.totalActiveFilters).toBe(4);
    });

    it('should extract clinical filter flags correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {
          conditions: { condition_codes: ['123'] },
          labs: { procedure_names: ['Lab1'] },
          drugs: { drug_names: ['Drug1'] },
          procedures: { procedure_names: ['Proc1'] },
          notes: { note_types: ['Type1'] },
          observations: { file_types: ['pdf'] },
          measurements: { bp_systolic_min: 120 },
        },
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.clinical.hasConditions).toBe(true);
      expect(result.clinical.hasLabs).toBe(true);
      expect(result.clinical.hasDrugs).toBe(true);
      expect(result.clinical.hasProcedures).toBe(true);
      expect(result.clinical.hasNotes).toBe(true);
      expect(result.clinical.hasObservations).toBe(true);
      expect(result.clinical.hasMeasurements).toBe(true);
      expect(result.totalActiveFilters).toBe(7);
    });

    it('should handle mixed filters from all categories', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [1],
          date_from: '2024-01-01',
        },
        person_demographics: {
          gender: ['M'],
        },
        provider_demographics: {
          race: ['W'],
        },
        clinical: {
          conditions: { condition_codes: ['123'] },
          drugs: { drug_names: ['Aspirin'] },
        },
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.visit.tiers).toEqual([1]);
      expect(result.visit.dateFrom).toBe('2024-01-01');
      expect(result.personDemographics.gender).toEqual(['M']);
      expect(result.providerDemographics.race).toEqual(['W']);
      expect(result.clinical.hasConditions).toBe(true);
      expect(result.clinical.hasDrugs).toBe(true);
      expect(result.totalActiveFilters).toBe(6);
    });

    it('should not count empty arrays as filters', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [],
          visit_source_value: [],
        },
        person_demographics: {
          gender: [],
          race: [],
        },
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.visit.tiers).toEqual([]);
      expect(result.visit.visitSources).toEqual([]);
      expect(result.personDemographics.gender).toEqual([]);
      expect(result.personDemographics.race).toEqual([]);
      expect(result.totalActiveFilters).toBe(0);
    });

    it('should count year_of_birth range as one filter when both present', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          year_of_birth_from: 1980,
          year_of_birth_to: 2000,
        },
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.personDemographics.yearOfBirthFrom).toBe(1980);
      expect(result.personDemographics.yearOfBirthTo).toBe(2000);
      expect(result.totalActiveFilters).toBe(1); // Only one filter for the range
    });

    it('should count year_of_birth as one filter when only from is present', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {
          year_of_birth_from: 1980,
        },
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result.personDemographics.yearOfBirthFrom).toBe(1980);
      expect(result.personDemographics.yearOfBirthTo).toBeNull();
      expect(result.totalActiveFilters).toBe(1);
    });

    it('should return copies of arrays, not references', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_level: [1, 2],
        },
        person_demographics: {
          gender: ['M'],
        },
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      // Modify the result arrays
      result.visit.tiers.push(99);
      result.personDemographics.gender.push('F');

      // Original filters should not be affected
      expect(filters.visit?.tier_level).toEqual([1, 2]);
      expect(filters.person_demographics?.gender).toEqual(['M']);
    });

    it('should return correct structure with all expected fields', () => {
      const filters: VisitSearchFilters = {
        visit: {},
        person_demographics: {},
        provider_demographics: {},
        clinical: {},
      };

      const result = getDetailedFilterSummary(filters);

      expect(result).toHaveProperty('visit');
      expect(result.visit).toHaveProperty('tiers');
      expect(result.visit).toHaveProperty('visitSources');
      expect(result.visit).toHaveProperty('dateFrom');
      expect(result.visit).toHaveProperty('dateTo');

      expect(result).toHaveProperty('personDemographics');
      expect(result.personDemographics).toHaveProperty('gender');
      expect(result.personDemographics).toHaveProperty('race');
      expect(result.personDemographics).toHaveProperty('ethnicity');
      expect(result.personDemographics).toHaveProperty('yearOfBirthFrom');
      expect(result.personDemographics).toHaveProperty('yearOfBirthTo');

      expect(result).toHaveProperty('providerDemographics');
      expect(result.providerDemographics).toHaveProperty('gender');
      expect(result.providerDemographics).toHaveProperty('race');
      expect(result.providerDemographics).toHaveProperty('ethnicity');
      expect(result.providerDemographics).toHaveProperty('yearOfBirthFrom');
      expect(result.providerDemographics).toHaveProperty('yearOfBirthTo');

      expect(result).toHaveProperty('clinical');
      expect(result.clinical).toHaveProperty('hasConditions');
      expect(result.clinical).toHaveProperty('hasLabs');
      expect(result.clinical).toHaveProperty('hasDrugs');
      expect(result.clinical).toHaveProperty('hasProcedures');
      expect(result.clinical).toHaveProperty('hasNotes');
      expect(result.clinical).toHaveProperty('hasObservations');
      expect(result.clinical).toHaveProperty('hasMeasurements');

      expect(result).toHaveProperty('totalActiveFilters');
    });
  });
});
