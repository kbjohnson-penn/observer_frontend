import {
  FaGraduationCap,
  FaCogs,
  FaRobot,
  FaHeartbeat,
  FaSearch,
  FaVideo,
  FaMicrophone,
  FaDatabase,
  FaFileAlt,
} from 'react-icons/fa';
import type {
  ResearchApplication,
  DataType,
  Statistic,
  PageContent,
  ButtonStyles
} from '@/interfaces/homepage';

// Research Applications
export const RESEARCH_APPLICATIONS: ResearchApplication[] = [
  {
    icon: FaGraduationCap,
    label: "Medical Education",
    description: "Real clinical examples for personalized curriculum development and training"
  },
  {
    icon: FaCogs,
    label: "Workflow Analysis",
    description: "Understanding provider-patient interactions and care delivery processes"
  },
  {
    icon: FaRobot,
    label: "AI/ML Development",
    description: "Multimodal data for healthcare artificial intelligence applications"
  },
  {
    icon: FaHeartbeat,
    label: "Quality Improvement",
    description: "Enhancing care delivery and reducing provider burnout"
  },
  {
    icon: FaSearch,
    label: "Ethnographic Research",
    description: "Sociotechnical analysis of healthcare delivery systems"
  },
];

// Data Types
export const DATA_TYPES: DataType[] = [
  {
    icon: FaVideo,
    label: "Video Recordings",
    description: "Room and egocentric views with high-resolution capture"
  },
  {
    icon: FaMicrophone,
    label: "Audio Transcripts",
    description: "Structured conversation data with temporal alignment"
  },
  {
    icon: FaDatabase,
    label: "EHR Data & Audit Logs",
    description: "Electronic health records and system interaction logs"
  },
  {
    icon: FaFileAlt,
    label: "Metadata & Surveys",
    description: "Visit metadata, patient/provider satisfaction, room configuration"
  },
];

// Statistics
export const STATISTICS: Statistic[] = [
  {
    value: "100+",
    label: "Recorded Visits",
    description: "University of Pennsylvania Health System",
    color: "blue.600"
  },
  {
    value: "8 Clinics",
    label: "Different Specialties",
    description: "Internal Medicine, Neurology, Family Medicine, and more",
    color: "green.600"
  },
  {
    value: "Multi-angle",
    label: "Video Capture",
    description: "Room and egocentric perspectives",
    color: "orange.600"
  },
  {
    value: "FAIR",
    label: "Data Principles",
    description: "Findable, Accessible, Interoperable, Reusable",
    color: "purple.600"
  },
];

// Button styles
export const BUTTON_STYLES: ButtonStyles = {
  size: "lg",
  colorScheme: "blue",
  bg: "blue.500",
  _hover: { bg: "blue.600" },
  padding: 2,
  color: "white",
  minW: "200px",
};

// Page Content
export const PAGE_CONTENT: PageContent = {
  title: "The Observer Repository",
  subtitle: "Transforming Healthcare Through Video-Based Clinical Research.",
  description: `A first-of-its-kind open research platform that captures real outpatient visits through 
    high-resolution video, structured metadata, and collaborative annotations. Observer enables 
    detailed analysis of clinical routines, team interactions, and workflow dynamics to support 
    transformative healthcare innovation.`,
  ctaButtons: [
    { href: "/dashboard-public", text: "Explore Repository" },
    { href: "/dataset", text: "Access Data" }
  ]
};