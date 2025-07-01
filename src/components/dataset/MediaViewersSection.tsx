'use client';

import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';
import VideoGrid from '@/components/multimodal/VideoGrid';
import type { VideoSources } from '@/interfaces/observer-omop';

interface MediaViewersSectionProps {
  videoSources: VideoSources;
  transcriptSource: string;
}

const MediaViewersSection: React.FC<MediaViewersSectionProps> = ({
  videoSources,
  transcriptSource
}) => {
  const hasAnyMedia = videoSources.patient || videoSources.provider || videoSources.room || transcriptSource;

  return (
    <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      {/* Header Section */}
      <Box p={6} pb={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
        <Box>
          <Heading size="lg" color="blue.900" mb={2} fontWeight="bold">
            Multimodal Media Viewers
          </Heading>
          <Text color="gray.700" fontSize="md">
            Video recordings and transcripts automatically loaded from clinical encounters
          </Text>
        </Box>
      </Box>
      
      {/* Content Section */}
      <Box p={6} pt={4}>
        <VideoGrid
          patientVideoSrc={videoSources.patient}
          providerVideoSrc={videoSources.provider}
          roomVideoSrc={videoSources.room}
        />

        {!hasAnyMedia && (
          <Box textAlign="center" py={8} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
            <Text color="blue.600" fontSize="md" fontWeight="medium">
              No media files available
            </Text>
            <Text color="blue.500" fontSize="sm" mt={1}>
              Media files are automatically loaded from the OBSERVATION table
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaViewersSection;