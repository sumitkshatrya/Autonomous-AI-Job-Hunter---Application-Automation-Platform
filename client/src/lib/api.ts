import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const apiBaseUrl = rawBaseUrl ? `${rawBaseUrl.replace(/\/+$/, '')}/api` : '/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autoapply_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect on login or register checks
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('autoapply_token');
        localStorage.removeItem('autoapply_user');
      }
    }
    return Promise.reject(error);
  }
);

