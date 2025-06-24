import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend the AxiosRequestConfig to include _retry property
interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Create axios instance with base configuration
const createApiClient = () => {
  const instance = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryAxiosRequestConfig;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await axios.post("http://localhost:8000/api/v1/auth/token/refresh/", {
            refresh: refreshToken,
          });

          const { access, refresh: newRefresh } = response.data;
          localStorage.setItem("access_token", access);
          
          if (newRefresh) {
            localStorage.setItem("refresh_token", newRefresh);
          }

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          
          // Emit custom event for auth failure
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