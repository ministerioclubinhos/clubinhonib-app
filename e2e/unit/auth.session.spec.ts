import { expect, test } from '@playwright/test';

import { UserRole } from '@/types/shared';
import type { User } from '@/store/slices/auth/authSlice';

/**
 * Estado da sessão: login, rotação de tokens e logout.
 *
 * Estes casos vieram da `main` como testes do Vitest com `jsdom`. O projeto
 * `unit` roda no Node, sem navegador, então o `localStorage` é um substituto
 * em memória — o suficiente para o que `authStorage` usa.
 */
class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem = (key: string) => this.values.get(key) ?? null;
  setItem = (key: string, value: string) => void this.values.set(key, String(value));
  removeItem = (key: string) => void this.values.delete(key);
  clear = () => this.values.clear();
}

const storage = new MemoryStorage();
(globalThis as unknown as { localStorage: MemoryStorage }).localStorage = storage;

/** Só o que estes casos leem do usuário; o resto do perfil não entra na conta. */
const userFor = (role: UserRole) =>
  ({ id: `${role}-id`, email: `${role}@example.com`, name: role, role, active: true }) as unknown as User;

const slice = () => import('@/store/slices/auth/authSlice');
const routes = () => import('@/store/slices/auth/authRoutes');

test.describe('sessão de autenticação', () => {
  test.beforeEach(() => storage.clear());

  for (const [role, expectedRoute] of [
    [UserRole.ADMIN, '/adm'],
    [UserRole.COORDINATOR, '/adm'],
    [UserRole.TEACHER, '/area-do-professor'],
  ] as const) {
    test(`mantém o login de ${role} e o leva para a tela certa`, async () => {
      const { default: reducer, login } = await slice();
      const { getAuthenticatedHome } = await routes();

      const state = reducer(
        undefined,
        login({ accessToken: '"access-token"', refreshToken: '"refresh-token"', user: userFor(role) }),
      );

      expect(state.user?.role).toBe(role);
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
      expect(getAuthenticatedHome(state.user?.role)).toBe(expectedRoute);
      expect(storage.getItem('accessToken')).toBe('access-token');
    });
  }

  test('troca os tokens sem perder o usuário logado', async () => {
    const { default: reducer, login, tokensRefreshed } = await slice();
    const loggedIn = reducer(
      undefined,
      login({ accessToken: 'access-1', refreshToken: 'refresh-1', user: userFor(UserRole.COORDINATOR) }),
    );

    const refreshed = reducer(loggedIn, tokensRefreshed({ accessToken: 'access-2', refreshToken: 'refresh-2' }));

    expect(refreshed.user).toEqual(loggedIn.user);
    expect(refreshed.isAuthenticated).toBe(true);
    expect(refreshed.accessToken).toBe('access-2');
    expect(storage.getItem('refreshToken')).toBe('refresh-2');
  });

  test('o logout limpa tudo o que a sessão guardou', async () => {
    const { default: reducer, login, logout } = await slice();
    storage.setItem('persist:auth', 'legacy-session-data');
    const loggedIn = reducer(
      undefined,
      login({ accessToken: 'access', refreshToken: 'refresh', user: userFor(UserRole.TEACHER) }),
    );

    const signedOut = reducer(loggedIn, logout());

    expect(signedOut.isAuthenticated).toBe(false);
    expect(signedOut.user).toBeNull();
    expect(signedOut.accessToken).toBeNull();
    expect(signedOut.refreshToken).toBeNull();
    expect(storage.getItem('accessToken')).toBeNull();
    expect(storage.getItem('refreshToken')).toBeNull();
    expect(storage.getItem('persist:auth')).toBeNull();
  });
});
