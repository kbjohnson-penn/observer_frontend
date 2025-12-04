/**
 * Unit tests for cohortValidation utility
 */

import {
  COHORT_NAME_PATTERN,
  COHORT_NAME_MIN_LENGTH,
  COHORT_NAME_MAX_LENGTH,
  validateCohortName,
} from '@/lib/utils/cohortValidation';
import { Cohort } from '@/interfaces/cohort';

// Helper to create mock cohorts
const createMockCohort = (overrides: Partial<Cohort> = {}): Cohort => ({
  id: 'test-id-1',
  name: 'Test Cohort',
  description: 'Test description',
  filters: {},
  visitCount: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('cohortValidation', () => {
  describe('COHORT_NAME_PATTERN', () => {
    it('allows letters and numbers', () => {
      expect(COHORT_NAME_PATTERN.test('TestCohort123')).toBe(true);
    });

    it('allows spaces', () => {
      expect(COHORT_NAME_PATTERN.test('Test Cohort')).toBe(true);
    });

    it('allows hyphens and underscores', () => {
      expect(COHORT_NAME_PATTERN.test('Test-Cohort_2024')).toBe(true);
    });

    it('allows parentheses', () => {
      expect(COHORT_NAME_PATTERN.test('Test Cohort (Group A)')).toBe(true);
    });

    it('allows periods and commas', () => {
      expect(COHORT_NAME_PATTERN.test('Phase 1.2, Study A')).toBe(true);
    });

    it("allows apostrophes for names like O'Brien", () => {
      expect(COHORT_NAME_PATTERN.test("O'Brien Study")).toBe(true);
    });

    it('allows colons for study naming conventions', () => {
      expect(COHORT_NAME_PATTERN.test('Study: Phase 1')).toBe(true);
    });

    it('allows forward slashes for conditions like HIV/AIDS', () => {
      expect(COHORT_NAME_PATTERN.test('HIV/AIDS Research')).toBe(true);
    });

    it('allows ampersands for combined studies', () => {
      expect(COHORT_NAME_PATTERN.test('Heart & Lung Study')).toBe(true);
    });

    it('allows plus signs for variants like COVID-19 B+', () => {
      expect(COHORT_NAME_PATTERN.test('COVID-19 B+ Variant')).toBe(true);
    });

    it('rejects special characters like @#$%^*', () => {
      expect(COHORT_NAME_PATTERN.test('Test@Cohort')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test#Cohort')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test$Cohort')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test%Cohort')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test^Cohort')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test*Cohort')).toBe(false);
    });

    it('rejects angle brackets and curly braces (security)', () => {
      expect(COHORT_NAME_PATTERN.test('Test<script>')).toBe(false);
      expect(COHORT_NAME_PATTERN.test('Test{injection}')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(COHORT_NAME_PATTERN.test('')).toBe(false);
    });
  });

  describe('Constants', () => {
    it('has correct minimum length', () => {
      expect(COHORT_NAME_MIN_LENGTH).toBe(3);
    });

    it('has correct maximum length', () => {
      expect(COHORT_NAME_MAX_LENGTH).toBe(50);
    });
  });

  describe('validateCohortName', () => {
    const existingCohorts: Cohort[] = [
      createMockCohort({ id: 'cohort-1', name: 'Existing Cohort' }),
      createMockCohort({ id: 'cohort-2', name: 'Another Cohort' }),
    ];

    describe('required validation', () => {
      it('returns error for empty string', () => {
        expect(validateCohortName('', existingCohorts)).toBe('Cohort name is required');
      });

      it('returns error for whitespace only', () => {
        expect(validateCohortName('   ', existingCohorts)).toBe('Cohort name is required');
      });

      it('returns error for tabs and newlines', () => {
        expect(validateCohortName('\t\n', existingCohorts)).toBe('Cohort name is required');
      });
    });

    describe('minimum length validation', () => {
      it('returns error for 1 character', () => {
        expect(validateCohortName('A', existingCohorts)).toBe(
          `Cohort name must be at least ${COHORT_NAME_MIN_LENGTH} characters`
        );
      });

      it('returns error for 2 characters', () => {
        expect(validateCohortName('AB', existingCohorts)).toBe(
          `Cohort name must be at least ${COHORT_NAME_MIN_LENGTH} characters`
        );
      });

      it('accepts 3 characters (minimum)', () => {
        expect(validateCohortName('ABC', existingCohorts)).toBe(null);
      });

      it('trims whitespace before checking length', () => {
        expect(validateCohortName('  A  ', existingCohorts)).toBe(
          `Cohort name must be at least ${COHORT_NAME_MIN_LENGTH} characters`
        );
      });
    });

    describe('maximum length validation', () => {
      it('accepts name at max length', () => {
        const maxName = 'A'.repeat(COHORT_NAME_MAX_LENGTH);
        expect(validateCohortName(maxName, existingCohorts)).toBe(null);
      });

      it('returns error for name exceeding max length', () => {
        const longName = 'A'.repeat(COHORT_NAME_MAX_LENGTH + 1);
        expect(validateCohortName(longName, existingCohorts)).toBe(
          `Cohort name must be ${COHORT_NAME_MAX_LENGTH} characters or less`
        );
      });
    });

    describe('pattern validation', () => {
      it('returns error for invalid characters', () => {
        const result = validateCohortName('Test@Cohort', existingCohorts);
        expect(result).toContain('invalid characters');
      });

      it('accepts valid healthcare names', () => {
        expect(validateCohortName("O'Brien Study: HIV/AIDS & Heart", existingCohorts)).toBe(null);
        expect(validateCohortName('COVID-19 B+ Variant (Phase 1.2)', existingCohorts)).toBe(null);
      });
    });

    describe('duplicate validation', () => {
      it('returns error for duplicate name (case-insensitive)', () => {
        expect(validateCohortName('existing cohort', existingCohorts)).toBe(
          'A cohort with this name already exists'
        );
      });

      it('returns error for exact duplicate', () => {
        expect(validateCohortName('Existing Cohort', existingCohorts)).toBe(
          'A cohort with this name already exists'
        );
      });

      it('returns error for duplicate with different case', () => {
        expect(validateCohortName('EXISTING COHORT', existingCohorts)).toBe(
          'A cohort with this name already exists'
        );
      });

      it('accepts unique name', () => {
        expect(validateCohortName('Brand New Cohort', existingCohorts)).toBe(null);
      });
    });

    describe('excludeId parameter (for rename operations)', () => {
      it('allows same name when excludeId matches cohort being renamed', () => {
        // Simulates renaming 'Existing Cohort' to slightly different name
        expect(validateCohortName('Existing Cohort', existingCohorts, 'cohort-1')).toBe(null);
      });

      it('still rejects duplicate of different cohort when excludeId provided', () => {
        // Trying to rename cohort-1 to the name of cohort-2
        expect(validateCohortName('Another Cohort', existingCohorts, 'cohort-1')).toBe(
          'A cohort with this name already exists'
        );
      });

      it('works with case-insensitive matching', () => {
        expect(validateCohortName('EXISTING COHORT', existingCohorts, 'cohort-1')).toBe(null);
      });
    });

    describe('edge cases', () => {
      it('handles empty cohorts array', () => {
        expect(validateCohortName('New Cohort', [])).toBe(null);
      });

      it('handles names with leading/trailing spaces (trimmed)', () => {
        expect(validateCohortName('  Valid Cohort  ', existingCohorts)).toBe(null);
      });

      it('handles names with multiple internal spaces', () => {
        expect(validateCohortName('Study  Group  Alpha', existingCohorts)).toBe(null);
      });
    });

    describe('real-world healthcare scenarios', () => {
      it('accepts pediatric study names', () => {
        expect(validateCohortName('Pediatric Patients 2024 (Ages 0-17)', existingCohorts)).toBe(
          null
        );
      });

      it('accepts clinical trial names', () => {
        expect(validateCohortName('Phase 2b: ABC-123 vs Placebo', existingCohorts)).toBe(null);
      });

      it('accepts condition-based names', () => {
        expect(validateCohortName('Type 1/Type 2 Diabetes Comparison', existingCohorts)).toBe(null);
      });

      it('accepts provider-based names', () => {
        expect(validateCohortName("Dr. Smith's Cardiology Patients", existingCohorts)).toBe(null);
      });

      it('accepts combined specialty names', () => {
        expect(validateCohortName('Heart & Lung Transplant Recipients', existingCohorts)).toBe(
          null
        );
      });
    });
  });
});
