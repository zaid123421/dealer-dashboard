import axios from 'axios';
import TokenService from '@/infrastructure/auth/token-service';
import { ROUTES } from '@/constants/routes';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = TokenService.getRefreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      TokenService.removeRefreshToken();
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.AUTH.LOGIN;
      }
    }
    return Promise.reject(error);
  },
);

export default api;