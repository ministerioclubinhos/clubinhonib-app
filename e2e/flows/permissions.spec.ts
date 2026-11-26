import { type APIRequestContext, expect, request, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  API_URL,
  COORDINATOR_EMAIL,
  COORDINATOR_PASSWORD,
  TEACHER_EMAIL,
  TEACHER_PASSWORD,
} from '../support/env';

/**
 * Matriz de permissões contra a API real. A interface esconde o que cada perfil
 * não pode fazer, mas a autoridade é a API: nada aqui passa pela tela.
 */
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const UUID = '00000000-0000-4000-8000-000000000000';

/** Rotas exclusivas do administrador. `:id` vira um UUID inexistente. */
const ADMIN_ONLY: readonly [Method, string][] = [
  ['GET', '/users'],
  ['GET', '/users/:id'],
  ['POST', '/users'],
  ['PUT', '/users/:id'],
  ['DELETE', '/users/:id'],
  ['PATCH', '/users/:id/image'],
  ['GET', '/feature-flags'],
  ['GET', '/feature-flags/stats'],
  ['GET', '/feature-flags/e2e_inexistente'],
  ['POST', '/feature-flags'],
  ['POST', '/feature-flags/seed'],
  ['PATCH', '/feature-flags/e2e_inexistente'],
  ['PATCH', '/feature-flags/e2e_inexistente/toggle'],
  ['DELETE', '/feature-flags/e2e_inexistente'],
  ['GET', '/log-records/audit'],
  ['GET', '/log-records/observability'],
  ['DELETE', '/log-records/audit'],
  ['DELETE', '/log-records/audit/:id'],
  ['DELETE', '/log-records/observability'],
  ['DELETE', '/log-records/observability/:id'],
  ['GET', '/api/v1/lessons'],
  ['GET', '/api/v1/lessons/dashboard'],
  ['GET', '/api/v1/lessons/generations/active'],
  ['GET', '/api/v1/lessons/prompt-preferences/me'],
  ['GET', '/api/v1/lessons/providers/settings'],
  ['GET', '/api/v1/lessons/providers/openai/settings'],
  ['GET', '/api/v1/lessons/providers/gemini/settings'],
  ['PUT', '/api/v1/lessons/providers/settings'],
  ['PUT', '/api/v1/lessons/providers/openai/settings'],
  ['PUT', '/api/v1/lessons/providers/gemini/settings'],
  ['PATCH', '/api/v1/lessons/prompt-preferences/me'],
  ['POST', '/api/v1/lessons'],
  ['GET', '/api/v1/lessons/:id'],
  ['DELETE', '/api/v1/lessons/:id'],
  ['POST', '/api/v1/lessons/:id/stages/generate'],
  ['POST', '/api/v1/lessons/:id/stages/regenerate-images'],
  ['POST', '/api/v1/lessons/:id/stages/approve'],
  ['PATCH', '/api/v1/lessons/:id/stages/content'],
  ['POST', '/api/v1/lessons/:id/publish-week-material'],
  ['GET', '/club-control/periods'],
  ['POST', '/club-control/periods'],
  ['PUT', '/club-control/periods/:id'],
  ['DELETE', '/club-control/periods/:id'],
  ['POST', '/club-control/exceptions'],
  ['DELETE', '/club-control/exceptions/:id'],
  ['GET', '/club-control/dashboard'],
  ['GET', '/statistics/overview'],
  ['GET', '/statistics/children'],
  ['GET', '/statistics/teachers'],
  ['GET', '/statistics/clubs'],
  ['GET', '/statistics/pagelas'],
  ['GET', '/statistics/accepted-christs'],
  ['GET', '/statistics/insights'],
  ['GET', '/statistics/attendance/week'],
  ['GET', '/comments'],
  ['GET', '/comments/:id'],
  ['PUT', '/comments/:id'],
  ['PATCH', '/comments/:id/publish'],
  ['DELETE', '/comments/:id'],
  ['GET', '/contact'],
  ['GET', '/contact/:id'],
  ['PATCH', '/contact/:id/read'],
  ['DELETE', '/contact/:id'],
  ['GET', '/site-feedbacks'],
  ['GET', '/site-feedbacks/:id'],
  ['PUT', '/site-feedbacks/:id'],
  ['DELETE', '/site-feedbacks/:id'],
  ['GET', '/feed-photo-comments/moderation'],
  ['PATCH', '/feed-photo-comments/:id/moderation'],
  ['GET', '/ideas-sections'],
  ['GET', '/ideas-sections/:id'],
  ['PATCH', '/ideas-sections/:id'],
  ['DELETE', '/ideas-sections/:id'],
  ['POST', '/ideas-sections/:id/ai-enhancement'],
  ['GET', '/image-sections'],
  ['PATCH', '/image-sections/:id'],
  ['DELETE', '/image-sections/:id'],
  ['GET', '/play/admin/stats'],
  ['GET', '/play/admin/submissions'],
  ['POST', '/play/admin/categories'],
  ['POST', '/play/admin/submissions/:id/approve'],
  ['POST', '/play/admin/submissions/:id/reject'],
  ['POST', '/documents'],
  ['PATCH', '/documents/:id'],
  ['DELETE', '/documents/:id'],
  ['POST', '/events'],
  ['PATCH', '/events/:id'],
  ['DELETE', '/events/:id'],
  ['POST', '/informatives'],
  ['PATCH', '/informatives/:id'],
  ['DELETE', '/informatives/:id'],
  ['POST', '/meditations'],
  ['PATCH', '/meditations/:id'],
  ['DELETE', '/meditations/:id'],
  ['POST', '/week-material-pages'],
  ['PATCH', '/week-material-pages/:id'],
  ['DELETE', '/week-material-pages/:id'],
  ['POST', '/week-material-pages/current-week/:id'],
  ['POST', '/ideas-pages'],
  ['PATCH', '/ideas-pages/:id'],
  ['DELETE', '/ideas-pages/:id'],
  ['POST', '/image-pages'],
  ['PATCH', '/image-pages/:id'],
  ['DELETE', '/image-pages/:id'],
  ['POST', '/video-pages'],
  ['PATCH', '/video-pages/:id'],
  ['DELETE', '/video-pages/:id'],
];

/** Rotas que exigem sessão, mesmo sem restringir o perfil no guard. */
const SESSION_ONLY: readonly [Method, string][] = [
  ['GET', '/auth/me'],
  ['GET', '/profiles'],
  ['GET', '/profiles/:id'],
  ['GET', '/children'],
  ['POST', '/children'],
  ['DELETE', '/children/:id'],
  ['GET', '/pagelas'],
  ['POST', '/pagelas'],
  ['POST', '/accepted-christs'],
  ['GET', '/clubs'],
  ['POST', '/clubs'],
  ['DELETE', '/clubs/:id'],
  ['GET', '/teacher-profiles'],
  ['PATCH', '/teacher-profiles/:id/assign-club'],
  ['GET', '/coordinator-profiles'],
  ['PATCH', '/coordinator-profiles/:id/assign-club'],
  ['GET', '/week-material-pages'],
  ['GET', '/meditations'],
  ['GET', '/informatives'],
  ['GET', '/notifications/me'],
  ['POST', '/ideas-sections'],
  ['POST', '/image-sections'],
  ['POST', '/comments'],
  ['POST', '/site-feedbacks'],
  ['GET', '/play/home'],
];

const pathOf = (route: string): string => route.replace(':id', UUID);

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  completed: boolean;
}

interface Paged<T> {
  data?: T[];
  items?: T[];
}

const rowsOf = <T>(page: Paged<T>): T[] => page.data ?? page.items ?? [];

test.describe('Permissões da API', () => {
  let admin: ApiClient;
  let teacher: ApiClient;
  let coordinator: ApiClient;
  let visitor: APIRequestContext;

  test.beforeAll(async () => {
    admin = await ApiClient.login();
    teacher = await ApiClient.login(TEACHER_EMAIL, TEACHER_PASSWORD);
    coordinator = await ApiClient.login(COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
    visitor = await request.newContext({ baseURL: API_URL });
  });

  test.afterAll(async () => {
    await Promise.all([admin?.dispose(), teacher?.dispose(), coordinator?.dispose(), visitor?.dispose()]);
  });

  test('visitante recebe 401 em tudo o que exige sessão', async () => {
    const wrong: string[] = [];
    for (const [method, route] of [...ADMIN_ONLY, ...SESSION_ONLY]) {
      const response = await visitor.fetch(pathOf(route), { method });
      if (response.status() !== 401) wrong.push(`${method} ${route} -> ${response.status()}`);
    }
    expect(wrong).toEqual([]);
  });

  for (const role of ['professor', 'coordenador'] as const) {
    test(`${role} recebe 403 em toda rota exclusiva do administrador`, async () => {
      const client = role === 'professor' ? teacher : coordinator;
      const wrong: string[] = [];
      for (const [method, route] of ADMIN_ONLY) {
        const result = await client.send(method, pathOf(route));
        if (result.status !== 403) wrong.push(`${method} ${route} -> ${result.status} ${result.message}`);
      }
      expect(wrong).toEqual([]);
    });
  }

  test('professor não administra clubinhos, vínculos nem perfis alheios, e nada muda', async () => {
    const clubs = rowsOf(await admin.get<Paged<{ id: string; time: string | null }>>('/clubs', { page: 1, limit: 1 }));
    expect(clubs.length, 'o ambiente local precisa de um clubinho').toBeGreaterThan(0);
    const club = clubs[0];
    const before = await admin.get(`/clubs/${club.id}`);
    // A listagem de usuários não traz administradores; o alheio é o coordenador.
    const other = await coordinator.get<{ id: string }>('/auth/me');

    const attempts: [Method, string, unknown?][] = [
      ['PATCH', `/clubs/${club.id}`, { time: '03:15' }],
      ['PATCH', `/clubs/${club.id}/toggle-active`],
      ['DELETE', `/clubs/${club.id}`],
      ['GET', '/profiles'],
      ['GET', `/profiles/${other.id}`],
      ['PUT', `/profiles/${other.id}`, { personalData: {} }],
      ['DELETE', `/profiles/${other.id}`],
    ];
    for (const [method, route, body] of attempts) {
      const result = await teacher.send(method, route, body);
      expect.soft([403, 404], `${method} ${route} -> ${result.status} ${result.message}`).toContain(result.status);
    }

    expect(await admin.get(`/clubs/${club.id}`)).toEqual(before);
  });

  test('coordenador não exclui clubinho', async () => {
    const [club] = rowsOf(await admin.get<Paged<{ id: string }>>('/clubs', { page: 1, limit: 1 }));
    const result = await coordinator.send('DELETE', `/clubs/${club.id}`);
    expect([403, 404]).toContain(result.status);
    expect(await admin.statusOf(`/clubs/${club.id}`)).toBe(200);
  });

  test.describe('cadastro público', () => {
    const suffix = uniqueSuffix();
    const emails = {
      escalation: `e2e.escalada.${suffix}@teste.clubinhonib.com`,
      pending: `e2e.pendente.${suffix}@teste.clubinhonib.com`,
    };

    async function userByEmail(email: string): Promise<UserRow | undefined> {
      const page = await admin.get<Paged<UserRow>>('/users', { page: 1, limit: 10, q: email });
      return rowsOf(page).find((user) => user.email === email);
    }

    test.afterAll(async () => {
      for (const email of Object.values(emails)) {
        const user = await userByEmail(email);
        if (user) await admin.delete(`/users/${user.id}`);
      }
    });

    test('ninguém se cadastra como administrador', async () => {
      const response = await visitor.post('/auth/register', {
        data: {
          name: 'E2E Escalada',
          email: emails.escalation,
          phone: '92999990000',
          password: 'Senha123@',
          role: 'admin',
        },
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
      expect(await userByEmail(emails.escalation), 'a conta não pode existir').toBeUndefined();
    });

    test('completar o cadastro de outra pessoa exige o comprovante do Google', async () => {
      await admin.post('/users', {
        name: 'E2E Pendente',
        email: emails.pending,
        phone: '92999990000',
        password: 'Original123@',
        role: 'teacher',
        completed: false,
        active: false,
      });
      const before = await userByEmail(emails.pending);
      expect(before).toBeTruthy();

      const takeover = {
        name: 'Invasor',
        email: emails.pending,
        phone: '92988887777',
        password: 'Invasor123@',
        role: 'coordinator',
      };
      const without = await visitor.post('/auth/complete-register', { data: takeover });
      const forged = await visitor.post('/auth/complete-register', {
        data: { ...takeover, registrationToken: teacher.token },
      });

      expect(without.status()).toBeGreaterThanOrEqual(400);
      expect(forged.status()).toBe(401);
      expect(await userByEmail(emails.pending)).toEqual(before);
    });
  });
});
