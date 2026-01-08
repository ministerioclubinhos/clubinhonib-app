import axios from 'axios';
import type {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { store } from '@/store/slices';
import { logout, login } from '@/store/slices/auth/authSlice';

const baseURL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const isAuthEndpoint = (url?: string) => {
  const u = (url || '').toLowerCase();
  return /\/auth\/(login|google|register|refresh)$/.test(u);
};

const isOnAuthRoute = () => {
  const p = (window.location?.pathname || '').toLowerCase();
  return /^\/(login|cadastrar|cadastrar-google)/.test(p);
};

apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

const doRefresh = async () => {
  if (!refreshPromise) {
    const currentRefresh = store.getState().auth.refreshToken;
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, { refreshToken: currentRefresh })
      .then((res) => {
        const { accessToken, refreshToken } = res.data || {};
        if (!accessToken || !refreshToken) {
          throw new Error('Refresh sem tokens válidos');
        }
        store.dispatch(login({ accessToken, refreshToken }));
        return { accessToken, refreshToken };
      })
      .catch((err) => {
        store.dispatch(logout());
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

apiAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    if (status === 401 && isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const { accessToken } = await doRefresh();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshErr) {
        if (!isOnAuthRoute()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiAxios;
