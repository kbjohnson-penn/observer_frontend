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
  },
  
  // Table specific
  table: {
    headerBg: 'gray.50',
    rowHoverBg: 'blue.50',
    borderColor: 'gray.200',
  }
};

export default COLORS;