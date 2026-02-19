'use client';

import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';
import VideoGrid from '@/components/multimodal/VideoGrid';
import AudioPlayer from '@/components/multimodal/AudioPlayer';
import type { VideoSources } from '@/interfaces/observer-omop';

interface MediaViewersSectionProps {
  videoSources: VideoSources;
  audioSource?: string;
}

const MediaViewersSection: React.FC<MediaViewersSectionProps> = ({ videoSources, audioSource }) => {
  const hasAnyMedia =
    videoSources.patient || videoSources.provider || videoSources.room || audioSource;

  return (
    <Box bg="white" borderRadius="lg" boxShadow="md" overflow="hidden">
      <Box p={6} pb={4} borderBottom="1px" borderColor="gray.200" bg="blue.50">
        <Box>
          <Heading size="lg" color="blue.900" mb={2} fontWeight="bold">
            Multimodal Media Viewers
          </Heading>
        </Box>
      </Box>

      <Box p={6} pt={4} data-media-container>
        {(videoSources.patient || videoSources.provider || videoSources.room) && (
          <VideoGrid
            patientVideoSrc={videoSources.patient}
            providerVideoSrc={videoSources.provider}
            roomVideoSrc={videoSources.room}
          />
        )}

        {audioSource && (
          <Box mt={6}>
            <AudioPlayer src={audioSource} title="Encounter Audio Recording" />
          </Box>
        )}

        {!hasAnyMedia && (
          <Box
            textAlign="center"
            py={8}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <Text color="blue.600" fontSize="md" fontWeight="medium">
              No media files available
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MediaViewersSection;
