import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type User = { id: string; email: string };
type Coordinator = { id: string; clubs: { id: string; number: number }[]; user: { id: string } };
type Page = { items: Coordinator[] };
type Club = { id: string; number: number };

/** Clubinhos do coordenador pela tela (`/adm/coordenadores`). */
test.describe('Coordenadores: clubinhos', () => {
  let api: ApiClient;
  let user: User;
  let coordinator: Coordinator;
  let club: Club;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    user = await api.post<User>('/users', { name: `E2E Coord ${suffix}`, email: `e2e.coord.${suffix}@teste.clubinhonib.com`, password: 'Senha123@', phone: '11999990000', role: 'coordinator', active: true, completed: true });
    club = await api.post<Club>('/clubs', { number: 8000 + Math.floor(Math.random() * 999), weekday: 'tuesday', address: { district: 'Centro', city: 'Campinas', state: 'SP' } });
    const page = await api.get<Page>('/coordinator-profiles', { searchString: user.email, page: 1, limit: 20 });
    coordinator = page.items.find((c) => c.user.id === user.id) as Coordinator;
    expect(coordinator, 'perfil de coordenador não encontrado').toBeTruthy();
  });

  test.afterAll(async () => {
    await api.delete(`/clubs/${club.id}`);
    await api.delete(`/users/${user.id}`);
    await api.dispose();
  });

  test('vincula um clubinho livre e depois o desvincula', async ({ page }) => {
    await page.goto('/adm/coordenadores');
    await expect(page.getByTestId('coordinators-coordinator-profiles-manager')).toBeVisible();
    await searchListing(page, user.email);
    const card = cardOf(page, 'coordinators', 'coordinator-card', coordinator.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Gerenciar clubinhos' }).click();

    const dialog = page.getByTestId('coordinators-coordinator-clubs-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Vincular clubinho').fill(String(club.number));
    await page.getByRole('option', { name: new RegExp(`Clubinho ${club.number}`) }).click();
    await dialog.getByRole('button', { name: 'Vincular' }).click();
    await expect.poll(async () => (await api.get<Coordinator>(`/coordinator-profiles/${coordinator.id}`)).clubs.map((c) => c.id)).toContain(club.id);

    await dialog.getByRole('button', { name: new RegExp(`Desvincular .*${club.number}`) }).click();
    // A remoção pede confirmação num diálogo próprio.
    const confirm = page.getByRole('dialog').filter({ hasText: 'Remover' });
    await confirm.getByRole('button', { name: 'Desvincular' }).click();
    await expect.poll(async () => (await api.get<Coordinator>(`/coordinator-profiles/${coordinator.id}`)).clubs.map((c) => c.id)).not.toContain(club.id);
  });
});
