import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';

type Club = { id: string; number: number; weekday: string };
type Child = { id: string; name: string };
type Period = { id: string; year: number; startDate: string; endDate: string } | null;
type Pagela = { id: string; present: boolean; didMeditation: boolean; recitedVerse: boolean; notes: string | null; week: number; year: number };

/** Edição de pagela na área das crianças (`/area-das-criancas/:childId`). */
test.describe('Pagelas: edição', () => {
  let api: ApiClient;
  let club: Club;
  let child: Child;
  let pagela: Pagela;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    const year = new Date().getFullYear();
    let period = await api.get<Period>(`/club-control/periods/${year}`);
    if (!period?.id) period = await api.post<Period>('/club-control/periods', { year, startDate: `${year}-02-02`, endDate: `${year}-12-15`, description: 'E2E' });
    club = await api.post<Club>('/clubs', { number: 4000 + Math.floor(Math.random() * 999), weekday: 'saturday', address: { district: 'Centro', city: 'Campinas', state: 'SP' } });
    child = await api.post<Child>('/children', { name: `E2E Pagela ${suffix}`, birthDate: '2016-01-10', guardianName: 'Resp', gender: 'M', clubId: club.id, joinedAt: period!.startDate });
    // Segunda semana do período: uma data com certeza dentro dele.
    const start = new Date(`${period!.startDate}T12:00:00`);
    start.setDate(start.getDate() + 10);
    const referenceDate = start.toISOString().slice(0, 10);
    pagela = await api.post<Pagela>('/pagelas', { childId: child.id, referenceDate, present: false, didMeditation: false, recitedVerse: false, notes: 'Original' });
  });

  test.afterAll(async () => {
    await api.delete(`/children/${child.id}`);
    await api.delete(`/clubs/${club.id}`);
    await api.dispose();
  });

  test('edita presença, meditação, versículo e observação', async ({ page }) => {
    await page.goto(`/area-das-criancas/${child.id}`);
    await expect(page.getByTestId('pagela-teacher-child-pagelas-page')).toBeVisible();
    const card = page.getByTestId('pagela-teacher-pagela-card').filter({ hasText: `${pagela.week}` }).first();
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar pagela' }).click();

    const form = page.getByTestId('pagela-teacher-pagela-quick-form');
    await expect(form).toBeVisible();
    await form.getByLabel('Presença').check();
    await form.getByLabel('Fez meditação').check();
    await form.getByLabel('Recitou o versículo').check();
    await form.getByLabel('Observações').fill('Editada pelo Playwright');
    await form.getByRole('button', { name: 'Salvar' }).click();

    await expect.poll(async () => api.get<Pagela>(`/pagelas/${pagela.id}`)).toMatchObject({ present: true, didMeditation: true, recitedVerse: true, notes: 'Editada pelo Playwright' });
  });
});
