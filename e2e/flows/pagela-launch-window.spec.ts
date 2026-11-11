import { expect, Page, Route, test } from '@playwright/test';

/**
 * Regra do período letivo no lançamento de pagelas
 * (`/area-das-criancas/:childId`).
 *
 * Pagela só se lança dentro do período letivo, e a semana é a letiva — contada
 * do início do período —, não a do calendário. A API é simulada: o que se
 * prova aqui é o que a tela mostra e o que ela envia.
 */
const CHILD_ID = '1754c8aa-497b-468f-a5c4-a8d8a8115913';
const PAGE_URL = `/area-das-criancas/${CHILD_ID}`;

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const child = {
  id: CHILD_ID,
  name: 'Ana Clara',
  guardianName: 'Maria',
  guardianPhone: '92999990000',
  gender: 'F',
  birthDate: '2018-05-10',
  joinedAt: '2026-03-02',
  isActive: true,
  club: null,
  address: null,
  createdAt: '2026-03-02T12:00:00.000Z',
  updatedAt: '2026-03-02T12:00:00.000Z',
};

const openWindow = {
  open: true,
  reason: null,
  message: null,
  today: '2026-03-18',
  year: 2026,
  currentWeek: 3,
  totalWeeks: 41,
  startDate: '2026-03-02',
  endDate: '2026-12-10',
};

const closedWindow = {
  open: false,
  reason: 'ENDED',
  message: 'O período letivo terminou em 10/12/2026. Não é mais possível lançar pagelas.',
  today: '2026-12-20',
  year: 2026,
  currentWeek: null,
  totalWeeks: null,
  startDate: '2026-03-02',
  endDate: '2026-12-10',
};

const existing = {
  id: 'pagela-2',
  childId: CHILD_ID,
  teacherProfileId: null,
  referenceDate: '2026-03-11',
  year: 2026,
  week: 2,
  present: true,
  didMeditation: true,
  recitedVerse: false,
  notes: 'Chegou cedo',
  createdAt: '2026-03-11T12:00:00.000Z',
  updatedAt: '2026-03-11T12:00:00.000Z',
};

async function mockApi(page: Page, window: unknown) {
  const sent: { method: string; body: Record<string, unknown> }[] = [];

  await page.route('**/children/simple*', (route) =>
    json(route, { data: [], meta: { totalItems: 0, totalPages: 1 } }),
  );
  await page.route(`**/children/${CHILD_ID}`, (route) => json(route, child));
  await page.route('**/pagelas/launch-window', (route) => json(route, window));
  await page.route('**/pagelas/paginated*', (route) => {
    const url = new URL(route.request().url());
    const week = url.searchParams.get('week');
    const data = week === null || week === '2' ? [existing] : [];
    return json(route, { data, total: data.length, page: 1, limit: 12, pageCount: 1 });
  });
  await page.route('**/pagelas', (route) => {
    sent.push({ method: route.request().method(), body: route.request().postDataJSON() });
    return json(route, { ...existing, id: 'pagela-3', week: 3 }, 201);
  });
  await page.route('**/pagelas/pagela-2', (route) => {
    sent.push({ method: route.request().method(), body: route.request().postDataJSON() });
    return json(route, existing);
  });

  return sent;
}

test.describe('Pagela: período letivo', () => {
  test('fora do período letivo mostra o motivo e não oferece o formulário', async ({ page }) => {
    await mockApi(page, closedWindow);
    await page.goto(PAGE_URL);

    await expect(page.getByTestId('pagela-launch-closed')).toContainText('terminou em 10/12/2026');
    await expect(page.getByRole('button', { name: /Salvar/ })).toHaveCount(0);
    await expect(page.getByTestId('pagela-week-select')).toHaveCount(0);
  });

  test('dentro do período lança na semana letiva atual, não na do calendário', async ({ page }) => {
    const sent = await mockApi(page, openWindow);
    await page.goto(PAGE_URL);

    // 18/03/2026 é a semana 12 do calendário, mas a semana letiva 3.
    await expect(page.getByTestId('pagela-week-select')).toHaveValue('3');
    await page.getByRole('button', { name: /Salvar/ }).click();

    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0].method).toBe('POST');
    expect(sent[0].body).toMatchObject({
      childId: CHILD_ID,
      year: 2026,
      week: 3,
      referenceDate: '2026-03-18',
    });
  });

  test('semana que já tem pagela vira edição e não reenvia data nem professor', async ({ page }) => {
    const sent = await mockApi(page, openWindow);
    await page.goto(PAGE_URL);

    await page.getByRole('combobox', { name: /Semana/ }).click();
    await page.getByRole('option', { name: 'Semana 2' }).click();

    await expect(page.getByText(/Editando/)).toBeVisible();
    await expect(page.getByLabel('Observações')).toHaveValue('Chegou cedo');
    await page.getByRole('button', { name: /Salvar/ }).click();

    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0].method).toBe('PATCH');
    expect(Object.keys(sent[0].body).sort()).toEqual([
      'didMeditation',
      'notes',
      'present',
      'recitedVerse',
    ]);
  });

  test('recusa da API aparece no formulário em vez de sumir', async ({ page }) => {
    await mockApi(page, openWindow);
    await page.route('**/pagelas', (route) =>
      json(
        route,
        {
          success: false,
          error: {
            code: 'VAL_4007',
            message: 'O período letivo terminou em 10/12/2026. Não é mais possível lançar pagelas.',
          },
        },
        400,
      ),
    );
    await page.goto(PAGE_URL);

    await page.getByRole('button', { name: /Salvar/ }).click();

    await expect(page.getByTestId('pagela-save-error')).toContainText('Não é mais possível lançar pagelas');
  });
});

test.describe('Pagela: criança desativada', () => {
  test('não oferece o formulário e explica o motivo', async ({ page }) => {
    await mockApi(page, openWindow);
    await page.route(`**/children/${CHILD_ID}`, (route) => json(route, { ...child, isActive: false }));
    await page.goto(PAGE_URL);

    await expect(page.getByTestId('pagela-child-inactive')).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvar/ })).toHaveCount(0);
  });
});
