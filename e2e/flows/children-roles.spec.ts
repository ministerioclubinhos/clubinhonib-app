import { expect, Page, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import {
  childInList,
  launchWindow,
  pagelaBody,
  pagelasOf,
  removeChild,
  seedChild,
  type LaunchWindow,
  type SeededChild,
} from '../support/children';
import { COORDINATOR_EMAIL, COORDINATOR_PASSWORD, TEACHER_EMAIL, TEACHER_PASSWORD } from '../support/env';
import { loginAs } from '../support/session';

/**
 * Crianças, pagelas e decisões vistas por **professor** e por **coordenador**,
 * contra a API real e logando pela tela com cada papel.
 *
 * Os outros arquivos desta área rodam como administrador, que enxerga tudo. As
 * regras que só existem para os demais papéis — o recorte por clubinho, o que
 * cada um pode ou não fazer, a autoria gravada com o usuário certo — só
 * aparecem aqui.
 *
 * Usa os usuários fixos da suíte de automações (`e2e/support/env.ts`). Cada
 * teste cria as próprias crianças e o administrador as apaga no fim.
 */
test.describe.configure({ mode: 'serial' });

interface Me {
  id: string;
  name: string;
  teacherProfile: { id: string; club: { id: string; number: number } | null } | null;
  coordinatorProfile: { id: string; clubs: { id: string; number: number }[] } | null;
}

const ROLES = [
  { label: 'professor', email: TEACHER_EMAIL, password: TEACHER_PASSWORD },
  { label: 'coordenador', email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD },
] as const;

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
const SEARCH = 'Buscar por nome ou telefone do responsável…';

for (const role of ROLES) {
  test.describe(`Como ${role.label}`, () => {
    let admin: ApiClient;
    let scoped: ApiClient;
    let me: Me;
    let ownClubId = '';
    let otherClubId: string | null = null;
    let window: LaunchWindow;
    let page: Page;
    const seeded: SeededChild[] = [];

    /** Criança criada **pelo próprio papel**, dentro do clubinho dele. */
    const seedOwn = async (overrides: Record<string, unknown> = {}) => {
      const child = await seedChild(scoped, { clubId: ownClubId, ...overrides });
      seeded.push(child);
      return child;
    };

    test.beforeAll(async ({ browser, request }) => {
      const login = await request.post(`${API_URL}/auth/login`, {
        data: { email: role.email, password: role.password },
      });
      test.skip(!login.ok(), `usuário de automação (${role.label}) não existe neste banco`);

      admin = await ApiClient.login();
      scoped = await ApiClient.login(role.email, role.password);
      me = await scoped.get<Me>('/auth/me');

      const ownClubs = me.teacherProfile?.club
        ? [me.teacherProfile.club]
        : (me.coordinatorProfile?.clubs ?? []);
      test.skip(ownClubs.length === 0, `o ${role.label} de automação não tem clubinho neste banco`);
      ownClubId = ownClubs[0].id;

      window = await launchWindow(admin);
      const weekly = await admin.get<{ clubs: { clubId: string }[] }>('/statistics/attendance/week', {
        year: window.year ?? new Date().getFullYear(),
        week: window.currentWeek ?? 1,
        limit: 50,
      });
      const own = new Set(ownClubs.map((club) => club.id));
      otherClubId = weekly.clubs.find((club) => !own.has(club.clubId))?.clubId ?? null;

      page = await loginAs(browser, role.email, role.password);
    });

    test.afterEach(async () => {
      while (seeded.length) await removeChild(admin, seeded.pop());
    });

    test.afterAll(async () => {
      await page?.context().close();
      await scoped?.dispose();
      await admin?.dispose();
    });

    test('vê na lista a criança do próprio clubinho e não tem botão de excluir', async () => {
      const child = await seedOwn();
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);

      await expect(page.getByText(child.name)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Editar criança' })).toBeVisible();
      // Excluir é só do administrador, na tela e na API.
      await expect(page.getByRole('button', { name: 'Excluir criança' })).toHaveCount(0);
      const refused = await scoped.send('DELETE', `/children/${child.id}`);
      expect(refused.status).toBe(403);
      expect((await childInList(admin, child)).id).toBe(child.id);
    });

    test('a criança que ele cadastra fica com ele como autor', async () => {
      const child = await seedOwn();
      const saved = await admin.get<{ createdBy: { id: string; name: string } | null; club: { id: string } | null }>(
        `/children/${child.id}`,
      );

      expect(saved.createdBy).toEqual({ id: me.id, name: me.name });
      expect(saved.club?.id).toBe(ownClubId);
    });

    test('lança a pagela pela tela e fica registrado como quem lançou', async () => {
      test.skip(!window.open, `período letivo fechado hoje (${window.reason})`);
      const child = await seedOwn();
      await page.goto(`/area-das-criancas/${child.id}`);

      await expect(page.getByTestId('pagela-week-select')).toHaveValue(String(window.currentWeek));
      await page.getByRole('checkbox', { name: /Presença/ }).check();
      await page.getByRole('button', { name: /Salvar/ }).click();
      await expect(page.getByText('Pagela salva!')).toBeVisible();
      await expect(page.getByTestId('pagela-authorship')).toContainText(`Lançada por ${me.name}`);

      const [saved] = await pagelasOf(admin, child.id);
      expect(saved).toMatchObject({ year: window.year, week: window.currentWeek, present: true });
      expect(saved.createdBy).toEqual({ id: me.id, name: me.name });
      // O professor fica vinculado à pagela; o coordenador não tem perfil de professor.
      expect(saved.teacherProfileId).toBe(me.teacherProfile?.id ?? null);
    });

    test('edita a pagela pela tela sem perder quem lançou nem o professor', async () => {
      test.skip(!window.open, `período letivo fechado hoje (${window.reason})`);
      const child = await seedOwn();
      const created = await scoped.post<{ id: string; teacherProfileId: string | null }>(
        '/pagelas',
        pagelaBody(child.id, window, { teacherProfileId: me.teacherProfile?.id }),
      );
      // O administrador corrige a pagela: o autor e o professor continuam os mesmos.
      await admin.patch(`/pagelas/${created.id}`, { notes: 'Corrigida pela administração' });

      await page.goto(`/area-das-criancas/${child.id}`);
      await expect(page.getByText(/Editando/)).toBeVisible();
      await page.getByRole('checkbox', { name: /Fez meditação/ }).check();
      await page.getByRole('button', { name: /Salvar/ }).click();
      await expect(page.getByText('Pagela atualizada!')).toBeVisible();

      const [saved] = await pagelasOf(admin, child.id);
      expect(saved).toMatchObject({ didMeditation: true, notes: 'Corrigida pela administração' });
      expect(saved.createdBy?.id).toBe(me.id);
      expect(saved.updatedBy?.id).toBe(me.id);
      expect(saved.teacherProfileId).toBe(created.teacherProfileId);
    });

    test('registra a decisão pela tela e fica como quem registrou', async () => {
      const child = await seedOwn();
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);
      await expect(page.getByText(child.name)).toBeVisible();

      await page.getByRole('button', { name: 'Registrar decisão' }).click();
      const modal = page.getByTestId('pagela-teacher-decision-modal');
      await expect(modal).toBeVisible();
      await modal.getByRole('checkbox').check();
      await modal.getByRole('button', { name: 'Salvar' }).click();
      await expect(modal).toBeHidden();

      const [decision] = (await childInList(admin, child)).acceptedChrists;
      expect(decision.decision).toBe('ACCEPTED');
      expect(decision.createdBy).toEqual({ id: me.id, name: me.name });

      // E as regras valem para ele também.
      const second = await scoped.send('POST', '/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
      expect(second).toMatchObject({ status: 409, code: 'CHILD_7005' });
    });

    test('desativa a criança pela tela; depois não lança pagela nem decisão para ela', async () => {
      const child = await seedOwn();
      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}`);
      await expect(page.getByText(child.name)).toBeVisible();

      await page.getByRole('switch', { name: 'Desativar criança' }).click();
      await page.getByRole('dialog').getByRole('button', { name: /^Desativar/ }).click();
      await expect(page.getByText('Criança desativada com sucesso')).toBeVisible();
      expect((await childInList(admin, child)).isActive).toBe(false);

      const updated = await admin.get<{ updatedBy: { id: string } | null }>(`/children/${child.id}`);
      expect(updated.updatedBy?.id).toBe(me.id);

      const decision = await scoped.send('POST', '/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
      expect(decision).toMatchObject({ status: 409, code: 'CHILD_7003' });
      if (window.open) {
        const pagela = await scoped.send('POST', '/pagelas', pagelaBody(child.id, window));
        expect(pagela).toMatchObject({ status: 409, code: 'CHILD_7003' });
      }

      await page.goto(`/area-das-criancas/${child.id}`);
      await expect(page.getByTestId('pagela-child-inactive')).toBeVisible();
    });

    test('não alcança a criança de outro clubinho, nem pela tela nem pela API', async () => {
      test.skip(!otherClubId, 'não há outro clubinho ativo neste banco');
      const outsider = await seedChild(admin, { clubId: otherClubId });
      seeded.push(outsider);

      await page.goto(`/area-das-criancas?busca=${encodeURIComponent(outsider.name)}`);
      await expect(page.getByPlaceholder(SEARCH)).toHaveValue(outsider.name);
      await expect(page.getByText('Nenhuma criança encontrada')).toBeVisible();

      await page.goto(`/area-das-criancas/${outsider.id}`);
      await expect(page.getByRole('button', { name: /Salvar/ })).toHaveCount(0);

      expect((await scoped.send('GET', `/children/${outsider.id}`)).status).toBe(404);
      const decision = await scoped.send('POST', '/accepted-christs', { childId: outsider.id, decision: 'ACCEPTED' });
      expect(decision.status).toBe(404);
      if (window.open) {
        const pagela = await scoped.send('POST', '/pagelas', pagelaBody(outsider.id, window));
        expect(pagela).toMatchObject({ status: 403, code: 'CHILD_7002' });
      }
      const toggle = await scoped.send('PATCH', `/children/${outsider.id}/toggle-active`);
      expect(toggle.status).toBe(404);
    });

    test('não cadastra sem clubinho nem em clubinho que não é dele', async () => {
      const body = { name: 'E2E Recusada', birthDate: '2018-05-10', guardianName: 'Responsável E2E', gender: 'F' };

      const semClubinho = await scoped.send('POST', '/children', body);
      expect(semClubinho).toMatchObject({ status: 403, code: 'CHILD_7002' });

      test.skip(!otherClubId, 'não há outro clubinho ativo neste banco');
      const outroClubinho = await scoped.send('POST', '/children', { ...body, clubId: otherClubId });
      expect([403, 404]).toContain(outroClubinho.status);
    });

    test('não abre as estatísticas, que são só do administrador', async () => {
      expect((await scoped.send('GET', '/statistics/overview')).status).toBe(403);

      await page.goto('/adm/estatisticas');
      await expect(page.getByTestId('statistics-dashboard-navigation-tabs')).toHaveCount(0);
    });
  });
}
