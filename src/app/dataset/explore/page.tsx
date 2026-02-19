export const dynamic = 'force-dynamic';

import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { MediaViewersSection } from '@/components/dataset';
import { HealthcareDataBrowser } from '@/components/healthcare-browser';
import TranscriptViewer from '@/components/multimodal/TranscriptViewer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';
import axios from 'axios';
import type { CohortDataAPIResponse, Observation } from '@/interfaces/observer-omop';

const fetchSampleData = async (): Promise<CohortDataAPIResponse | null> => {
  try {
    const response = await axios.get<CohortDataAPIResponse>(
      `${process.env.INTERNAL_BACKEND_API}/research/public/sample-data/`,
      {
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    logger.error('Error fetching sample data:', error);
    return null;
  }
};

const DatasetExplorePage = async () => {
  const sampleData = await fetchSampleData();

  const processMediaSources = () => {
    const videoSources = { patient: '', provider: '', room: '' };
    let audioSource = '';
    let transcriptSource = '';

    if (sampleData?.observations) {
      sampleData.observations.forEach((obs: Observation) => {
        // TODO: Replace hardcoded demo paths with observation data (file_path, visit_occurrence_id)
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
          case 'audio':
            audioSource = `/encounters/${encounterType}/${encounterId}/anonymized.mp3`;
            break;
          case 'transcript':
            transcriptSource = `/encounters/${encounterType}/${encounterId}/transcript.csv`;
            break;
        }
      });
    }

    // TODO: Replace hardcoded demo fallback paths once dynamic encounter routing is implemented
    if (!videoSources.patient && !videoSources.provider && !videoSources.room) {
      videoSources.patient = '/encounters/clinic/103/patient_view.MP4';
      videoSources.provider = '/encounters/clinic/103/provider_view.MP4';
      videoSources.room = '/encounters/clinic/103/room_view.MP4';
      audioSource = '/encounters/clinic/103/anonymized.mp3';
      transcriptSource = '/encounters/clinic/103/transcript.csv';
    }

    return { videoSources, audioSource, transcriptSource };
  };

  const { videoSources, audioSource, transcriptSource } = processMediaSources();

  return (
    <Box maxW="6xl" mx="auto" py={8} px={{ base: 4, md: 6 }}>
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
        <ErrorBoundary>
          <HealthcareDataBrowser cohortData={sampleData} />
        </ErrorBoundary>

        <ErrorBoundary>
          <MediaViewersSection videoSources={videoSources} audioSource={audioSource} />
        </ErrorBoundary>

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
