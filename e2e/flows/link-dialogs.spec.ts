import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type User = { id: string; name: string; email: string };
type Club = { id: string; number: number };
type Teacher = { id: string; user: { id: string }; club: { id: string } | null };
type Coordinator = { id: string; user: { id: string }; clubs: { id: string }[] };
type Paged<T> = { items: T[] };

/**
 * Diálogos de vínculo (`LinkManagerDialog` por trás de `TeacherClubDialog` e
 * `CoordinatorClubsDialog`): o que já está vinculado, o que é oferecido, o que
 * fica bloqueado com motivo, e o botão que só libera quando a escolha muda.
 */
test.describe('Diálogos de vínculo', () => {
  let api: ApiClient;
  const suffix = uniqueSuffix();
  // Múltiplo de 10: os três clubinhos (base, base+1, base+2) compartilham o prefixo da busca.
  const base = 5000 + 10 * Math.floor(Math.random() * 90);
  let teacherUser: User;
  let freeTeacherUser: User;
  let coordUser: User;
  let otherCoordUser: User;
  let teacher: Teacher;
  let freeTeacher: Teacher;
  let coordinator: Coordinator;
  let otherCoordinator: Coordinator;
  let ownClub: Club;
  let freeClub: Club;
  let takenClub: Club;

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
    teacherUser = await person('teacher', 'ProfVinc');
    freeTeacherUser = await person('teacher', 'ProfLivre');
    coordUser = await person('coordinator', 'CoordVinc');
    otherCoordUser = await person('coordinator', 'CoordOutra');

    const findProfile = async <T extends { user: { id: string } }>(path: string, userId: string) => {
      const page = await api.get<Paged<T>>(path, { page: 1, limit: 50, searchString: suffix });
      const found = page.items.find((item) => item.user.id === userId);
      expect(found, `perfil não encontrado em ${path}`).toBeTruthy();
      return found as T;
    };
    teacher = await findProfile<Teacher>('/teacher-profiles', teacherUser.id);
    freeTeacher = await findProfile<Teacher>('/teacher-profiles', freeTeacherUser.id);
    coordinator = await findProfile<Coordinator>('/coordinator-profiles', coordUser.id);
    otherCoordinator = await findProfile<Coordinator>('/coordinator-profiles', otherCoordUser.id);

    const address = { district: 'Centro', city: 'Manaus', state: 'AM' };
    ownClub = await api.post<Club>('/clubs', { number: base, weekday: 'saturday', address, coordinatorProfileId: coordinator.id, teacherProfileIds: [teacher.id] });
    freeClub = await api.post<Club>('/clubs', { number: base + 1, weekday: 'monday', address: { ...address, district: 'Aleixo' } });
    takenClub = await api.post<Club>('/clubs', { number: base + 2, weekday: 'tuesday', address: { ...address, district: 'Cidade Nova' }, coordinatorProfileId: otherCoordinator.id });
  });

  test.afterAll(async () => {
    const quiet = (path: string) => api.delete(path).catch(() => undefined);
    for (const c of [takenClub, freeClub, ownClub]) if (c) await quiet(`/clubs/${c.id}`);
    for (const u of [otherCoordUser, coordUser, freeTeacherUser, teacherUser]) if (u) await quiet(`/users/${u.id}`);
    await api.dispose();
  });

  test.describe('Professor', () => {
    test('mostra o vínculo atual e só libera "Trocar" com outro clubinho', async ({ page }) => {
      await page.goto('/adm/professores');
      await searchListing(page, teacherUser.email);
      const card = cardOf(page, 'teachers', 'teacher-card', teacher.id);
      // Quem já tem clubinho vê "Trocar clubinho" no card.
      await card.getByRole('button', { name: 'Trocar clubinho', exact: true }).click();

      const dialog = page.getByTestId('teachers-teacher-club-dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(teacherUser.name);
      await expect(dialog).toContainText(`Clubinho ${base} · Sábado`);

      // O clubinho já vinculado vem selecionado; trocar por ele mesmo não é mudança.
      await expect(dialog.getByRole('button', { name: 'Trocar' })).toBeDisabled();

      await dialog.getByRole('combobox', { name: 'Clubinho' }).fill(String(freeClub.number));
      await page.getByRole('option', { name: new RegExp(`Clubinho ${freeClub.number}`) }).click();
      await expect(dialog.getByRole('button', { name: 'Trocar' })).toBeEnabled();

      // Fechar sem confirmar não muda nada na API.
      await dialog.getByRole('button', { name: 'Fechar' }).click();
      expect((await api.get<Teacher>(`/teacher-profiles/${teacher.id}`)).club?.id).toBe(ownClub.id);
    });

    test('para quem não tem clubinho, oferece "Vincular" e anuncia "Sem clubinho"', async ({ page }) => {
      await page.goto('/adm/professores');
      await searchListing(page, freeTeacherUser.email);
      const card = cardOf(page, 'teachers', 'teacher-card', freeTeacher.id);
      await card.getByRole('button', { name: 'Vincular clubinho', exact: true }).click();

      const dialog = page.getByTestId('teachers-teacher-club-dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('Sem clubinho');
      await expect(dialog.getByRole('button', { name: 'Vincular', exact: true })).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Trocar' })).toHaveCount(0);
    });
  });

  test.describe('Coordenador', () => {
    test('lista o que já é dele, não o oferece de novo e bloqueia clubinho de outro coordenador', async ({ page }) => {
      await page.goto('/adm/coordenadores');
      await searchListing(page, coordUser.email);
      const card = cardOf(page, 'coordinators', 'coordinator-card', coordinator.id);
      await card.getByRole('button', { name: 'Gerenciar clubinhos', exact: true }).click();

      const dialog = page.getByTestId('coordinators-coordinator-clubs-dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText(`Clubinho ${base} · Sábado`);
      await expect(dialog).toContainText('1 professor(es)');

      const search = dialog.getByRole('combobox', { name: 'Vincular clubinho' });
      await search.fill(String(base / 10));
      const listbox = page.getByRole('listbox');
      await expect(listbox).toBeVisible();
      // O próprio clubinho não é oferecido; o de outro coordenador aparece bloqueado e explicado.
      await expect(listbox.getByRole('option', { name: new RegExp(`Clubinho ${ownClub.number}\\b`) })).toHaveCount(0);
      const blocked = listbox.getByRole('option', { name: new RegExp(`Clubinho ${takenClub.number}\\b`) });
      await expect(blocked).toHaveAttribute('aria-disabled', 'true');
      await expect(blocked).toContainText('Já tem coordenador — remova-o de lá primeiro');
      await expect(dialog.getByRole('button', { name: 'Vincular', exact: true })).toBeDisabled();

      // O livre pode ser escolhido, e o botão libera.
      await listbox.getByRole('option', { name: new RegExp(`Clubinho ${freeClub.number}\\b`) }).click();
      await expect(dialog.getByRole('button', { name: 'Vincular', exact: true })).toBeEnabled();
      await dialog.getByRole('button', { name: 'Fechar' }).click();
      expect((await api.get<Coordinator>(`/coordinator-profiles/${coordinator.id}`)).clubs.map((c) => c.id)).toEqual([ownClub.id]);
    });

    test('o desvínculo pede confirmação antes de agir', async ({ page }) => {
      await page.goto('/adm/coordenadores');
      await searchListing(page, coordUser.email);
      const card = cardOf(page, 'coordinators', 'coordinator-card', coordinator.id);
      await card.getByRole('button', { name: 'Gerenciar clubinhos', exact: true }).click();

      const dialog = page.getByTestId('coordinators-coordinator-clubs-dialog');
      await dialog.getByRole('button', { name: `Desvincular Clubinho ${base} · Sábado` }).click();
      const confirm = page.getByRole('dialog').filter({ hasText: 'Remover' });
      await expect(confirm).toBeVisible();
      expect((await api.get<Coordinator>(`/coordinator-profiles/${coordinator.id}`)).clubs.map((c) => c.id)).toEqual([ownClub.id]);
      await confirm.getByRole('button', { name: 'Cancelar' }).click();
      await expect(confirm).toBeHidden();
      await expect(dialog).toContainText(`Clubinho ${base} · Sábado`);
    });
  });
});
