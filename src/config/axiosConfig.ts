import axios from 'axios';
import type {
  InternalAxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import { store } from '@/store/slices';
import { logout, login } from '@/store/slices/auth/authSlice';
import {
  eventBus,
  EventTypes,
  ToastEvent,
  ApiErrorEvent,
  ToastVariant,
} from '@/utils/eventBus';
import {
  analyzeError,
  getErrorMessage,
  isApiError,
  logApiError,
  AnalyzedError,
} from '@/utils/apiError';
import { AuthErrorCode } from '@/types/api-error';

const baseURL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipGlobalError?: boolean;
}

const isAuthEndpoint = (url?: string) => {
  const u = (url || '').toLowerCase();
  return /\/auth\/(login|google|register|refresh)$/.test(u);
};

const isOnAuthRoute = () => {
  const p = (window.location?.pathname || '').toLowerCase();
  return /^\/(login|cadastrar|cadastrar-google|esqueci-senha|redefinir-senha)/.test(p);
};

// Request interceptor - adiciona token
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

// Singleton para refresh token
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

/**
 * Determina a variante do toast baseado na categoria do erro
 */
const getToastVariant = (analyzed: AnalyzedError): ToastVariant => {
  switch (analyzed.category) {
    case 'VALIDATION':
      return 'warning';
    case 'AUTH':
    case 'PERMISSION':
    case 'INTERNAL':
    case 'NETWORK':
      return 'error';
    case 'USER':
    case 'RESOURCE':
    case 'CLUB':
    case 'CHILD':
    case 'PROFILE':
    case 'CONTACT':
    case 'CONTENT':
      // Conflitos são warnings, not found são info
      if (analyzed.httpStatus === 409) return 'warning';
      if (analyzed.httpStatus === 404) return 'info';
      return 'error';
    default:
      return 'error';
  }
};

/**
 * Trata o erro globalmente baseado na análise
 */
const handleGlobalError = (error: AxiosError, analyzed: AnalyzedError) => {
  // Log para debug
  logApiError(error, 'Axios Interceptor');

  // Emitir evento de erro da API para listeners específicos
  eventBus.emit<ApiErrorEvent>(EventTypes.API_ERROR, {
    category: analyzed.category,
    code: analyzed.code,
    message: analyzed.message,
    field: analyzed.field,
    httpStatus: analyzed.httpStatus,
    requiresRedirect: analyzed.requiresRedirect,
    redirectTo: analyzed.redirectTo,
  });

  // Mostrar toast com a mensagem apropriada
  const variant = getToastVariant(analyzed);
  eventBus.emit<ToastEvent>(EventTypes.SHOW_TOAST, {
    message: analyzed.message,
    variant,
  });
};

// Response interceptor
apiAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Analisa o erro usando o sistema padronizado
    const analyzed = analyzeError(error);

    // 401 em endpoint de auth - deixa o componente tratar
    if (status === 401 && isAuthEndpoint(url)) {
      return Promise.reject(error);
    }

    // 401 não tratado - tenta refresh
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // Verifica se é erro de token específico que não deve tentar refresh
      if (analyzed.code === AuthErrorCode.INVALID_CREDENTIALS) {
        return Promise.reject(error);
      }

      try {
        const { accessToken } = await doRefresh();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshErr) {
        // Refresh falhou - redireciona para login se não estiver em rota de auth
        if (!isOnAuthRoute()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    // Tratamento global de erros (se não for skipado)
    if (!originalRequest?.skipGlobalError) {
      // Não mostra toast para 401 em endpoints de auth (login, etc)
      const shouldShowToast = !(status === 401 && isAuthEndpoint(url));

      if (shouldShowToast) {
        handleGlobalError(error, analyzed);
      }

      // Redirect automático para erros de permissão
      if (analyzed.category === 'PERMISSION' && analyzed.requiresRedirect && analyzed.redirectTo) {
        // Pequeno delay para o toast aparecer antes do redirect
        setTimeout(() => {
          window.location.href = analyzed.redirectTo!;
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default apiAxios;
