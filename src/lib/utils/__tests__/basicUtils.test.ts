// Mock d3 to avoid ES module import issues in Jest
jest.mock('d3', () => ({}));

import { capitalizeWords, checkBoolean, formatDepartmentName, formatDateForInput } from '../utils';

describe('Basic Utility Functions', () => {
  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });

    it('should handle already capitalized words', () => {
      expect(capitalizeWords('Hello World')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(capitalizeWords('hELLo wORLd')).toBe('HELLo WORLd');
    });

    it('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('should handle multiple spaces', () => {
      expect(capitalizeWords('hello  world')).toBe('Hello  World');
    });

    it('should capitalize words after special characters', () => {
      expect(capitalizeWords('hello-world')).toBe('Hello-World');
      expect(capitalizeWords('hello_world')).toBe('Hello_World');
    });
  });

  describe('checkBoolean', () => {
    it('should return "Yes" for true', () => {
      expect(checkBoolean(true)).toBe('Yes');
    });

    it('should return "No" for false', () => {
      expect(checkBoolean(false)).toBe('No');
    });
  });

  describe('formatDepartmentName', () => {
    it('should replace hyphens with spaces and capitalize', () => {
      expect(formatDepartmentName('emergency-department')).toBe('Emergency Department');
    });

    it('should handle single word department', () => {
      expect(formatDepartmentName('cardiology')).toBe('Cardiology');
    });

    it('should handle multiple hyphens', () => {
      expect(formatDepartmentName('intensive-care-unit')).toBe('Intensive Care Unit');
    });

    it('should handle department names without hyphens', () => {
      expect(formatDepartmentName('radiology')).toBe('Radiology');
    });

    it('should handle already formatted names', () => {
      expect(formatDepartmentName('Emergency Department')).toBe('Emergency Department');
    });

    it('should handle mixed case with hyphens', () => {
      expect(formatDepartmentName('Emergency-DEPARTMENT')).toBe('Emergency DEPARTMENT');
    });
  });

  describe('formatDateForInput', () => {
    it('should format date to YYYY-MM-DD', () => {
      const result = formatDateForInput('2024-06-15T12:00:00');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should pad single digit months and days', () => {
      const result = formatDateForInput('2024-05-05T12:00:00');
      // Check format is correct (padded)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_year, month, day] = result.split('-');
      expect(month.length).toBe(2);
      expect(day.length).toBe(2);
    });

    it('should return valid date string', () => {
      const result = formatDateForInput('2024-12-25T10:30:00');
      const date = new Date(result);
      expect(date).toBeInstanceOf(Date);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('should handle different date formats', () => {
      const result1 = formatDateForInput('2024-03-15');
      const result2 = formatDateForInput('2024-03-15T14:30:00');

      // Both should return valid YYYY-MM-DD format
      expect(result1).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result2).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
