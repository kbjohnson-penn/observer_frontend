/**
 * Centralized application configuration
 *
 * This file manages all environment-based configuration for the Observer platform.
 * It ensures consistent URL usage and validates critical settings.
 */

import { logger } from './logger';

/**
 * Get the backend API URL with validation
 * @returns Backend API URL
 * @throws Error if NEXT_PUBLIC_BACKEND_API is not set (fails fast)
 */
const getBackendUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_BACKEND_API;

  // In test environment, use mock URL if not set
  if (process.env.NODE_ENV === 'test' && !url) {
    return 'http://localhost:8000/api/v1'; // Mock URL for tests
  }

  // Strict validation: require explicit configuration
  if (!url) {
    // In development, provide helpful error message
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'NEXT_PUBLIC_BACKEND_API environment variable is not set.\n\n' +
          'Please create a .env.local file in the root directory with:\n' +
          'NEXT_PUBLIC_BACKEND_API=http://localhost:8000/api/v1\n\n' +
          'See .env.example for reference.'
      );
    }

    // In production, fail immediately with clear error
    throw new Error(
      'NEXT_PUBLIC_BACKEND_API must be set in production environment. ' +
        'Please configure this variable in your deployment settings.'
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_BACKEND_API URL format: "${url}". ` +
        'Must be a valid URL (e.g., http://localhost:8000/api/v1)'
    );
  }

  // Warn about 127.0.0.1 usage (breaks httpOnly cookie authentication)
  if (url.includes('127.0.0.1')) {
    logger.warn(
      'WARNING: Using 127.0.0.1 instead of localhost may break httpOnly cookie authentication. ' +
        'Use localhost for consistency with the backend CORS configuration.'
    );
  }

  // Ensure production deployment uses HTTPS (but allow localhost for development/testing)
  // Skip validation in test environment
  if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
    // Allow localhost/127.0.0.1 for local development and testing
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

    if (!isLocalhost) {
      logger.error(
        'SECURITY WARNING: Production environment is not using HTTPS. ' +
          'This is insecure and will cause authentication issues.'
      );
      throw new Error(
        'Production NEXT_PUBLIC_BACKEND_API must use HTTPS for non-localhost URLs. ' +
          `Current value: ${url}`
      );
    }

    // Warn about localhost in production mode (might be build artifact)
    if (isLocalhost && typeof window !== 'undefined') {
      logger.warn(
        'Using localhost URL in production mode. ' +
          'This is OK for development but should use HTTPS in production deployment.'
      );
    }
  }

  return url;
};

/**
 * Application configuration object
 */
export const CONFIG = {
  /**
   * Backend API base URL
   */
  BACKEND_API: getBackendUrl(),

  /**
   * Environment flags
   */
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',

  /**
   * Feature flags
   */
  ALLOW_TEST_EMAILS: process.env.NEXT_PUBLIC_ALLOW_TEST_EMAILS === 'true',

  /**
   * API configuration
   */
  API_TIMEOUT: 10000, // 10 seconds

  /**
   * Get full API endpoint URL
   * @param path - API path (e.g., '/accounts/auth/login/')
   * @returns Full URL to the endpoint
   */
  getApiUrl: (path: string): string => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${CONFIG.BACKEND_API}${normalizedPath}`;
  },
} as const;

/**
 * Validate configuration on load (only in browser)
 */
if (typeof window !== 'undefined') {
  // Log configuration in development
  if (CONFIG.IS_DEV) {
    logger.log('Application Configuration:', {
      BACKEND_API: CONFIG.BACKEND_API,
      IS_DEV: CONFIG.IS_DEV,
      IS_PROD: CONFIG.IS_PROD,
      ALLOW_TEST_EMAILS: CONFIG.ALLOW_TEST_EMAILS,
    });
  }

  // Validate critical settings in production
  if (CONFIG.IS_PROD) {
    if (!CONFIG.BACKEND_API.startsWith('https://')) {
      logger.warn(
        'Production environment is not using HTTPS. ' +
          'This is insecure and may cause authentication issues.'
      );
    }
  }
}
