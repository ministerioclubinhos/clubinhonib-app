// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import reducer, { login, logout, tokensRefreshed, User } from './authSlice';
import { getAuthenticatedHome } from './authRoutes';
import { UserRole } from '@/types/shared';

const userFor = (role: UserRole): User => ({
  id: `${role}-id`,
  email: `${role}@example.com`,
  name: role,
  role,
  active: true,
});

describe('auth session state', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    [UserRole.ADMIN, '/adm'],
    [UserRole.COORDINATOR, '/adm'],
    [UserRole.TEACHER, '/area-do-professor'],
  ])('preserves %s login and routes it correctly', (role, expectedRoute) => {
    const state = reducer(
      undefined,
      login({
        accessToken: '"access-token"',
        refreshToken: '"refresh-token"',
        user: userFor(role),
      })
    );

    expect(state.user?.role).toBe(role);
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.isAuthenticated).toBe(true);
    expect(getAuthenticatedHome(state.user?.role)).toBe(expectedRoute);
    expect(localStorage.getItem('accessToken')).toBe('access-token');
  });

  it('rotates tokens without losing the authenticated user', () => {
    const loggedIn = reducer(
      undefined,
      login({
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        user: userFor(UserRole.COORDINATOR),
      })
    );

    const refreshed = reducer(
      loggedIn,
      tokensRefreshed({ accessToken: 'access-2', refreshToken: 'refresh-2' })
    );

    expect(refreshed.user).toEqual(loggedIn.user);
    expect(refreshed.isAuthenticated).toBe(true);
    expect(refreshed.accessToken).toBe('access-2');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-2');
  });

  it('clears all local session data on logout', () => {
    localStorage.setItem('persist:auth', 'legacy-session-data');
    const loggedIn = reducer(
      undefined,
      login({
        accessToken: 'access',
        refreshToken: 'refresh',
        user: userFor(UserRole.TEACHER),
      })
    );

    const signedOut = reducer(loggedIn, logout());

    expect(signedOut.isAuthenticated).toBe(false);
    expect(signedOut.user).toBeNull();
    expect(signedOut.accessToken).toBeNull();
    expect(signedOut.refreshToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('persist:auth')).toBeNull();
  });
});
