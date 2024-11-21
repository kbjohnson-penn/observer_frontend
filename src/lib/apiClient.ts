import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API}`, // Replace with your backend API URL
  timeout: 5000,
});

// Attach access token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors by refreshing tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh API
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/token/refresh`,
          {
            refresh: refreshToken,
          }
        );

        // Update tokens
        Cookies.set("accessToken", data.access, { secure: true });
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Logout if refresh fails
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
