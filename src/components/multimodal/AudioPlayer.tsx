'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Flex, Heading, Text, IconButton, Spinner } from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import COLORS, { DATA_PATH_COLORS } from '@/constants/colors';
import { logger } from '@/lib/logger';
import styles from './AudioPlayer.module.css';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title = 'Audio Recording', className }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);
    const onError = () => setHasError(true);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      const container = audio.closest('[data-media-container]') ?? document;
      container.querySelectorAll('video, audio').forEach((el) => {
        if (el !== audio && !(el as HTMLMediaElement).paused) {
          (el as HTMLMediaElement).pause();
        }
      });
      audio.play().catch((err: DOMException) => {
        setIsPlaying(false);
        if (err.name !== 'AbortError') {
          logger.error('Audio playback failed:', err);
        }
      });
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }
      const vol = parseFloat(e.target.value);
      audio.volume = vol;
      setVolume(vol);
      if (vol > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const cyclePlaybackRate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const nextRate = PLAYBACK_RATES[nextIndex];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }, [playbackRate]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  if (hasError) {
    return (
      <Box className={className}>
        <Box mb={3}>
          <Heading size="md" color={COLORS.primary[800]}>
            {title}
          </Heading>
        </Box>
        <Box
          bg="red.50"
          borderRadius="lg"
          border="1px solid"
          borderColor="red.200"
          p={4}
          textAlign="center"
        >
          <Text color="red.600" fontSize="sm">
            Unable to load audio file
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Audio metadata is small enough to preload for duration display */}
      <audio ref={audioRef} src={src} preload="metadata" />

      <Box mb={3}>
        <Heading size="md" color={COLORS.primary[800]}>
          {title}
        </Heading>
      </Box>

      <Box bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" p={4}>
        <Flex align="center" gap={3} wrap={{ base: 'wrap', md: 'nowrap' }}>
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            size="sm"
            borderRadius="full"
            bg={DATA_PATH_COLORS.audio}
            color="white"
            _hover={{ bg: '#E0A800' }}
            _active={{ bg: '#C99700' }}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : isPlaying ? <FaPause /> : <FaPlay />}
          </IconButton>

          <Text fontSize="sm" color="gray.600" fontFamily="mono" whiteSpace="nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>

          <Box flex="1" minW={{ base: '100%', md: '120px' }}>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className={styles.seek}
              aria-label="Seek audio"
              style={{
                background: `linear-gradient(to right, ${DATA_PATH_COLORS.audio} ${progressPercent}%, #E2E8F0 ${progressPercent}%)`,
              }}
            />
          </Box>

          <Text
            as="button"
            fontSize="xs"
            fontWeight="semibold"
            color="gray.700"
            bg="gray.200"
            px={2}
            py={1}
            borderRadius="md"
            cursor="pointer"
            whiteSpace="nowrap"
            _hover={{ bg: 'gray.300' }}
            onClick={cyclePlaybackRate}
            aria-label={`Playback speed ${playbackRate}x`}
          >
            {playbackRate}x
          </Text>

          <Flex align="center" gap={2}>
            <IconButton
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              size="xs"
              variant="ghost"
              color="gray.600"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </IconButton>
            <Box w={{ base: '50px', md: '70px' }}>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={styles.volume}
                aria-label="Volume"
                style={{
                  background: `linear-gradient(to right, #2563eb ${volumePercent}%, #E2E8F0 ${volumePercent}%)`,
                }}
              />
            </Box>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default AudioPlayer;
