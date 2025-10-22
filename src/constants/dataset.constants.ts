import type { DatabaseStructure, AccessRequirements } from '@/interfaces/dataset';
import { FileType } from '@/interfaces/dataset';

export const DATABASE_STRUCTURE: DatabaseStructure = {
  overview:
    'The Observer Repository contains multimodal clinical encounter data following an OMOP-inspired structure with 13 interconnected tables and four complementary data modalities.',
  categories: [
    {
      name: 'Video & Multimedia Data',
      description: 'Multi-perspective recordings with privacy protection',
      icon: 'video',
      details: [
        'Patient, provider, and room perspectives',
        'De-identified AV data with keypoints and face blurring',
        'Transcriptions',
        '1080p MP4/MOV',
      ],
      tables: [
        { name: 'OBSERVATION', description: 'File references with metadata', icon: 'video' },
      ],
    },
    {
      name: 'Clinical & EHR Data',
      description: 'Structured medical information and system logs',
      icon: 'database',
      details: [
        'Demographics and diagnoses',
        'Medications and procedures',
        'System interaction logs and audit trails',
      ],
      tables: [
        { name: 'PERSON', description: 'Patient demographics', icon: 'users' },
        { name: 'PROVIDER', description: 'Provider demographics', icon: 'users' },
        {
          name: 'VISIT_OCCURRENCE',
          description: 'Clinical encounters with timing and context',
          icon: 'hospital',
        },
        {
          name: 'CONDITION_OCCURRENCE',
          description: 'Diagnoses and medical conditions',
          icon: 'file',
        },
        { name: 'PROCEDURE_OCCURRENCE', description: 'Medical procedures performed', icon: 'file' },
        { name: 'DRUG_EXPOSURE', description: 'Medications prescribed', icon: 'file' },
        { name: 'MEASUREMENT', description: 'Vital signs and lab results', icon: 'file' },
        { name: 'AUDIT_LOGS', description: 'System interaction tracking', icon: 'database' },
        { name: 'NOTE', description: 'Clinical documentation', icon: 'file' },
        { name: 'CONCEPTS', description: 'Standardized Vocabularies', icon: 'file' },
      ],
    },
    {
      name: 'Survey & Assessment Data',
      description: 'Patient and provider evaluations',
      icon: 'table',
      details: [
        'Satisfaction measurements',
        'Technology experience ratings',
        'Workflow evaluations',
      ],
      tables: [
        { name: 'PATIENT_SURVEY', description: 'Patient satisfaction surveys', icon: 'table' },
        { name: 'PROVIDER_SURVEY', description: 'Provider workflow surveys', icon: 'table' },
      ],
    },
  ],
};

// Access Requirements Constants
export const ACCESS_REQUIREMENTS: AccessRequirements = {
  updateNote:
    'This section is being updated with detailed access procedures. Please check back soon.',
  sections: [
    {
      title: 'Ethics Compliance',
      color: 'green.700',
      items: [
        'IRB approved study',
        'Informed consent obtained',
        'HIPAA-compliant de-identification',
        'Privacy-preserving methods',
      ],
    },
    {
      title: 'Technical Requirements',
      color: 'blue.700',
      items: [
        'Secure data environment',
        'Access controls in place',
        'Computational resources for large files',
        'Support for multiple formats',
      ],
    },
    {
      title: 'Usage Guidelines',
      color: 'purple.700',
      items: [
        'Academic research only',
        'Required citation in publications',
        'No re-identification attempts',
        'Data use agreement required',
      ],
    },
  ],
};

// Re-export FileType enum from interfaces
export { FileType };

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  [FileType.PATIENT_VIEW]: 'Patient View',
  [FileType.PROVIDER_VIEW]: 'Provider View',
  [FileType.ROOM_VIEW]: 'Room View',
  [FileType.TRANSCRIPT]: 'Transcript',
};

// Badge Color Mapping
export const BADGE_COLORS: Record<string, string> = {
  'De-ID': 'green',
  Restricted: 'red',
  'Open Data': 'gray',
};
