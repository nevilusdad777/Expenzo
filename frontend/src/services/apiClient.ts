import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || undefined;

if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
  console.error(
    'VITE_API_BASE_URL is not set. Check frontend/.env.example and frontend/.env.'
  );
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token') || localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? 'Unexpected network error';
    const wrappedError = new Error(message) as Error & { status?: number };
    wrappedError.status = error.response?.status;
    return Promise.reject(wrappedError);
  }
);