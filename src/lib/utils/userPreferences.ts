/**
 * User Preferences Utility
 * Manages localStorage for user preferences like column visibility
 */

import { logger } from '@/lib/logger';

export interface ColumnVisibility {
  [columnId: string]: boolean;
}

const STORAGE_PREFIX = 'observer_';

/**
 * Save column visibility preferences for a specific table
 */
export const saveColumnPreferences = (tableName: string, visibility: ColumnVisibility): void => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    localStorage.setItem(key, JSON.stringify(visibility));
  } catch (error) {
    // Silently fail if localStorage is unavailable (e.g., private browsing)
    logger.warn('Failed to save column preferences:', error);
  }
};

/**
 * Load column visibility preferences for a specific table
 */
export const loadColumnPreferences = (tableName: string): ColumnVisibility | null => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    logger.warn('Failed to load column preferences:', error);
    return null;
  }
};

/**
 * Clear column visibility preferences for a specific table
 */
export const clearColumnPreferences = (tableName: string): void => {
  try {
    const key = `${STORAGE_PREFIX}columns_${tableName}`;
    localStorage.removeItem(key);
  } catch (error) {
    logger.warn('Failed to clear column preferences:', error);
  }
};

/**
 * Clear all user preferences
 */
export const clearAllPreferences = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    logger.warn('Failed to clear all preferences:', error);
  }
};

/**
 * Get default column visibility (all visible)
 */
export const getDefaultColumnVisibility = (columns: string[]): ColumnVisibility => {
  return columns.reduce((acc, column) => {
    acc[column] = true;
    return acc;
  }, {} as ColumnVisibility);
};
