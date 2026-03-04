import { buildServerFilters } from '../filterTransformer';
import { INITIAL_LOCAL_FILTERS } from '@/interfaces/researchTab';

describe('buildServerFilters', () => {
  // Helper to create filters with only specific overrides
  const filtersWith = (overrides: Partial<typeof INITIAL_LOCAL_FILTERS>) => ({
    ...INITIAL_LOCAL_FILTERS,
    ...overrides,
  });

  describe('age filter handling (age at time of visit)', () => {
    it('should send age_from when only min age is set', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '30' }));

      expect(result.person_demographics).toEqual({ age_from: 30 });
    });

    it('should send age_to when only max age is set', () => {
      const result = buildServerFilters(filtersWith({ personAgeTo: '80' }));

      expect(result.person_demographics).toEqual({ age_to: 80 });
    });

    it('should send both age_from and age_to when both are set', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '30', personAgeTo: '80' }));

      expect(result.person_demographics).toEqual({ age_from: 30, age_to: 80 });
    });

    it('should not include age fields for negative age', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '-5' }));

      // parseAgeRange returns {} for invalid, but personAgeFrom is truthy so
      // hasFilters is true → returns an empty demographics object
      expect(result.person_demographics).toBeDefined();
      expect(result.person_demographics).not.toHaveProperty('age_from');
      expect(result.person_demographics).not.toHaveProperty('age_to');
    });

    it('should not include age fields for age > 150', () => {
      const result = buildServerFilters(filtersWith({ personAgeTo: '200' }));

      expect(result.person_demographics).toBeDefined();
      expect(result.person_demographics).not.toHaveProperty('age_from');
      expect(result.person_demographics).not.toHaveProperty('age_to');
    });

    it('should not include age fields for non-numeric input', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: 'abc' }));

      expect(result.person_demographics).toBeDefined();
      expect(result.person_demographics).not.toHaveProperty('age_from');
      expect(result.person_demographics).not.toHaveProperty('age_to');
    });

    it('should not include age fields when age_from > age_to', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '80', personAgeTo: '30' }));

      expect(result.person_demographics).toBeDefined();
      expect(result.person_demographics).not.toHaveProperty('age_from');
      expect(result.person_demographics).not.toHaveProperty('age_to');
    });

    it('should not include demographics when age strings are empty', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '', personAgeTo: '' }));

      expect(result.person_demographics).toBeUndefined();
    });

    it('should handle provider age filters the same way', () => {
      const result = buildServerFilters(
        filtersWith({ providerAgeFrom: '40', providerAgeTo: '60' })
      );

      expect(result.provider_demographics).toEqual({ age_from: 40, age_to: 60 });
    });

    it('should never send year_of_birth_from or year_of_birth_to (regression)', () => {
      const result = buildServerFilters(filtersWith({ personAgeFrom: '25', personAgeTo: '75' }));

      const resultStr = JSON.stringify(result);
      expect(resultStr).not.toContain('year_of_birth_from');
      expect(resultStr).not.toContain('year_of_birth_to');
    });
  });

  describe('combined filters', () => {
    it('should include age alongside other demographic filters', () => {
      const result = buildServerFilters(
        filtersWith({
          personGender: ['M'],
          personAgeFrom: '30',
          personAgeTo: '50',
        })
      );

      expect(result.person_demographics).toEqual({
        gender: ['M'],
        age_from: 30,
        age_to: 50,
      });
    });

    it('should handle visit filters alongside demographics', () => {
      const result = buildServerFilters(
        filtersWith({
          tier: ['1', '2'],
          personAgeFrom: '65',
        })
      );

      expect(result.visit).toEqual({ tier_level: [1, 2] });
      expect(result.person_demographics).toEqual({ age_from: 65 });
    });

    it('should return empty object when no filters are set', () => {
      const result = buildServerFilters(INITIAL_LOCAL_FILTERS);

      expect(result).toEqual({});
    });
  });
});
