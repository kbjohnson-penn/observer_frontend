// Centralized color scheme for the application
export const COLORS = {
  // Primary color - Blue
  primary: {
    50: 'blue.50',
    100: 'blue.100',
    200: 'blue.200',
    300: 'blue.300',
    400: 'blue.400',
    500: 'blue.500',
    600: 'blue.600',
    700: 'blue.700',
    800: 'blue.800',
    900: 'blue.900',
  },

  // Semantic colors for specific use cases
  semantic: {
    doctor: 'blue',
    patient: 'green',
    nurse: 'purple',
    unknown: 'gray',
    success: 'green',
    warning: 'orange',
    error: 'red',
    info: 'blue',
  },

  // Tier badge colors
  tier: {
    1: 'green', // Tier 1 - Complete deidentification
    2: 'yellow', // Tier 2 - Blur + voice protection
    3: 'red', // Tier 3 - Face + voice protection
    4: 'orange', // Tier 4 - DUA + External access only
  },

  // Patient demographics badge colors (cool colors)
  patientBadges: {
    age: 'blue',
    gender: 'blue',
    race: 'teal',
    ethnicity: 'cyan',
  },

  // Provider demographics badge colors (warm colors)
  providerBadges: {
    age: 'purple',
    gender: 'purple',
    race: 'pink',
    ethnicity: 'orange',
  },

  // Visit source badge color
  visitSource: 'gray',

  // Cohort action icon colors
  cohortActions: {
    delete: 'red.500',
    view: 'blue.500',
    rename: 'yellow.600',
    duplicate: 'purple.500',
    export: 'green.500',
  },

  // Research tab specific colors
  researchTab: {
    // Action icons
    saveIcon: 'blue.500',
    clearIcon: 'blue.500',

    // Navigation icons
    chevronIcon: 'gray.500',
    sortActiveIcon: 'blue.600',
    sortInactiveIcon: 'gray.400',

    // Pagination colors
    pagination: {
      activeBackground: 'blue.500',
      activeText: 'white',
      inactiveBackground: 'white',
      inactiveText: 'gray.700',
      hoverActiveBackground: 'blue.600',
      hoverInactiveBackground: 'gray.50',
      buttonBorder: 'gray.300',
    },
  },

  // UI element colors
  ui: {
    activeBg: 'blue.50',
    activeBorder: 'blue.500',
    activeText: 'blue.700',
    activeIcon: 'blue.600',

    inactiveBg: 'white',
    inactiveBorder: 'transparent',
    inactiveText: 'gray.700',
    inactiveIcon: 'gray.600',

    hoverBg: 'gray.50',
    selectedBg: 'blue.100',

    badgeScheme: 'blue',
    buttonScheme: 'blue',

    // Filter section icon colors
    filterIcon: 'blue.500',
    infoIcon: 'blue.500',
    visitDetailsIcon: 'blue.500',
    personDemographicsIcon: 'green.500',
    providerDemographicsIcon: 'purple.500',

    // Dashboard badge colors
    dashboard: {
      researchDataTabBadge: 'blue',
      cohortsTabBadge: 'green',
      activeFiltersBadge: 'blue',
    },
  },

  // Table specific
  table: {
    headerBg: 'gray.50',
    rowHoverBg: 'blue.50',
    borderColor: 'gray.200',
  },
};

export default COLORS;

// Chart colors for Recharts (non-Chakra components)
// Values extracted from theme.ts - Single source of truth
export const CHART_COLORS = {
  primary: '#8884d8',
  secondary: '#82ca9d',
  axis: '#666',
  label: '#555',
} as const;

// Multi-modal data path colors from theme.ts
export const DATA_PATH_COLORS = {
  providerView: '#4285F4',
  patientView: '#34A853',
  roomView: '#34A853',
  audio: '#FBBC05',
  transcript: '#EA4335',
  survey: '#8F44AD',
  patientSurvey: '#00838F',
  providerSurvey: '#3E2723',
  annotations: '#16A085',
  patientAnnotation: '#FFD600',
  providerAnnotation: '#FF6D00',
} as const;

// Sentiment colors from theme.ts
export const SENTIMENT_COLORS = {
  positive: '#82ca9d',
  neutral: '#8884d8',
  negative: '#CF1259',
} as const;

// Chart styling (not in theme - UI specific)
export const CHART_STYLES = {
  tooltip: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    padding: '10px',
  },
  cartesianGrid: {
    strokeDasharray: '3 3',
  },
} as const;
