import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Injeksi Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('korfball_auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('korfball_auth_token');
        localStorage.removeItem('korfball_auth_user');
        window.location.href = '/login?expired=true';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan saat memproses data.';

    const errorMessage = Array.isArray(message) ? message.join(', ') : message;

    return Promise.reject(new Error(errorMessage));
  },
);

export default apiClient;
