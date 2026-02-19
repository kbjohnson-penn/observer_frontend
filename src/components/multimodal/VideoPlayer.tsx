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
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        responsive: true,
        fluid: true,
        aspectRatio: '16:9',
        preload: 'none', // Video files are large; defer loading until user interacts
        poster: poster,
        sources: [{ src: src, type: 'video/mp4' }],
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
      });

      playerRef.current.on('play', () => {
        const container = videoRef.current?.closest('[data-media-container]') ?? document;
        container.querySelectorAll('video').forEach((video: HTMLVideoElement) => {
          if (video !== videoRef.current && !video.paused) {
            video.pause();
          }
        });
        container.querySelectorAll('audio').forEach((audio: HTMLAudioElement) => {
          if (!audio.paused) {
            audio.pause();
          }
        });
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

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
