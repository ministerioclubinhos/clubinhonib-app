import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { store } from '@/store/slices';
import { logout, login } from '@/store/slices/auth/authSlice';

const baseURL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000';

const apiAxios = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;

    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[Axios][Request] Token incluído no header');
    } else {
      console.warn('[Axios][Request] Nenhum token encontrado no Redux');
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[Axios][Request] Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

apiAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[Axios][Response] Token expirado. Tentando refresh...');

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) {
          throw new Error('[Axios][Response] Nenhum refreshToken encontrado no Redux');
        }

        const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = response.data;
        console.log('[Axios][Response] Novo token obtido via refresh');

        store.dispatch(login({ accessToken, refreshToken: newRefresh }));

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return apiAxios(originalRequest);
      } catch (refreshError) {
        console.error('[Axios][Response] Erro ao tentar refresh token:', refreshError);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiAxios;
