import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { MediaViewersSection } from '@/components/dataset';
import { HealthcareDataBrowser } from '@/components/healthcare-browser';
import TranscriptViewer from '@/components/multimodal/TranscriptViewer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';
import axios from 'axios';

// Server-side data fetching function
const fetchSampleData = async () => {
  try {
    const response = await axios.get(`${process.env.INTERNAL_BACKEND_API}/public/sample-data/`, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    logger.error('Error fetching sample data:', error);
    return null;
  }
};

const DatasetExplorePage = async () => {
  // Fetch data on the server
  const sampleData = await fetchSampleData();

  // Process video sources based on the public directory structure
  const processMediaSources = () => {
    const videoSources = { patient: '', provider: '', room: '' };
    let transcriptSource = '';

    if (sampleData?.observations) {
      // Process observations to extract video paths
      sampleData.observations.forEach((obs: any) => {
        // Extract encounter info - this should come from the observation data
        // For now, using the example encounter
        const encounterType = 'clinic';
        const encounterId = '103';

        switch (obs.file_type) {
          case 'patient_view':
            videoSources.patient = `/encounters/${encounterType}/${encounterId}/patient_view.MP4`;
            break;
          case 'provider_view':
            videoSources.provider = `/encounters/${encounterType}/${encounterId}/provider_view.MP4`;
            break;
          case 'room_view':
            videoSources.room = `/encounters/${encounterType}/${encounterId}/room_view.MP4`;
            break;
          case 'transcript':
            transcriptSource = `/encounters/${encounterType}/${encounterId}/transcript.csv`;
            break;
        }
      });
    }

    // Fallback to example videos if no observations or videos found
    if (!videoSources.patient && !videoSources.provider && !videoSources.room) {
      videoSources.patient = '/encounters/clinic/103/patient_view.MP4';
      videoSources.provider = '/encounters/clinic/103/provider_view.MP4';
      videoSources.room = '/encounters/clinic/103/room_view.MP4';
      transcriptSource = '/encounters/clinic/103/transcript.csv';
    }

    return { videoSources, transcriptSource };
  };

  const { videoSources, transcriptSource } = processMediaSources();

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={12}>
        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          color="blue.700"
          mb={6}
          fontWeight="bold"
          lineHeight="shorter"
        >
          Explore the Dataset
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="4xl" mx="auto" mb={8} lineHeight="tall">
          Interactive exploration of Observer data with multimodal viewers. Browse tables or explore
          individual encounters with video and clinical data.
        </Text>
      </Box>

      <VStack gap={8} align="stretch">
        {/* Healthcare Data Browser - Main Section */}
        <ErrorBoundary>
          <HealthcareDataBrowser sampleData={sampleData} />
        </ErrorBoundary>

        {/* Media Viewers Section */}
        <ErrorBoundary>
          <MediaViewersSection videoSources={videoSources} />
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
