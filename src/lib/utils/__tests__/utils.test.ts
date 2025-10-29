// Mock d3 to avoid ES module import issues in Jest
jest.mock('d3', () => ({}));

import { expandDemographic } from '../utils';

describe('expandDemographic', () => {
  describe('gender expansion', () => {
    it('should expand M to Male', () => {
      expect(expandDemographic('M', 'gender')).toBe('Male');
    });

    it('should expand F to Female', () => {
      expect(expandDemographic('F', 'gender')).toBe('Female');
    });

    it('should expand UN to Unknown or Not Reported', () => {
      expect(expandDemographic('UN', 'gender')).toBe('Unknown or Not Reported');
    });

    it('should handle lowercase gender codes', () => {
      expect(expandDemographic('m', 'gender')).toBe('Male');
      expect(expandDemographic('f', 'gender')).toBe('Female');
    });
  });

  describe('race expansion', () => {
    it('should expand W to White', () => {
      expect(expandDemographic('W', 'race')).toBe('White');
    });

    it('should expand B to Black or African American', () => {
      expect(expandDemographic('B', 'race')).toBe('Black or African American');
    });

    it('should expand A to Asian', () => {
      expect(expandDemographic('A', 'race')).toBe('Asian');
    });

    it('should expand AI to American Indian or Alaska Native', () => {
      expect(expandDemographic('AI', 'race')).toBe('American Indian or Alaska Native');
    });

    it('should expand NHPI to Native Hawaiian or Other Pacific Islander', () => {
      expect(expandDemographic('NHPI', 'race')).toBe('Native Hawaiian or Other Pacific Islander');
    });

    it('should expand M to More than One Race', () => {
      expect(expandDemographic('M', 'race')).toBe('More than One Race');
    });

    it('should expand UN to Unknown', () => {
      expect(expandDemographic('UN', 'race')).toBe('Unknown');
    });

    it('should handle lowercase race codes', () => {
      expect(expandDemographic('w', 'race')).toBe('White');
      expect(expandDemographic('b', 'race')).toBe('Black or African American');
    });
  });

  describe('ethnicity expansion', () => {
    it('should expand NH to Not Hispanic or Latino', () => {
      expect(expandDemographic('NH', 'ethnicity')).toBe('Not Hispanic or Latino');
    });

    it('should expand H to Hispanic or Latino', () => {
      expect(expandDemographic('H', 'ethnicity')).toBe('Hispanic or Latino');
    });

    it('should expand UN to Unknown or Not Reported Ethnicity', () => {
      expect(expandDemographic('UN', 'ethnicity')).toBe('Unknown or Not Reported Ethnicity');
    });

    it('should handle lowercase ethnicity codes', () => {
      expect(expandDemographic('nh', 'ethnicity')).toBe('Not Hispanic or Latino');
      expect(expandDemographic('h', 'ethnicity')).toBe('Hispanic or Latino');
    });
  });

  describe('edge cases', () => {
    it('should return N/A for null', () => {
      expect(expandDemographic(null, 'gender')).toBe('N/A');
      expect(expandDemographic(null, 'race')).toBe('N/A');
      expect(expandDemographic(null, 'ethnicity')).toBe('N/A');
    });

    it('should return original code for unknown codes', () => {
      expect(expandDemographic('UNKNOWN_CODE', 'gender')).toBe('UNKNOWN_CODE');
      expect(expandDemographic('XYZ', 'race')).toBe('XYZ');
      expect(expandDemographic('TEST', 'ethnicity')).toBe('TEST');
    });
  });
});
