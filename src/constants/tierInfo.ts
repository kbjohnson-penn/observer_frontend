/**
 * Tier information and feature checklists
 * Used for info icon tooltips in FilterSidebar
 */
export const TIER_INFO = {
  1: {
    label: 'Tier 1 (Level 1)',
    features: [
      { name: 'Complete deidentification', enabled: true },
      { name: 'Blur sexually explicit body parts', enabled: false },
      { name: 'Blur face', enabled: false },
      { name: 'Obscure voice', enabled: false },
      { name: 'DUA', enabled: false },
      { name: 'External access', enabled: true },
    ],
  },
  2: {
    label: 'Tier 2 (Level 2)',
    features: [
      { name: 'Complete deidentification', enabled: false },
      { name: 'Blur sexually explicit body parts', enabled: true },
      { name: 'Blur face', enabled: true },
      { name: 'Obscure voice', enabled: true },
      { name: 'DUA', enabled: true },
      { name: 'External access', enabled: true },
    ],
  },
  3: {
    label: 'Tier 3 (Level 3)',
    features: [
      { name: 'Complete deidentification', enabled: false },
      { name: 'Blur sexually explicit body parts', enabled: false },
      { name: 'Blur face', enabled: true },
      { name: 'Obscure voice', enabled: true },
      { name: 'DUA', enabled: true },
      { name: 'External access', enabled: true },
    ],
  },
  4: {
    label: 'Tier 4 (Level 4)',
    features: [
      { name: 'Complete deidentification', enabled: false },
      { name: 'Blur sexually explicit body parts', enabled: false },
      { name: 'Blur face', enabled: false },
      { name: 'Obscure voice', enabled: false },
      { name: 'DUA', enabled: true },
      { name: 'External access', enabled: true },
    ],
  },
} as const;

/**
 * Helper function to format tier tooltip content for a specific tier
 * @param tierNumber - The tier number (1-4)
 * @returns Formatted string with tier label and feature checklist
 */
export const formatTierTooltip = (tierNumber: number): string => {
  const tier = TIER_INFO[tierNumber as keyof typeof TIER_INFO];
  if (!tier) {
    return '';
  }

  const features = tier.features.map((f) => `${f.enabled ? '✓' : '✗'} ${f.name}`).join('\n');

  return `${tier.label}:\n${features}`;
};

/**
 * Get all tiers formatted for tooltip display
 * @returns Formatted string with all tier information
 */
export const getAllTiersTooltip = (): string => {
  return Object.keys(TIER_INFO)
    .map((key) => formatTierTooltip(Number(key)))
    .join('\n\n');
};
