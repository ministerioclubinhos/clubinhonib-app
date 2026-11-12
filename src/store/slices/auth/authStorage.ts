export interface StoredAuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_PERSISTED_AUTH_KEY = 'persist:auth';
const REFRESH_LOCK_KEY = 'authRefreshLock';

const normalizeToken = (value: string | null): string | null => {
  if (!value) return null;
  const normalized = value.trim().replace(/^"|"$/g, '');
  return normalized || null;
};

export const readAuthTokens = (): StoredAuthTokens | null => {
  try {
    const accessToken = normalizeToken(localStorage.getItem(ACCESS_TOKEN_KEY));
    const refreshToken = normalizeToken(localStorage.getItem(REFRESH_TOKEN_KEY));

    if (!accessToken || !refreshToken) return null;
    localStorage.removeItem(LEGACY_PERSISTED_AUTH_KEY);
    return { accessToken, refreshToken };
  } catch {
    return null;
  }
};

export const writeAuthTokens = (tokens: StoredAuthTokens): void => {
  const accessToken = normalizeToken(tokens.accessToken);
  const refreshToken = normalizeToken(tokens.refreshToken);
  if (!accessToken || !refreshToken) {
    clearAuthTokens();
    return;
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.removeItem(LEGACY_PERSISTED_AUTH_KEY);
  } catch {
    // Redux still owns the in-memory session if storage is unavailable.
  }
};

export const clearAuthTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_PERSISTED_AUTH_KEY);
    localStorage.removeItem(REFRESH_LOCK_KEY);
  } catch {
    // Local cleanup is best-effort in restricted browser environments.
  }
};

export const sanitizeToken = (token: string): string => normalizeToken(token) ?? '';
