/**
 * Tests for cohort interfaces and utility functions
 */

import { getCohortFilterSummary } from '../cohort';
import type { VisitSearchFilters } from '../research';

describe('cohort interfaces', () => {
  describe('getCohortFilterSummary', () => {
    it('should count visit filters correctly', () => {
      const filters: VisitSearchFilters = {
        visit: {
          tier_id: [1, 2],
          visit_source_value: 'ER',
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
          tier_id: [1],
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
          tier_id: [], // Empty array should not count
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
});
