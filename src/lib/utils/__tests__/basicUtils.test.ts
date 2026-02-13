// Mock d3 to avoid ES module import issues in Jest
jest.mock('d3', () => ({}));

import { formatDateForInput } from '../utils';

describe('Basic Utility Functions', () => {
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
