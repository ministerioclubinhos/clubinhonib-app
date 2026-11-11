import { expect, Page, Route, test } from '@playwright/test';

/**
 * Decisões no cartão da criança (`/area-das-criancas`).
 *
 * Aceitar é uma vez só; reconciliar exige ter aceitado; criança desativada não
 * recebe decisão; um registro lançado por engano pode ser excluído. A API é
 * simulada: aqui se prova o que a tela oferece e envia.
 */
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const CHILD_ID = '00000000-0000-4000-8000-000000000001';
const DECISION_ID = '00000000-0000-4000-8000-0000000000aa';

const child = (overrides: Record<string, unknown> = {}) => ({
  id: CHILD_ID,
  name: 'Ana Clara',
  guardianName: 'Maria',
  guardianPhone: '92999990000',
  gender: 'F',
  clubId: null,
  isActive: true,
  acceptedChrists: [],
  ...overrides,
});

const accepted = {
  id: DECISION_ID,
  decision: 'ACCEPTED',
  createdAt: '2026-05-10T12:00:00.000Z',
  updatedAt: '2026-05-10T12:00:00.000Z',
};

async function mockList(page: Page, item: unknown) {
  await page.route('**/children/simple*', (route) =>
    json(route, { data: [item], meta: { totalItems: 1, totalPages: 1 } }),
  );
}

const openModal = async (page: Page) => {
  await page.goto('/area-das-criancas');
  await page.getByRole('button', { name: 'Registrar decisão' }).click();
  await expect(page.getByTestId('pagela-teacher-decision-modal')).toBeVisible();
};

test.describe('Decisões da criança', () => {
  test('quem nunca aceitou registra aceitação', async ({ page }) => {
    await mockList(page, child());
    const sent: Record<string, unknown>[] = [];
    await page.route('**/accepted-christs', (route) => {
      sent.push(route.request().postDataJSON());
      return json(route, { ...accepted, childId: CHILD_ID, notes: null }, 201);
    });
    await openModal(page);

    await expect(page.getByText('A criança fez a decisão de aceitar Jesus?')).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0]).toMatchObject({ childId: CHILD_ID, decision: 'ACCEPTED' });
  });

  test('quem já aceitou só registra reconciliação e vê o histórico', async ({ page }) => {
    await mockList(page, child({ acceptedChrists: [accepted] }));
    const sent: Record<string, unknown>[] = [];
    await page.route('**/accepted-christs', (route) => {
      sent.push(route.request().postDataJSON());
      return json(route, { ...accepted, decision: 'RECONCILED', childId: CHILD_ID, notes: null }, 201);
    });
    await openModal(page);

    await expect(page.getByText('A criança quer se reconciliar com Jesus?')).toBeVisible();
    await expect(page.getByTestId('decision-history')).toContainText('Aceitou Jesus');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect.poll(() => sent.length).toBe(1);
    expect(sent[0]).toMatchObject({ decision: 'RECONCILED' });
  });

  test('registro lançado por engano pode ser excluído, com confirmação', async ({ page }) => {
    await mockList(page, child({ acceptedChrists: [accepted] }));
    const deleted: string[] = [];
    await page.route(`**/accepted-christs/${DECISION_ID}`, (route) => {
      deleted.push(route.request().method());
      return json(route, { message: 'Decisão excluída com sucesso' });
    });
    await openModal(page);

    await page.getByRole('button', { name: /Excluir registro: Aceitou Jesus/ }).click();
    expect(deleted).toHaveLength(0);
    await page.getByRole('button', { name: 'Excluir', exact: true }).click();

    await expect.poll(() => deleted).toEqual(['DELETE']);
  });

  test('recusa da API aparece no modal', async ({ page }) => {
    await mockList(page, child());
    await page.route('**/accepted-christs', (route) =>
      json(
        route,
        {
          success: false,
          error: {
            code: 'CHILD_7005',
            message: 'Esta criança já tem a decisão de aceitar Jesus registrada. Registre uma reconciliação.',
          },
        },
        409,
      ),
    );
    await openModal(page);

    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByTestId('decision-error')).toContainText('já tem a decisão de aceitar Jesus');
  });

  test('criança desativada não recebe decisão', async ({ page }) => {
    await mockList(page, child({ isActive: false }));
    await openModal(page);

    await expect(page.getByTestId('decision-inactive')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });
});
