import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

type User = { id: string; name: string; email: string };
type Club = { id: string; number: number };
type Teacher = { id: string; user: { id: string } };
type Paged<T> = { items: T[] };

/**
 * Seletor de professores do formulário de clubinho (`TeachersSelect`).
 *
 * Antes, quem já tinha turma sumia da lista. Agora todo mundo aparece, e a
 * opção diz de onde o professor viria; quem já é do clubinho editado não é
 * anunciado como "movido". O administrador alcança todos os clubinhos, então
 * nada fica bloqueado por coordenação.
 */
test.describe('Clubinho: seletor de professores', () => {
  let api: ApiClient;
  const suffix = uniqueSuffix();
  const base = 4000 + Math.floor(Math.random() * 900);
  let freeUser: User;
  let movedUser: User;
  let hereUser: User;
  let moved: Teacher;
  let here: Teacher;
  let free: Teacher;
  let edited: Club;
  let other: Club;

  test.beforeAll(async () => {
    api = await ApiClient.login();
    const person = (tag: string) =>
      api.post<User>('/users', {
        name: `E2E ${tag} ${suffix}`,
        email: `e2e.${tag.toLowerCase()}.${suffix}@teste.clubinhonib.com`,
        password: 'Senha123@',
        phone: '11999990000',
        role: 'teacher',
        active: true,
        completed: true,
        commonUser: false,
      });
    freeUser = await person('AnaLivre');
    movedUser = await person('BetoMovido');
    hereUser = await person('DoraDaqui');

    const profiles = await api.get<Paged<Teacher>>('/teacher-profiles', { page: 1, limit: 50, searchString: suffix });
    const byUser = (id: string) => profiles.items.find((t) => t.user.id === id) as Teacher;
    free = byUser(freeUser.id);
    moved = byUser(movedUser.id);
    here = byUser(hereUser.id);
    expect(free && moved && here, 'perfis de professor não encontrados').toBeTruthy();

    const address = { district: 'Centro', city: 'Manaus', state: 'AM' };
    edited = await api.post<Club>('/clubs', { number: base, weekday: 'saturday', address, teacherProfileIds: [here.id] });
    other = await api.post<Club>('/clubs', { number: base + 1, weekday: 'monday', address, teacherProfileIds: [moved.id] });
  });

  test.afterAll(async () => {
    const quiet = (path: string) => api.delete(path).catch(() => undefined);
    for (const c of [other, edited]) if (c) await quiet(`/clubs/${c.id}`);
    for (const u of [hereUser, movedUser, freeUser]) if (u) await quiet(`/users/${u.id}`);
    await api.dispose();
  });

  test('lista todo mundo e diz de onde cada professor viria', async ({ page }) => {
    await page.goto('/adm/clubinhos');
    await searchListing(page, String(base));
    const card = cardOf(page, 'clubs', 'club-card', edited.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar', exact: true }).click();

    const dialog = page.getByTestId('clubs-club-form-dialog');
    await expect(dialog).toBeVisible();
    // O `Select` não liga o rótulo ao controle; o seletor de domínio do campo é o ponto estável.
    await dialog.getByTestId('clubs-form-teachers-select').getByRole('combobox').click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await page.getByRole('textbox', { name: 'Buscar professor' }).fill(suffix);

    // Todo mundo aparece, inclusive quem já tem turma.
    for (const user of [freeUser, movedUser, hereUser]) {
      await expect(listbox.getByRole('option', { name: new RegExp(user.name) })).toBeVisible();
    }

    // Quem está em outro clubinho será movido; quem já é daqui, não.
    const movedOption = listbox.getByRole('option', { name: new RegExp(movedUser.name) });
    await expect(movedOption).toContainText(`No Clubinho ${other.number} — será movido`);
    await expect(movedOption).not.toHaveAttribute('aria-disabled', 'true');
    await expect(listbox.getByRole('option', { name: new RegExp(hereUser.name) })).not.toContainText('será movido');
    await expect(listbox.getByRole('option', { name: new RegExp(freeUser.name) })).not.toContainText('será movido');

    // O administrador alcança todos os clubinhos: nada é bloqueado por coordenação.
    await expect(listbox.getByText('Em um clubinho de outra coordenação')).toHaveCount(0);
  });
});
