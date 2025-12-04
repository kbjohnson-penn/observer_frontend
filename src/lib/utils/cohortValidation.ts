/**
 * Cohort name validation utilities
 * Shared validation logic for CreateCohortDialog and RenameCohortDialog
 */

import { Cohort } from '@/interfaces/cohort';

/**
 * Pattern for valid cohort name characters
 * Allows: letters, numbers, spaces, hyphens, underscores, parentheses, periods, commas,
 * apostrophes (O'Brien), colons (Study: Phase 1), forward slashes (HIV/AIDS),
 * ampersands (Heart & Lung), plus signs (COVID-19 B+)
 */
export const COHORT_NAME_PATTERN = /^[a-zA-Z0-9\s\-_().,':\/&+]+$/;

export const COHORT_NAME_MIN_LENGTH = 3;
export const COHORT_NAME_MAX_LENGTH = 50;

/**
 * Validates a cohort name and returns an error message if invalid
 * @param name - The cohort name to validate
 * @param existingCohorts - List of existing cohorts to check for duplicates
 * @param excludeId - Optional cohort ID to exclude from duplicate check (for rename operations)
 * @returns Error message string if invalid, null if valid
 */
export function validateCohortName(
  name: string,
  existingCohorts: Cohort[],
  excludeId?: string
): string | null {
  const trimmedName = name.trim();

  // Required check
  if (!trimmedName) {
    return 'Cohort name is required';
  }

  // Minimum length check
  if (trimmedName.length < COHORT_NAME_MIN_LENGTH) {
    return `Cohort name must be at least ${COHORT_NAME_MIN_LENGTH} characters`;
  }

  // Maximum length check
  if (trimmedName.length > COHORT_NAME_MAX_LENGTH) {
    return `Cohort name must be ${COHORT_NAME_MAX_LENGTH} characters or less`;
  }

  // Character pattern validation for security
  if (!COHORT_NAME_PATTERN.test(trimmedName)) {
    return "Cohort name contains invalid characters. Use only letters, numbers, spaces, and basic punctuation (- _ . , ( ) ' : / & +)";
  }

  // Duplicate name check (case-insensitive)
  const isDuplicate = existingCohorts.some(
    (cohort) => cohort.id !== excludeId && cohort.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (isDuplicate) {
    return 'A cohort with this name already exists';
  }

  return null;
}
