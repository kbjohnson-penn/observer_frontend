/**
 * User Preferences Utility
 *
 * Manages browser sessionStorage for persisting user preferences within a session.
 * Currently handles column visibility preferences for data tables.
 *
 * NOTE: Uses sessionStorage (not localStorage) for HIPAA compliance.
 * Preferences automatically clear when the browser tab/window closes.
 *
 * Features:
 * - Session-scoped storage of UI preferences
 * - Automatic cleanup on session end (improves privacy/security)
 * - Graceful fallback when sessionStorage is unavailable (private browsing)
 * - Automatic error logging
 * - Namespaced keys to avoid conflicts
 *
 * @module userPreferences
 */

import { logger } from '@/lib/logger';

/**
 * Column visibility map for a table
 * Maps column IDs to their visibility state (true = visible, false = hidden)
 *
 * @example
 * const visibility: ColumnVisibility = {
 *   'person_id': true,
 *   'birth_datetime': false,
 *   'gender': true,
 * };
 */
export interface ColumnVisibility {
  /** Column ID mapped to visibility state */
  [columnId: string]: boolean;
}

/** Prefix for all Observer sessionStorage keys to avoid conflicts */
const STORAGE_PREFIX = 'observer_';

/**
 * Type guard to validate parsed sessionStorage data is a valid ColumnVisibility object
 *
 * @param data - Unknown data parsed from sessionStorage
 * @returns True if data is a valid ColumnVisibility object
 */
function isValidColumnVisibility(data: unknown): data is ColumnVisibility {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return false;
  }
  return Object.entries(data).every(
    ([key, value]) => typeof key === 'string' && typeof value === 'boolean'
  );
}

/**
 * Save column visibility preferences for a specific table
 *
 * Persists the visibility state of columns to sessionStorage for the current
 * browser session. Preferences are automatically cleared when the tab/window closes.
 *
 * @param tableName - Name of the table (e.g., 'PERSON', 'VISIT_OCCURRENCE')
 * @param visibility - Map of column IDs to their visibility states
 *
 * @example
 * saveColumnPreferences('PERSON', {
 *   'person_id': true,
 *   'birth_datetime': false,
 * });
 */
export const saveColumnPreferences = (tableName: string, visibility: ColumnVisibility): void => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    sessionStorage.setItem(key, JSON.stringify(visibility));
  } catch (error) {
    // Silently fail if sessionStorage is unavailable (e.g., private browsing)
    logger.warn('Failed to save column preferences:', error);
  }
};

/**
 * Load column visibility preferences for a specific table
 *
 * Retrieves previously saved column visibility preferences from sessionStorage.
 * Returns null if no preferences exist for the table.
 *
 * @param tableName - Name of the table (e.g., 'PERSON', 'VISIT_OCCURRENCE')
 * @returns Column visibility map, or null if no preferences saved
 *
 * @example
 * const prefs = loadColumnPreferences('PERSON');
 * if (prefs) {
 *   applyColumnVisibility(prefs);
 * }
 */
export const loadColumnPreferences = (tableName: string): ColumnVisibility | null => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    const saved = sessionStorage.getItem(key);
    if (!saved) {
      return null;
    }

    const parsed: unknown = JSON.parse(saved);
    if (!isValidColumnVisibility(parsed)) {
      logger.warn(`Invalid column preferences data for table ${tableName}, ignoring`);
      return null;
    }
    return parsed;
  } catch (error) {
    logger.warn('Failed to load column preferences:', error);
    return null;
  }
};

/**
 * Clear column visibility preferences for a specific table
 *
 * Removes saved preferences for a table, causing it to revert to default visibility.
 *
 * @param tableName - Name of the table to clear preferences for
 *
 * @example
 * // Reset PERSON table to default column visibility
 * clearColumnPreferences('PERSON');
 */
export const clearColumnPreferences = (tableName: string): void => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    sessionStorage.removeItem(key);
  } catch (error) {
    logger.warn('Failed to clear column preferences:', error);
  }
};

/**
 * Clear all user preferences
 *
 * Removes ALL Observer-related preferences from sessionStorage.
 * Use with caution as this cannot be undone.
 *
 * @example
 * // Clear all saved preferences (e.g., on logout or reset)
 * clearAllPreferences();
 */
export const clearAllPreferences = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    logger.warn('Failed to clear all preferences:', error);
  }
};

/**
 * Get default column visibility (all columns visible)
 *
 * Creates a ColumnVisibility map with all columns set to visible.
 * Useful as the initial state when no preferences are saved.
 *
 * @param columns - Array of column IDs
 * @returns ColumnVisibility map with all columns set to true
 *
 * @example
 * const columns = ['person_id', 'birth_datetime', 'gender'];
 * const defaultVisibility = getDefaultColumnVisibility(columns);
 * // Returns: { person_id: true, birth_datetime: true, gender: true }
 */
export const getDefaultColumnVisibility = (columns: string[]): ColumnVisibility => {
  return columns.reduce((acc, column) => {
    acc[column] = true;
    return acc;
  }, {} as ColumnVisibility);
};
