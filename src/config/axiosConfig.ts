// src/config/axiosConfig.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { store } from '@/store/slices';
import { logout, login } from '@/store/slices/auth/authSlice';

// Vite: variáveis em import.meta.env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:30001';

const apiAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true, // habilite se seu backend usa cookies/sessões
  // timeout: 20000,
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (import.meta.env.DEV) {
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
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('[Axios][Response] Token expirado. Tentando refresh...');

      try {
        const refreshToken = store.getState().auth.refreshToken;
        if (!refreshToken) throw new Error('[Axios][Response] Nenhum refreshToken no Redux');

        // use axios simples (sem Authorization) para o refresh
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefresh } = data;
        console.log('[Axios][Response] Novo token obtido via refresh');

        store.dispatch(login({ accessToken, refreshToken: newRefresh }));

        // reexecuta a requisição original com o novo token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshError) {
        console.error('[Axios][Response] Erro no refresh token:', refreshError);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiAxios;
