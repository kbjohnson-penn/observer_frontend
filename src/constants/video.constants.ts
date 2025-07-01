// Video handling configuration optimized for GB-sized files
export const VIDEO_CONFIG = {
  // File size limits in MB (adjusted for GB-sized files)
  MAX_FILE_SIZE_WARNING: 1024, // Show warning above 1GB
  MAX_FILE_SIZE_BLOCK: 8192,   // Block loading above 8GB (practical browser limit)
  
  // Performance settings for large files
  PRELOAD_STRATEGY: 'none' as const, // Don't preload anything for large files
  BUFFER_AHEAD_TIME: 60, // seconds - more buffer for large files
  
  // User experience
  SHOW_PROGRESS_THRESHOLD: 500, // MB - show progress bar for files larger than 500MB
  AUTO_PAUSE_OTHER_VIDEOS: true,
  ENABLE_QUALITY_SELECTOR: true, // Future feature for quality selection
  
  // Quality recommendations based on file size (adjusted for GB files)
  QUALITY_RECOMMENDATIONS: {
    LOW: { maxSize: 500, description: 'Compressed, good for previewing' },
    MEDIUM: { maxSize: 1500, description: 'Standard quality, 1-1.5GB' },
    HIGH: { maxSize: 3000, description: 'High quality, 1.5-3GB' },
    ULTRA: { maxSize: Infinity, description: 'Research quality, 3GB+' }
  },
  
  // Connection speed estimates for download time calculation
  CONNECTION_SPEEDS: {
    SLOW: 5,    // 5 Mbps - slow broadband
    MEDIUM: 25, // 25 Mbps - average broadband
    FAST: 100   // 100 Mbps - fast broadband/fiber
  }
} as const;

// Utility to get quality recommendation
export const getQualityRecommendation = (fileSizeMB: number) => {
  const { QUALITY_RECOMMENDATIONS } = VIDEO_CONFIG;
  
  if (fileSizeMB <= QUALITY_RECOMMENDATIONS.LOW.maxSize) return 'LOW';
  if (fileSizeMB <= QUALITY_RECOMMENDATIONS.MEDIUM.maxSize) return 'MEDIUM';
  if (fileSizeMB <= QUALITY_RECOMMENDATIONS.HIGH.maxSize) return 'HIGH';
  return 'ULTRA';
};

// Estimate download time based on file size with multiple connection speeds
export const estimateDownloadTime = (fileSizeMB: number, connectionSpeed: number = VIDEO_CONFIG.CONNECTION_SPEEDS.MEDIUM): string => {
  // connectionSpeed in Mbps
  const timeInSeconds = (fileSizeMB * 8) / connectionSpeed;
  
  if (timeInSeconds < 60) {
    return `~${Math.ceil(timeInSeconds)}s`;
  } else if (timeInSeconds < 3600) {
    return `~${Math.ceil(timeInSeconds / 60)}m`;
  } else {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.ceil((timeInSeconds % 3600) / 60);
    return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`;
  }
};

// Get download time estimates for all connection speeds
export const getDownloadTimeEstimates = (fileSizeMB: number) => {
  const { CONNECTION_SPEEDS } = VIDEO_CONFIG;
  
  return {
    slow: estimateDownloadTime(fileSizeMB, CONNECTION_SPEEDS.SLOW),
    medium: estimateDownloadTime(fileSizeMB, CONNECTION_SPEEDS.MEDIUM),
    fast: estimateDownloadTime(fileSizeMB, CONNECTION_SPEEDS.FAST)
  };
};