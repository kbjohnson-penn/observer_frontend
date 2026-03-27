export const GENDER_LABELS: Record<string, string> = {
  M: 'Male',
  F: 'Female',
  UN: 'Unknown',
};

export const RACE_LABELS: Record<string, string> = {
  W: 'White',
  B: 'Black',
  A: 'Asian',
  AI: 'American Indian',
  O: 'Other',
  UN: 'Unknown',
};

export const ETHNICITY_LABELS: Record<string, string> = {
  H: 'Hispanic',
  NH: 'Not Hispanic',
  UN: 'Unknown',
};

export function labelDemographic(map: Record<string, string>, value: string | null): string | null {
  if (!value) {
    return null;
  }
  return map[value] ?? value;
}
