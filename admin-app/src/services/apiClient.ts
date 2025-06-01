import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { auth } from '@/config/firebase';

// Define the base API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/waffer-1b16d/us-central1/api';

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding Firebase auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get current Firebase user
      const user = auth.currentUser;

      // If user exists, get the ID token and add it to the headers
      if (user && config.headers) {
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get current Firebase user
        const user = auth.currentUser;

        if (user) {
          // Force refresh the token
          const token = await user.getIdToken(true);

          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // User is not logged in, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);

        // If token refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden errors (insufficient permissions)
    if (error.response?.status === 403) {
      console.error('Permission denied');
      // You could redirect to an access denied page or show a notification
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

// Helper methods for common HTTP methods
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then(response => response.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then(response => response.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then(response => response.data),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then(response => response.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then(response => response.data),
};

export default apiClient;
