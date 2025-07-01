'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Flex, 
  Text,
  Heading
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp, FaExpand, FaCompress } from 'react-icons/fa';
import { Spinner } from '@chakra-ui/react';
import COLORS from '@/constants/colors';

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    setVolume(value);
    video.volume = value;
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box className={className}>
      <Box mb={3}>
        <Heading size="md" color={COLORS.primary[800]}>{title}</Heading>
      </Box>
      <Box>
        <Box
          ref={containerRef}
          position="relative"
          bg="black"
          borderRadius="md"
          overflow="hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(true)} // Keep controls visible for now
        >
          {/* Loading spinner */}
          {isLoading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={10}
            >
              <Spinner
                size="lg"
                color={COLORS.primary[500]}
                borderWidth="3px"
              />
            </Box>
          )}
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            width="100%"
            height="100%"
            style={{ display: 'block', maxHeight: '300px' }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Controls Overlay */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
            p={3}
            opacity={showControls ? 1 : 0}
            transition="opacity 0.3s"
          >
            <Box mb={2} position="relative">
              {/* Progress Bar Background */}
              <Box
                position="absolute"
                top="50%"
                transform="translateY(-50%)"
                width="100%"
                height="4px"
                bg="whiteAlpha.300"
                borderRadius="full"
              />
              {/* Progress Bar Fill */}
              <Box
                position="absolute"
                top="50%"
                transform="translateY(-50%)"
                width={`${(currentTime / duration) * 100 || 0}%`}
                height="4px"
                bg={COLORS.primary[400]}
                borderRadius="full"
                transition="width 0.1s"
              />
              {/* Invisible range input for interaction */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  height: '12px',
                  opacity: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </Box>
            
            {/* Control Buttons */}
            <Flex justify="space-between" align="center" w="full">
              <Flex align="center">
                <IconButton
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                  variant="ghost"
                  color="white"
                  size="sm"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  mr={2}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </IconButton>
                
                <Flex align="center" mr={2}>
                  <IconButton
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                    variant="ghost"
                    color="white"
                    size="sm"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    mr={1}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </IconButton>
                  <Box w="60px" position="relative">
                    {/* Volume Bar Background */}
                    <Box
                      position="absolute"
                      top="50%"
                      transform="translateY(-50%)"
                      width="100%"
                      height="3px"
                      bg="whiteAlpha.300"
                      borderRadius="full"
                    />
                    {/* Volume Bar Fill */}
                    <Box
                      position="absolute"
                      top="50%"
                      transform="translateY(-50%)"
                      width={`${(isMuted ? 0 : volume) * 100}%`}
                      height="3px"
                      bg="white"
                      borderRadius="full"
                      transition="width 0.1s"
                    />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      style={{ 
                        width: '100%',
                        height: '10px',
                        opacity: 0,
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                  </Box>
                </Flex>
                
                <Text color="white" fontSize="sm" mx={2}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
                
                <Box
                  as="button"
                  onClick={changePlaybackRate}
                  px={2}
                  py={1}
                  borderRadius="md"
                  bg="whiteAlpha.200"
                  color="white"
                  fontSize="xs"
                  fontWeight="bold"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  cursor="pointer"
                >
                  {playbackRate}x
                </Box>
              </Flex>
              
              <IconButton
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={toggleFullscreen}
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </IconButton>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;