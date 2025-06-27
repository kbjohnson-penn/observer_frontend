"use client";

import React from "react";
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Button,
  Grid,
  Heading,
  Icon,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FaVideo,
  FaMicrophone,
  FaFileAlt,
  FaDatabase,
  FaGraduationCap,
  FaCogs,
  FaRobot,
  FaHeartbeat,
  FaSearch,
} from "react-icons/fa";

// Types
interface ResearchApplication {
  icon: React.ComponentType;
  label: string;
  description: string;
}

interface DataType {
  icon: React.ComponentType;
  label: string;
  description: string;
}

interface Statistic {
  value: string;
  label: string;
  description: string;
  color: string;
}

// Constants
const RESEARCH_APPLICATIONS: ResearchApplication[] = [
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

const DATA_TYPES: DataType[] = [
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

const STATISTICS: Statistic[] = [
  {
    value: "100+",
    label: "Recorded Visits",
    description: "University of Pennsylvania Health System",
    color: "blue.600"
  },
  {
    value: "91%",
    label: "Automated De-identification",
    description: "HIPAA-compliant privacy protection",
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
const BUTTON_STYLES = {
  size: "lg" as const,
  colorScheme: "blue" as const,
  bg: "blue.500",
  _hover: { bg: "blue.600" },
  padding: 2,
  color: "white",
  minW: "200px",
};

// Component: Hero Section
const HeroSection: React.FC = () => (
  <Box textAlign="center" mb={12}>
    <Heading 
      as="h1" 
      fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }} 
      color="blue.700" 
      mb={6}
      fontWeight="bold"
      lineHeight="shorter"
    >
      The Observer Repository: Transforming Healthcare Through Video-Based Clinical Research
    </Heading>
    
    <Text 
      fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
      color="blue.600" 
      fontWeight="medium" 
      mb={8}
    >
      Advancing ambulatory care innovation through real-world clinical insights
    </Text>
    
    <Text 
      fontSize="lg" 
      color="gray.600" 
      maxW="5xl" 
      mx="auto" 
      lineHeight="tall" 
      mb={8}
    >
      A first-of-its-kind open research platform that captures real outpatient visits through 
      high-resolution video, structured metadata, and collaborative annotations. Observer enables 
      detailed analysis of clinical routines, team interactions, and workflow dynamics to support 
      transformative healthcare innovation.
    </Text>

    <HStack justify="center" gap={4} flexWrap="wrap">
      <Link href="/dashboard-public">
        <Button {...BUTTON_STYLES}>
          Explore Repository
        </Button>
      </Link>
      <Link href="/dataset">
        <Button {...BUTTON_STYLES}>
          Access Data
        </Button>
      </Link>
    </HStack>
  </Box>
);

// Component: Statistics Section
const StatisticsSection: React.FC = () => (
  <Box mb={16} py={12} bg="blue.50" borderRadius="xl">
    <Container maxW="container.xl">
      <Heading size="xl" textAlign="center" mb={8} color="blue.700">
        Research Impact
      </Heading>
      
      <Grid 
        templateColumns={{ base: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} 
        gap={8}
        maxW="5xl"
        mx="auto"
      >
        {STATISTICS.map((stat, index) => (
          <Box key={index} textAlign="center">
            <Text 
              fontSize={{ base: "3xl", md: "4xl" }} 
              fontWeight="bold" 
              color={stat.color} 
              mb={2}
            >
              {stat.value}
            </Text>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="gray.600" 
              textTransform="uppercase" 
              letterSpacing="wider"
            >
              {stat.label}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {stat.description}
            </Text>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Component: Research Applications Section
const ResearchApplicationsSection: React.FC = () => (
  <Box mb={16} bg="gray.50" py={12} borderRadius="lg">
    <Container maxW="container.xl">
      <Heading 
        size="2xl" 
        textAlign="center" 
        mb={6} 
        color="blue.700" 
        fontWeight="bold"
      >
        Research Applications
      </Heading>
      
      <Text 
        textAlign="center" 
        color="blue.600" 
        mb={12} 
        maxW="4xl" 
        mx="auto" 
        fontSize="xl" 
        fontWeight="medium" 
        lineHeight="tall"
      >
        Observer enables transformative research across multiple domains of healthcare innovation
      </Text>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
        gap={8} 
        maxW="6xl" 
        mx="auto"
      >
        {RESEARCH_APPLICATIONS.map((app, index) => (
          <Box 
            key={index} 
            bg="white" 
            p={6} 
            borderRadius="lg" 
            boxShadow="sm" 
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }} 
            transition="all 0.3s" 
            border="1px" 
            borderColor="gray.200"
          >
            <VStack align="center" gap={4}>
              <Icon as={app.icon} color="blue.500" boxSize={12} />
              <Heading size="md" color="gray.700" textAlign="center">
                {app.label}
              </Heading>
              <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="tall">
                {app.description}
              </Text>
            </VStack>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Component: Data Types Section
const DataTypesSection: React.FC = () => (
  <Box mb={16} bg="white" py={12} borderRadius="lg" border="1px" borderColor="gray.200">
    <Container maxW="container.xl">
      <Heading 
        size="2xl" 
        textAlign="center" 
        mb={6} 
        color="blue.700" 
        fontWeight="bold"
      >
        Data Types Available
      </Heading>
      
      <Text 
        textAlign="center" 
        color="blue.600" 
        mb={12} 
        maxW="4xl" 
        mx="auto" 
        fontSize="xl" 
        fontWeight="medium" 
        lineHeight="tall"
      >
        Comprehensive multimodal data from real clinical encounters
      </Text>
      
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} 
        gap={8} 
        maxW="5xl" 
        mx="auto"
      >
        {DATA_TYPES.map((type, index) => (
          <Box 
            key={index} 
            bg="gray.50" 
            p={6} 
            borderRadius="lg" 
            _hover={{ bg: "gray.100" }} 
            transition="all 0.3s"
          >
            <HStack gap={4} align="start">
              <Icon as={type.icon} color="blue.500" boxSize={8} mt={1} />
              <VStack align="start" gap={2}>
                <Heading size="md" color="gray.700">
                  {type.label}
                </Heading>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">
                  {type.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
      </Grid>
    </Container>
  </Box>
);

// Main Component
const Home: React.FC = () => {
  return (
    <Box py={8} className="min-h-[calc(100vh-120px)]">
      <Container maxW="container.xl">
        <HeroSection />
        <StatisticsSection />
        <ResearchApplicationsSection />
        <DataTypesSection />
      </Container>
    </Box>
  );
};

export default Home;