import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { logger } from "./logger";

// Extend the AxiosRequestConfig to include _retry property
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// CSRF Token utility function
const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null; // SSR safety
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Create axios instance with base configuration
const createApiClient = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Include cookies in all requests
  });

  // Request interceptor - add CSRF token for state-changing operations
  instance.interceptors.request.use(
    (config) => {
      // httpOnly cookies are automatically included
      
      // Add CSRF token for state-changing operations
      if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh and network errors
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Handle network errors (no response from server)
      if (!error.response) {
        logger.error('Network error:', error.message);
        return Promise.reject(new Error('Network error. Please check your connection and try again.'));
      }

      const originalRequest = error.config as RetryAxiosRequestConfig;

      if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Add timeout to token refresh to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          // Try to refresh token using httpOnly cookies
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/accounts/auth/token/refresh/`,
            {},
            {
              withCredentials: true,
              signal: controller.signal
            }
          );

          clearTimeout(timeoutId);

          if (response.status === 200) {
            // Token refreshed successfully, retry original request
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, emit auth failure event
          if (axios.isCancel(refreshError)) {
            logger.error('Token refresh timed out');
          }
          window.dispatchEvent(new CustomEvent("auth:failed"));
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export the configured axios instance
export const apiClient = createApiClient();

// CSRF Token utility functions
export { getCsrfToken };

export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8000/api/v1"}/auth/csrf-token/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
  } catch (error) {
    logger.warn('Failed to fetch CSRF token:', error);
  }
  return null;
};