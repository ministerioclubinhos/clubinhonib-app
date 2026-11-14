import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, confirmDialog, searchListing } from '../support/ui';

type User = { id: string; email: string };
type Teacher = { id: string; club: { id: string; number: number } | null; user: { id: string } };
type Page = { items: Teacher[] };
type Club = { id: string; number: number };

/** Vínculo do professor ao clubinho pela tela (`/adm/professores`). */
test.describe('Professores: vínculo com clubinho', () => {
  let api: ApiClient;
  let user: User;
  let teacher: Teacher;
  let club: Club;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    user = await api.post<User>('/users', { name: `E2E Prof ${suffix}`, email: `e2e.prof.${suffix}@teste.clubinhonib.com`, password: 'Senha123@', phone: '11999990000', role: 'teacher', active: true, completed: true });
    club = await api.post<Club>('/clubs', { number: 7000 + Math.floor(Math.random() * 999), weekday: 'monday', address: { district: 'Centro', city: 'Campinas', state: 'SP' } });
    const page = await api.get<Page>('/teacher-profiles', { searchString: user.email, page: 1, limit: 20 });
    teacher = page.items.find((t) => t.user.id === user.id) as Teacher;
    expect(teacher, 'perfil de professor não encontrado').toBeTruthy();
  });

  test.afterAll(async () => {
    await api.delete(`/clubs/${club.id}`);
    await api.delete(`/users/${user.id}`);
    await api.dispose();
  });

  test('vincula pelo diálogo, depois desvincula', async ({ page }) => {
    await page.goto('/adm/professores');
    await expect(page.getByTestId('teachers-teacher-profiles-manager')).toBeVisible();
    await searchListing(page, user.email);
    const card = cardOf(page, 'teachers', 'teacher-card', teacher.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Vincular clubinho', exact: true }).click();

    const dialog = page.getByTestId('teachers-teacher-club-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('combobox', { name: 'Clubinho' }).fill(String(club.number));
    await page.getByRole('option', { name: new RegExp(`Clubinho ${club.number}`) }).click();
    await dialog.getByRole('button', { name: 'Vincular' }).click();

    await expect.poll(async () => (await api.get<Teacher>(`/teacher-profiles/${teacher.id}`)).club?.id).toBe(club.id);

    // O diálogo fecha ao vincular; o desvínculo é uma ação do card, com confirmação.
    await expect(dialog).toBeHidden();
    await card.getByRole('button', { name: 'Desvincular clubinho', exact: true }).click();
    await confirmDialog(page, 'Desvincular');
    await expect.poll(async () => (await api.get<Teacher>(`/teacher-profiles/${teacher.id}`)).club).toBeNull();
  });
});
