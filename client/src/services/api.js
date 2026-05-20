import axios from 'axios';
import { STORAGE_KEYS } from '../constants/index.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const isMockMode = () => import.meta.env.VITE_USE_MOCK !== 'false';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const orgId = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORG_ID);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers['X-Organization-Id'] = orgId;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
            withCredentials: true,
          }
        );
        const newToken = data.data?.accessToken;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    error.message ||
    'Something went wrong'
  );
}

export function normalizeResponse(response) {
  const body = response.data;
  if (body && typeof body.success === 'boolean') {
    if (!body.success) throw new Error(body.error?.message || 'Request failed');
    return { data: body.data, meta: body.meta };
  }
  return { data: body, meta: null };
}
