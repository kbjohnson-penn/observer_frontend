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
import { VIDEO_CONFIG, getQualityRecommendation, getDownloadTimeEstimates } from '@/constants/video.constants';

// Utility function to format file size
const formatFileSize = (sizeInMB: number): string => {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(1)}GB`;
  }
  return `${sizeInMB.toFixed(1)}MB`;
};

interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  className?: string;
  maxFileSize?: number; // in MB, default 500MB
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  className,
  maxFileSize = VIDEO_CONFIG.MAX_FILE_SIZE_WARNING
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
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [userConfirmedLoad, setUserConfirmedLoad] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Check file size before loading
  useEffect(() => {
    const checkFileSize = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        
        if (contentLength) {
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          setFileSize(sizeInMB);
          
          if (sizeInMB > maxFileSize) {
            setIsLargeFile(true);
            setIsLoading(false);
            return;
          }
          
          // Block extremely large files
          if (sizeInMB > VIDEO_CONFIG.MAX_FILE_SIZE_BLOCK) {
            setLoadError(`File too large (${formatFileSize(sizeInMB)}). Maximum supported size is ${formatFileSize(VIDEO_CONFIG.MAX_FILE_SIZE_BLOCK)}.`);
            setIsLoading(false);
            return;
          }
        }
        
        // If file size is acceptable or unknown, proceed with loading
        setUserConfirmedLoad(true);
      } catch (error) {
        // If HEAD request fails, proceed with loading (might be CORS issue)
        setUserConfirmedLoad(true);
      }
    };

    if (src && !userConfirmedLoad && !isLargeFile) {
      checkFileSize();
    }
  }, [src, maxFileSize, userConfirmedLoad, isLargeFile]);

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

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // Pause other videos to prevent multiple large files loading
      const otherVideos = document.querySelectorAll('video');
      otherVideos.forEach(otherVideo => {
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
      
      try {
        await video.play();
      } catch (error) {
        // Play failed - browser may require user interaction
        setLoadError('Unable to play video. Please try again.');
      }
    }
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
      // Fullscreen error - browser may not support or user denied
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

          {/* Large File Warning */}
          {isLargeFile && !userConfirmedLoad && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="rgba(0,0,0,0.9)"
              color="white"
              p={6}
              borderRadius="lg"
              textAlign="center"
              maxW="90%"
              zIndex={2}
            >
              <Heading size="md" mb={4} color="orange.300">
                Large Video File Detected
              </Heading>
              <Text mb={4}>
                This video file is {fileSize ? formatFileSize(fileSize) : 'large'}, which may take a while to load and could impact performance.
              </Text>
              <Box mb={4} p={3} bg="rgba(0,0,0,0.3)" borderRadius="md">
                <Text fontSize="sm" color="orange.200" mb={2}>
                  <strong>Quality:</strong> {getQualityRecommendation(fileSize || 0)}
                </Text>
                <Text fontSize="xs" color="gray.300" mb={1}>
                  <strong>Download estimates:</strong>
                </Text>
                {(() => {
                  const estimates = getDownloadTimeEstimates(fileSize || 0);
                  return (
                    <Text fontSize="xs" color="gray.400">
                      Fast: {estimates.fast} | Medium: {estimates.medium} | Slow: {estimates.slow}
                    </Text>
                  );
                })()}
              </Box>
              <Text mb={6} fontSize="sm" color="gray.300">
                Large research videos may take significant time to load. Consider streaming or using a faster connection.
              </Text>
              <Flex gap={3} justify="center">
                <IconButton
                  aria-label="Load video anyway"
                  onClick={() => setUserConfirmedLoad(true)}
                  colorScheme="orange"
                  size="lg"
                >
                  <FaPlay />
                </IconButton>
                <Text fontSize="sm" color="gray.400" alignSelf="center">
                  Load Anyway
                </Text>
              </Flex>
            </Box>
          )}

          {/* Loading Progress for Large Files */}
          {userConfirmedLoad && isLoading && downloadProgress > 0 && (
            <Box
              position="absolute"
              bottom="20px"
              left="20px"
              right="20px"
              bg="rgba(0,0,0,0.8)"
              color="white"
              p={3}
              borderRadius="md"
              zIndex={2}
            >
              <Text fontSize="sm" mb={2}>
                Loading video... {downloadProgress.toFixed(0)}%
              </Text>
              <Box bg="gray.600" borderRadius="full" h="4px">
                <Box
                  bg="blue.400"
                  h="100%"
                  borderRadius="full"
                  width={`${downloadProgress}%`}
                  transition="width 0.3s"
                />
              </Box>
            </Box>
          )}

          {/* Error State */}
          {loadError && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="rgba(0,0,0,0.9)"
              color="white"
              p={6}
              borderRadius="lg"
              textAlign="center"
              maxW="90%"
              zIndex={2}
            >
              <Heading size="md" mb={4} color="red.300">
                Video Load Error
              </Heading>
              <Text mb={4}>{loadError}</Text>
              <Text fontSize="sm" color="gray.400">
                The video file may be too large or corrupted.
              </Text>
            </Box>
          )}

          {userConfirmedLoad && (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              width="100%"
              height="100%"
              preload={VIDEO_CONFIG.PRELOAD_STRATEGY}
              style={{ display: 'block', maxHeight: '300px' }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
              onError={() => {
                setLoadError('Failed to load video');
                setIsLoading(false);
              }}
              onProgress={(e) => {
                const video = e.currentTarget;
                if (video.buffered.length > 0) {
                  const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                  const duration = video.duration;
                  if (duration > 0) {
                    setDownloadProgress((bufferedEnd / duration) * 100);
                  }
                }
              }}
            />
          )}
          
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