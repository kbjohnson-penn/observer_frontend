// Dataset Component Interfaces

export interface DatabaseTable {
  name: string;
  description: string;
  icon: string;
}

export interface DatabaseCategory {
  name: string;
  description: string;
  icon: string;
  details: string[];
  tables: DatabaseTable[];
}

export interface DatabaseStructure {
  overview: string;
  categories: DatabaseCategory[];
}

export interface AccessRequirementSection {
  title: string;
  color: string;
  items: string[];
}

export interface AccessRequirements {
  updateNote: string;
  sections: AccessRequirementSection[];
}

// File Type Enum
export enum FileType {
  PATIENT_VIEW = 'patient_view',
  PROVIDER_VIEW = 'provider_view',
  ROOM_VIEW = 'room_view',
  TRANSCRIPT = 'transcript'
}

// Citation Modal Props
export interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CitationUsageProps {
  onOpenModal: () => void;
}

// Data Module Interface (extracted from data-modules.ts)
export interface DataModule {
  id: string;
  name: string;
  description: string;
  purpose: string;
  files: string[];
}

// Usage Ethics Interface (extracted from usage-ethics.ts)
export interface UsageEthics {
  citation: {
    text: string;
    bibtex: string;
    doi: string;
    url: string;
    apa: string;
    mla: string;
    chicago: string;
    harvard: string;
    vancouver: string;
  };
  dataUseAgreement: {
    title: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
  privacy: {
    deidentificationMethods: string[];
    privacyProtections: string[];
    dataRetention: string;
  };
  version: {
    current: string;
    releaseDate: string;
    changelog: {
      version: string;
      date: string;
      changes: string[];
    }[];
  };
}