// Homepage Component Interfaces

export interface ResearchApplication {
  icon: React.ComponentType;
  label: string;
  description: string;
}

export interface DataType {
  icon: React.ComponentType;
  label: string;
  description: string;
}

export interface Statistic {
  value: string;
  label: string;
  description: string;
  color: string;
}

export interface PageContent {
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: Array<{
    href: string;
    text: string;
  }>;
}

export interface ButtonStyles {
  size: 'lg';
  colorScheme: 'blue';
  bg: string;
  _hover: {
    bg: string;
  };
  padding: number;
  color: string;
  minW: string;
}
