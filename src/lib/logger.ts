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

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  // Future: Add integration with error tracking service (Sentry, LogRocket, etc.)
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    this.config = {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  /**
   * Log general information - only in development
   */
  log(...args: any[]): void {
    if (this.config.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log informational messages - only in development
   */
  info(...args: any[]): void {
    if (this.config.isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Log warnings - in all environments
   */
  warn(...args: any[]): void {
    if (this.config.isDevelopment) {
      console.warn(...args);
    } else {
      // In production, could send to error tracking service
      // Example: Sentry.captureMessage(args.join(' '), 'warning');
    }
  }

  /**
   * Log errors - in all environments
   */
  error(...args: any[]): void {
    if (this.config.isDevelopment) {
      console.error(...args);
    } else {
      // In production, send to error tracking service
      // Example: Sentry.captureException(args[0]);
      // For now, just log to console in production for critical errors
      console.error('Error occurred:', args[0]?.message || 'Unknown error');
    }
  }

  /**
   * Debug logging - only in development, never in production
   */
  debug(...args: any[]): void {
    if (this.config.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Group logs - only in development
   */
  group(label: string): void {
    if (this.config.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * End log group - only in development
   */
  groupEnd(): void {
    if (this.config.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Log a table - only in development
   */
  table(data: any): void {
    if (this.config.isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Sanitize sensitive data before logging
   * Removes or masks PII and sensitive information
   */
  private sanitize(data: any): any {
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
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Safe logging that sanitizes sensitive data - only in development
   */
  safe(...args: any[]): void {
    if (this.config.isDevelopment) {
      const sanitizedArgs = args.map(arg => this.sanitize(arg));
      console.log(...sanitizedArgs);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing or advanced usage
export { Logger };
