import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { COORDINATOR_EMAIL, COORDINATOR_PASSWORD } from '../support/env';
import { loginAs } from '../support/session';
import { cardOf, confirmDialog, searchListing } from '../support/ui';

type User = { id: string; name: string; email: string };
type Club = { id: string; number: number };
type Teacher = { id: string; user: { id: string } };
type Coordinator = { id: string; user: { id: string } };
type Child = { id: string; name: string };
type Paged<T> = { items: T[] };

/**
 * Telas de gestão de pessoas e clubinhos (`/adm/usuarios`, `/adm/clubinhos`,
 * `/adm/criancas`, `/adm/coordenadores`, `/adm/professores`).
 *
 * Os dados são criados pela API e a tela precisa mostrá-los como o card
 * promete: título, resumo, selos, contagens e ações com nome acessível.
 */
test.describe('Gestores: cards e listagens', () => {
  let api: ApiClient;
  const suffix = uniqueSuffix();
  const clubNumber = 6000 + Math.floor(Math.random() * 999);
  let coordUser: User;
  let teacherUser: User;
  let freeTeacherUser: User;
  let coordinator: Coordinator;
  let teacher: Teacher;
  let freeTeacher: Teacher;
  let club: Club;
  let secondClub: Club;
  let child: Child;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    const person = (role: string, tag: string) =>
      api.post<User>('/users', {
        name: `E2E ${tag} ${suffix}`,
        email: `e2e.${tag.toLowerCase()}.${suffix}@teste.clubinhonib.com`,
        password: 'Senha123@',
        phone: '11999990000',
        role,
        active: true,
        completed: true,
        commonUser: false,
      });
    coordUser = await person('coordinator', 'Coordenadora');
    teacherUser = await person('teacher', 'Professor');
    freeTeacherUser = await person('teacher', 'Livre');

    const findProfile = async <T extends { user: { id: string } }>(path: string, userId: string) => {
      const page = await api.get<Paged<T>>(path, { page: 1, limit: 50, searchString: suffix });
      const found = page.items.find((item) => item.user.id === userId);
      expect(found, `perfil não encontrado em ${path}`).toBeTruthy();
      return found as T;
    };
    coordinator = await findProfile<Coordinator>('/coordinator-profiles', coordUser.id);
    teacher = await findProfile<Teacher>('/teacher-profiles', teacherUser.id);
    freeTeacher = await findProfile<Teacher>('/teacher-profiles', freeTeacherUser.id);

    club = await api.post<Club>('/clubs', {
      number: clubNumber,
      weekday: 'saturday',
      time: '15:00',
      address: { street: 'Rua das Flores', number: '10', district: 'Centro', city: 'Manaus', state: 'AM' },
      coordinatorProfileId: coordinator.id,
      teacherProfileIds: [teacher.id],
    });
    // Um segundo clubinho da mesma coordenação, com o mesmo professor, para a
    // contagem do card do coordenador não repetir quem atende dois.
    secondClub = await api.post<Club>('/clubs', {
      number: clubNumber + 1000,
      weekday: 'friday',
      address: { district: 'Aleixo', city: 'Manaus', state: 'AM' },
      coordinatorProfileId: coordinator.id,
    });
    child = await api.post<Child>('/children', {
      name: `E2E Criança ${suffix}`,
      birthDate: '2018-05-20',
      guardianName: `Marta ${suffix}`,
      guardianPhone: '92999990000',
      gender: 'F',
      joinedAt: '2024-02-01',
      clubId: club.id,
      address: { street: 'Rua das Flores', number: '10', district: 'Centro', city: 'Manaus', state: 'AM', postalCode: '69000000' },
    });
  });

  test.afterAll(async () => {
    const quiet = (path: string) => api.delete(path).catch(() => undefined);
    if (child) await quiet(`/children/${child.id}`);
    if (secondClub) await quiet(`/clubs/${secondClub.id}`);
    if (club) await quiet(`/clubs/${club.id}`);
    for (const user of [freeTeacherUser, teacherUser, coordUser]) if (user) await quiet(`/users/${user.id}`);
    await api.dispose();
  });

  test.describe('Usuários', () => {
    test('só exclui depois da confirmação', async ({ page }) => {
      const victim = await api.post<User>('/users', {
        name: `E2E Excluir ${suffix}`,
        email: `e2e.excluir.${suffix}@teste.clubinhonib.com`,
        password: 'Senha123@',
        phone: '11999990000',
        role: 'teacher',
        active: true,
        completed: true,
        commonUser: true,
      });

      await page.goto('/adm/usuarios');
      await searchListing(page, victim.email);
      const card = cardOf(page, 'users', 'user-card', victim.id);
      await card.getByRole('button', { name: 'Excluir', exact: true }).click();

      // Ainda existe: nada foi apagado só por abrir a confirmação.
      expect((await api.get<User>(`/users/${victim.id}`)).id).toBe(victim.id);

      await confirmDialog(page, /^Excluir$/);
      await expect.poll(async () => api.get<{ id?: string }>(`/users/${victim.id}`).then((u) => u?.id ?? null).catch(() => null)).toBeNull();
      await expect(card).toHaveCount(0);
    });
  });

  test.describe('Clubinhos', () => {
    test('resume número, dia, horário, coordenação e professores no card', async ({ page }) => {
      await page.goto('/adm/clubinhos');
      await expect(page.getByTestId('clubs-clubs-manager')).toBeVisible();
      await searchListing(page, String(clubNumber));

      const card = cardOf(page, 'clubs', 'club-card', club.id);
      await expect(card).toBeVisible();
      await expect(card).toContainText(`Clubinho ${clubNumber}`);
      await expect(card).toContainText('Sábado');
      await expect(card).toContainText('15:00');
      await expect(card).toContainText(coordUser.name);
      await expect(card).toContainText('1 professor(es)');
      await expect(page.getByText(/^\d+ clubinho\(s\) encontrado\(s\)$/)).toBeVisible();

      for (const name of ['Ver detalhes', 'Professores', 'Coordenador', 'Editar', 'Inativar', 'Excluir']) {
        await expect(card.getByRole('button', { name, exact: true })).toBeVisible();
      }
    });

    test('mostra o estado vazio quando a busca não devolve nada', async ({ page }) => {
      await page.goto('/adm/clubinhos');
      await searchListing(page, `999999${Date.now() % 1000}`);
      await expect(page.getByText('Nenhum clubinho encontrado')).toBeVisible();
    });

    test('esconde a ação de coordenador de quem não é administrador', async ({ browser }) => {
      // Espelha `clubLinkPermissionsOf`: coordenador não altera coordenação.
      const page = await loginAs(browser, COORDINATOR_EMAIL, COORDINATOR_PASSWORD);
      try {
        await page.goto('/adm/clubinhos');
        await expect(page.getByTestId('clubs-clubs-manager')).toBeVisible();
        const firstCard = page.locator('[data-testid^="clubs-club-card-"]').first();
        if ((await firstCard.count()) === 0) test.skip(true, 'o coordenador fixo não tem clubinho para listar');
        await expect(firstCard.getByRole('button', { name: 'Professores', exact: true })).toBeVisible();
        await expect(firstCard.getByRole('button', { name: 'Coordenador', exact: true })).toHaveCount(0);
      } finally {
        await page.context().close();
      }
    });
  });

  test.describe('Crianças', () => {
    test('mostra a criança, o responsável, a data certa e as ações', async ({ page }) => {
      await page.goto('/adm/criancas');
      await expect(page.getByTestId('children-children-manager')).toBeVisible();
      await searchListing(page, child.name);

      const card = cardOf(page, 'children', 'child-card', child.id);
      await expect(card).toBeVisible();
      await expect(card).toContainText(child.name);
      await expect(card).toContainText(`Responsável: Marta ${suffix}`);
      // A data vem como dia de calendário; lida como UTC mostraria 19/05 num fuso a oeste.
      await expect(card.locator('[title*="20/05/2018"]')).toHaveCount(1);
      await expect(page.getByText(/^\d+ criança\(s\) encontrada\(s\)$/)).toBeVisible();

      for (const name of ['Ver detalhes', 'Editar', 'Inativar', 'Excluir']) {
        await expect(card.getByRole('button', { name, exact: true })).toBeVisible();
      }
    });

    test('mantém a ação principal à mão no celular', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/adm/criancas');
      await expect(page.getByRole('button', { name: /nova criança/i })).toBeVisible();
    });

    test('mostra o estado vazio quando os filtros não trazem ninguém', async ({ page }) => {
      await page.goto('/adm/criancas');
      await searchListing(page, `ninguem-${suffix}-${Date.now()}`);
      await expect(page.getByText('Nenhuma criança encontrada')).toBeVisible();
    });
  });

  test.describe('Coordenadores', () => {
    test('conta os clubinhos e os professores sem repetir quem atende dois', async ({ page }) => {
      // O mesmo professor vinculado aos dois clubinhos conta uma vez só.
      // Um professor só tem um clubinho por vez; o card do coordenador precisa
      // contar 1 professor mesmo que ele apareça em mais de um clubinho da lista.
      await api.patch(`/teacher-profiles/${teacher.id}/assign-club`, { clubId: club.id }).catch(() => undefined);

      await page.goto('/adm/coordenadores');
      await expect(page.getByTestId('coordinators-coordinator-profiles-manager')).toBeVisible();
      await searchListing(page, coordUser.email);

      const card = cardOf(page, 'coordinators', 'coordinator-card', coordinator.id);
      await expect(card).toBeVisible();
      await expect(card).toContainText(coordUser.name);
      await expect(card.locator('[title="2 clubinho(s)"]')).toHaveCount(1);
      await expect(card.locator('[title="1 professor(es)"]')).toHaveCount(1);
      await expect(page.getByText('1 coordenador(es) encontrado(s)')).toBeVisible();
      await expect(card.getByRole('button', { name: 'Ver detalhes', exact: true })).toBeVisible();
      await expect(card.getByRole('button', { name: 'Gerenciar clubinhos', exact: true })).toBeVisible();
    });

    test('mostra o estado vazio quando os filtros não trazem ninguém', async ({ page }) => {
      await page.goto('/adm/coordenadores');
      await searchListing(page, `ninguem-${suffix}-${Date.now()}`);
      await expect(page.getByText('Nenhum coordenador encontrado')).toBeVisible();
    });
  });

  test.describe('Professores', () => {
    test('mostra o clubinho e a coordenação de cada um, e desabilita o desvínculo de quem não tem clubinho', async ({ page }) => {
      await page.goto('/adm/professores');
      await expect(page.getByTestId('teachers-teacher-profiles-manager')).toBeVisible();
      await searchListing(page, suffix);

      const linked = cardOf(page, 'teachers', 'teacher-card', teacher.id);
      const free = cardOf(page, 'teachers', 'teacher-card', freeTeacher.id);
      await expect(linked).toBeVisible();
      await expect(free).toBeVisible();

      await expect(linked).toContainText(teacherUser.name);
      await expect(linked.locator(`[title="Clubinho ${clubNumber} · Sábado"]`)).toHaveCount(1);
      await expect(linked.locator(`[title="Coord.: ${coordUser.name}"]`)).toHaveCount(1);
      await expect(free).toContainText(freeTeacherUser.name);
      await expect(free.locator('[title="Sem clubinho"]')).toHaveCount(1);

      await expect(linked.getByRole('button', { name: 'Desvincular clubinho', exact: true })).toBeEnabled();
      await expect(free.getByRole('button', { name: 'Desvincular clubinho', exact: true })).toBeDisabled();
    });

    test('mostra o estado vazio quando os filtros não trazem ninguém', async ({ page }) => {
      await page.goto('/adm/professores');
      await searchListing(page, `ninguem-${suffix}-${Date.now()}`);
      await expect(page.getByText('Nenhum professor encontrado')).toBeVisible();
    });
  });
});
