import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/api.config';

const isAuthenticationFailure = (error: AxiosError) => {
  const message = String((error.response?.data as any)?.message || '').toLowerCase();
  return (
    error.response?.status === 401 &&
    (
      message.includes('invalid or expired token') ||
      message.includes('invalid token') ||
      message.includes('token expired') ||
      message.includes('no token provided') ||
      message.includes('unauthorized')
    )
  );
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (isAuthenticationFailure(error)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Avoid hard redirects on auth failures; let the app decide how to respond.
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
