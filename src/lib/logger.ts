/**
 * Centralized logging utility for the Observer platform.
 *
 * This logger ensures that sensitive information is not logged in production
 * and provides a consistent interface for logging throughout the application.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.log('User action', userData);      // Only logs in development
 *   logger.error('API error', error);         // Logs in all environments
 *   logger.debug('Debug info', debugData);    // Only logs in development
 */

interface LoggerConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  // Future: Add integration with error tracking service (Sentry, LogRocket, etc.)
}

// Configuration
const config: LoggerConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Sanitize sensitive data before logging
 * Removes or masks PII and sensitive information
 */
const sanitize = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'access_token',
    'refresh_token',
    'ssn',
    'social_security',
    'credit_card',
    'cvv',
    'api_key',
    'secret',
  ];

  const sanitized = { ...data };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized;
};

/**
 * Log general information - only in development
 */
const log = (...args: any[]): void => {
  if (config.isDevelopment) {
    console.log(...args);
  }
};

/**
 * Log informational messages - only in development
 */
const info = (...args: any[]): void => {
  if (config.isDevelopment) {
    console.info(...args);
  }
};

/**
 * Log warnings - in all environments
 */
const warn = (...args: any[]): void => {
  if (config.isDevelopment) {
    console.warn(...args);
  } else {
    // In production, could send to error tracking service
    // Example: Sentry.captureMessage(args.join(' '), 'warning');
  }
};

/**
 * Log errors - in all environments
 */
const error = (...args: any[]): void => {
  if (config.isDevelopment) {
    console.error(...args);
  } else {
    // In production, send to error tracking service
    // Example: Sentry.captureException(args[0]);
    // For now, just log to console in production for critical errors
    console.error('Error occurred:', args[0]?.message || 'Unknown error');
  }
};

/**
 * Debug logging - only in development, never in production
 */
const debug = (...args: any[]): void => {
  if (config.isDevelopment) {
    console.debug(...args);
  }
};

/**
 * Group logs - only in development
 */
const group = (label: string): void => {
  if (config.isDevelopment) {
    console.group(label);
  }
};

/**
 * End log group - only in development
 */
const groupEnd = (): void => {
  if (config.isDevelopment) {
    console.groupEnd();
  }
};

/**
 * Log a table - only in development
 */
const table = (data: any): void => {
  if (config.isDevelopment) {
    console.table(data);
  }
};

/**
 * Safe logging that sanitizes sensitive data - only in development
 */
const safe = (...args: any[]): void => {
  if (config.isDevelopment) {
    const sanitizedArgs = args.map((arg) => sanitize(arg));
    console.log(...sanitizedArgs);
  }
};

// Export logger object with functional methods
export const logger = {
  log,
  info,
  warn,
  error,
  debug,
  group,
  groupEnd,
  table,
  safe,
} as const;
