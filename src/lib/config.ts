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
 */
const getBackendUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:8000/api/v1';

  // Validate in production - backend URL must be explicitly set
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_BACKEND_API) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_API must be set in production environment. ' +
        'Please configure this variable in your deployment settings.'
    );
  }

  // Warn about 127.0.0.1 usage (breaks httpOnly cookie authentication)
  if (url.includes('127.0.0.1')) {
    logger.warn(
      'WARNING: Using 127.0.0.1 instead of localhost may break httpOnly cookie authentication. ' +
        'Use localhost for consistency with the backend CORS configuration.'
    );
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
