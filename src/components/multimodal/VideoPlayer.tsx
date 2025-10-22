'use client';

import React, { useRef, useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import COLORS from '@/constants/colors';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, poster, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Video.js player
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: '16:9',
        preload: 'none',
        poster: poster,
        sources: [{ src: src, type: 'video/mp4' }],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
      });

      // Pause other videos when this one starts playing
      playerRef.current.on('play', () => {
        const otherVideos = document.querySelectorAll('video');
        otherVideos.forEach((video: HTMLVideoElement) => {
          if (video !== videoRef.current && !video.paused) {
            video.pause();
          }
        });
      });
    }

    return () => {
      // Cleanup Video.js player
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  // Update source when src changes
  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.src([
        {
          src: src,
          type: 'video/mp4',
        },
      ]);
    }
  }, [src]);

  return (
    <Box className={className}>
      <Box mb={3}>
        <Heading size="md" color={COLORS.primary[800]}>
          {title}
        </Heading>
      </Box>
      <Box borderRadius="md" overflow="hidden">
        <video ref={videoRef} className="video-js vjs-default-skin" />
      </Box>
    </Box>
  );
};

export default VideoPlayer;
