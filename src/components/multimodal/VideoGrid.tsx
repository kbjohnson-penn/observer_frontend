'use client';

import React from 'react';
import { Grid, Box, Text, Center } from '@chakra-ui/react';
import VideoPlayer from './VideoPlayer';

interface VideoGridProps {
  patientVideoSrc?: string;
  providerVideoSrc?: string;
  roomVideoSrc?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  patientVideoSrc,
  providerVideoSrc,
  roomVideoSrc,
}) => {
  // Check which videos are available
  const hasPatientVideo = !!patientVideoSrc;
  const hasProviderVideo = !!providerVideoSrc;
  const hasRoomVideo = !!roomVideoSrc;

  // Count available videos for grid layout
  const topRowVideos = [hasPatientVideo, hasProviderVideo].filter(Boolean).length;

  if (!hasPatientVideo && !hasProviderVideo && !hasRoomVideo) {
    return (
      <Center p={8} bg="gray.50" borderRadius="lg">
        <Text color="gray.600">No video files available for this encounter</Text>
      </Center>
    );
  }

  return (
    <Box>
      {topRowVideos > 0 && (
        <Grid templateColumns={{ base: '1fr', lg: `repeat(${topRowVideos}, 1fr)` }} gap={6} mb={6}>
          {hasPatientVideo && <VideoPlayer src={patientVideoSrc} title="Patient Perspective" />}
          {hasProviderVideo && <VideoPlayer src={providerVideoSrc} title="Provider Perspective" />}
        </Grid>
      )}

      {hasRoomVideo && <VideoPlayer src={roomVideoSrc} title="Room Overview" />}
    </Box>
  );
};

export default VideoGrid;
