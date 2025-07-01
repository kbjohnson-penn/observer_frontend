'use client';

import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import {
  MediaViewersSection
} from '@/components/dataset';
import HealthcareDataBrowser from '@/components/multimodal/HealthcareDataBrowser';
import TranscriptViewer from '@/components/multimodal/TranscriptViewer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useDatasetExplorer } from '@/hooks/useDatasetExplorer';

const DatasetExplorePage = () => {
  const {
    videoSources,
    transcriptSource
  } = useDatasetExplorer();

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={12}>
        <Heading 
          as="h1" 
          fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} 
          color="blue.700" 
          mb={6}
          fontWeight="bold"
          lineHeight="shorter"
        >
          Explore the Dataset
        </Heading>
        <Text 
          fontSize="lg" 
          color="gray.600" 
          maxW="4xl" 
          mx="auto" 
          mb={8} 
          lineHeight="tall"
        >
          Interactive exploration of Observer data with multimodal viewers. 
          Browse tables or explore individual encounters with video and clinical data.
        </Text>
      </Box>

      <VStack gap={8} align="stretch">
        {/* Healthcare Data Browser - Main Section */}
        <ErrorBoundary>
          <HealthcareDataBrowser />
        </ErrorBoundary>

        {/* Media Viewers Section */}
        <ErrorBoundary>
          <MediaViewersSection
            videoSources={videoSources}
            transcriptSource={transcriptSource}
          />
        </ErrorBoundary>

        {/* Transcript Viewer Section */}
        {transcriptSource && (
          <ErrorBoundary>
            <TranscriptViewer transcriptSrc={transcriptSource} />
          </ErrorBoundary>
        )}
      </VStack>
    </Box>
  );
};

export default DatasetExplorePage;