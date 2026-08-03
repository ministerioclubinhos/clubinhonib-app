import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { eventBus, EventTypes, ToastEvent, ApiErrorEvent, ToastVariant } from '@/utils/eventBus';
import {
  analyzeError,
  logApiError,
  isRequestCanceled,
  AnalyzedError,
} from '@/utils/apiError';
import { AuthErrorCode } from '@/types/api-error';

const baseURL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

const refreshAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface ApiAuthBindings {
  getTokens: () => AuthTokens;
  onTokensRefreshed: (tokens: { accessToken: string; refreshToken: string }) => void;
  onSessionExpired: () => void;
}

let authBindings: ApiAuthBindings = {
  getTokens: () => ({ accessToken: null, refreshToken: null }),
  onTokensRefreshed: () => undefined,
  onSessionExpired: () => undefined,
};

export const configureApiAuth = (bindings: ApiAuthBindings): void => {
  authBindings = bindings;
};

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipGlobalError?: boolean;
  skipAuthRefresh?: boolean;
}

const getRequestPath = (url?: string): string => {
  if (!url) return '';
  try {
    return new URL(url, baseURL || window.location.origin).pathname
      .replace(/\/$/, '')
      .toLowerCase();
  } catch {
    return url.split('?')[0].replace(/\/$/, '').toLowerCase();
  }
};

const isCredentialEndpoint = (url?: string) => {
  const path = getRequestPath(url);
  return new Set([
    '/auth/login',
    '/auth/google',
    '/auth/register',
    '/auth/complete-register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]).has(path);
};

const isOnAuthRoute = () => {
  const p = (window.location?.pathname || '').toLowerCase();
  return /^\/(login|cadastrar|cadastrar-google|esqueci-senha|redefinir-senha)/.test(p);
};

// Request interceptor - adiciona token
apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authBindings.getTokens().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Singleton para refresh token
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;
const REFRESH_LOCK_KEY = 'authRefreshLock';
const REFRESH_LOCK_TTL_MS = 10_000;

class SessionRefreshError extends Error {
  constructor(
    message: string,
    readonly invalidatesSession: boolean,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'SessionRefreshError';
  }
}

interface RefreshLock {
  owner: string;
  expiresAt: number;
}

const createLockOwner = (): string =>
  window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const tryAcquireRefreshLock = (): string | null => {
  const owner = createLockOwner();
  try {
    const now = Date.now();
    const rawLock = localStorage.getItem(REFRESH_LOCK_KEY);
    const currentLock = rawLock ? (JSON.parse(rawLock) as RefreshLock) : null;
    if (currentLock?.owner && currentLock.expiresAt > now) return null;

    const nextLock: RefreshLock = { owner, expiresAt: now + REFRESH_LOCK_TTL_MS };
    localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(nextLock));
    const acquired = JSON.parse(
      localStorage.getItem(REFRESH_LOCK_KEY) || '{}'
    ) as Partial<RefreshLock>;
    return acquired.owner === owner ? owner : null;
  } catch {
    // Browsers with blocked storage still use the in-tab singleton.
    return owner;
  }
};

const releaseRefreshLock = (owner: string): void => {
  try {
    const rawLock = localStorage.getItem(REFRESH_LOCK_KEY);
    const currentLock = rawLock ? (JSON.parse(rawLock) as RefreshLock) : null;
    if (currentLock?.owner === owner) localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    // Best-effort coordination only.
  }
};

const waitForAnotherTabRefresh = (): Promise<void> =>
  new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('storage', handleStorage);
      window.clearTimeout(timeoutId);
      resolve();
    };
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === 'accessToken' ||
        event.key === 'refreshToken' ||
        (event.key === REFRESH_LOCK_KEY && event.newValue === null)
      ) {
        finish();
      }
    };
    const timeoutId = window.setTimeout(finish, REFRESH_LOCK_TTL_MS);
    window.addEventListener('storage', handleStorage);
  });

const requestNewTokens = async (
  currentRefresh: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  let lockOwner = tryAcquireRefreshLock();
  if (!lockOwner) {
    await waitForAnotherTabRefresh();
    const peerTokens = authBindings.getTokens();
    if (!peerTokens.refreshToken) {
      throw new SessionRefreshError('Sessão encerrada em outra aba', true);
    }
    if (peerTokens.refreshToken !== currentRefresh && peerTokens.accessToken) {
      return {
        accessToken: peerTokens.accessToken,
        refreshToken: peerTokens.refreshToken,
      };
    }

    lockOwner = tryAcquireRefreshLock();
    if (!lockOwner) {
      throw new SessionRefreshError('Outra aba está renovando a sessão', false);
    }
  }

  try {
    const res = await refreshAxios.post('/auth/refresh', {
      refreshToken: currentRefresh,
    });
    const { accessToken, refreshToken } = res.data || {};
    if (!accessToken || !refreshToken) {
      throw new SessionRefreshError('Refresh sem tokens válidos', true);
    }

    if (authBindings.getTokens().refreshToken !== currentRefresh) {
      throw new SessionRefreshError('Sessão alterada durante o refresh', false);
    }

    authBindings.onTokensRefreshed({ accessToken, refreshToken });
    return { accessToken, refreshToken };
  } finally {
    releaseRefreshLock(lockOwner);
  }
};

const doRefresh = async () => {
  if (!refreshPromise) {
    const currentRefresh = authBindings.getTokens().refreshToken;

    if (!currentRefresh) {
      authBindings.onSessionExpired();
      throw new SessionRefreshError('Refresh token ausente', true);
    }

    refreshPromise = requestNewTokens(currentRefresh)
      .catch((err) => {
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        const refreshError =
          err instanceof SessionRefreshError
            ? err
            : new SessionRefreshError(
                'Não foi possível renovar a sessão',
                status === 400 || status === 401 || status === 403,
                err
              );

        if (
          refreshError.invalidatesSession &&
          authBindings.getTokens().refreshToken === currentRefresh
        ) {
          authBindings.onSessionExpired();
        }
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

/**
 * Determina a variante do toast baseado na categoria do erro
 * Conforme documentação da API para tratamento por HTTP Status
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
 * Determina a duração do toast baseado na categoria e status do erro
 * Erros mais críticos ficam mais tempo visíveis
 */
const getToastDuration = (analyzed: AnalyzedError): number => {
  // Erros de autenticação/permissão ficam mais tempo visíveis
  if (analyzed.category === 'AUTH' || analyzed.category === 'PERMISSION') {
    return 6000;
  }
  // Erros internos também ficam mais tempo
  if (analyzed.category === 'INTERNAL' || analyzed.httpStatus === 500) {
    return 5000;
  }
  // Erros de validação são mais curtos (usuário precisa corrigir algo)
  if (analyzed.category === 'VALIDATION') {
    return 3500;
  }
  // Padrão
  return 4000;
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
  const autoHideDuration = getToastDuration(analyzed);
  eventBus.emit<ToastEvent>(EventTypes.SHOW_TOAST, {
    message: analyzed.message,
    variant,
    autoHideDuration,
  });
};

// Response interceptor
apiAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // Cancelamentos são esperados ao desmontar componentes ou substituir buscas.
    // Não devem gerar log, evento global, toast ou tentativa de refresh.
    if (isRequestCanceled(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Analisa o erro usando o sistema padronizado
    const analyzed = analyzeError(error);

    // Falhas de credenciais/refresh/logout são tratadas pelo chamador.
    if (status === 401 && isCredentialEndpoint(url)) {
      return Promise.reject(error);
    }

    // 401 não tratado - tenta refresh
    if (status === 401 && !originalRequest?._retry && !originalRequest?.skipAuthRefresh) {
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
        // Só redireciona quando o servidor confirmou que a sessão é inválida.
        if (
          refreshErr instanceof SessionRefreshError &&
          refreshErr.invalidatesSession &&
          !isOnAuthRoute()
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    // Tratamento global de erros (se não for skipado)
    if (!originalRequest?.skipGlobalError) {
      // Não mostra toast para 401 em endpoints de auth (login, etc)
      const shouldShowToast = !(status === 401 && isCredentialEndpoint(url));

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
