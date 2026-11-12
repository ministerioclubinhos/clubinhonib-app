import { expect, Page, test } from '@playwright/test';

import { ApiClient } from '../support/api';
import { childInList, currentUser, removeChild, seedChild, type SeededChild } from '../support/children';

/**
 * Decisões no cartão da criança (`/area-das-criancas`), contra a API real.
 *
 * Aceitar é uma vez só; reconciliar exige ter aceitado; criança desativada não
 * recebe decisão; um registro lançado por engano pode ser excluído. Cada teste
 * cria a própria criança (sem clubinho, então nenhum aviso é enviado) e a apaga
 * no fim, levando as decisões junto.
 */
let api: ApiClient;
let child: SeededChild | undefined;

test.beforeAll(async () => {
  api = await ApiClient.login();
});

test.afterEach(async () => {
  await removeChild(api, child);
  child = undefined;
});

test.afterAll(async () => {
  await api.dispose();
});

async function openModal(page: Page, target: SeededChild) {
  await page.goto(`/area-das-criancas?busca=${encodeURIComponent(target.name)}`);
  await expect(page.getByText(target.name)).toBeVisible();
  await page.getByRole('button', { name: 'Registrar decisão' }).click();
  await expect(page.getByTestId('pagela-teacher-decision-modal')).toBeVisible();
}

const decisionsOf = async (target: SeededChild) =>
  (await childInList(api, target)).acceptedChrists.map((item) => item.decision).sort();

test.describe('Decisões da criança', () => {
  test('aceita pela tela, depois só oferece reconciliação, e o histórico aparece', async ({ page }) => {
    child = await seedChild(api);
    await openModal(page, child);

    await expect(page.getByText('A criança fez a decisão de aceitar Jesus?')).toBeVisible();
    await page.getByRole('checkbox').check();
    await page.getByLabel(/Observações/).fill('Depois da aula');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByTestId('pagela-teacher-decision-modal')).toBeHidden();
    expect(await decisionsOf(child)).toEqual(['ACCEPTED']);

    // Fica gravado quem registrou a decisão, e o histórico mostra o nome.
    const me = await currentUser(api);
    expect((await childInList(api, child)).acceptedChrists[0].createdBy).toEqual({ id: me.id, name: me.name });

    await page.getByRole('button', { name: 'Registrar decisão' }).click();
    await expect(page.getByText('A criança quer se reconciliar com Jesus?')).toBeVisible();
    await expect(page.getByTestId('decision-history')).toContainText('Aceitou Jesus');
    await expect(page.getByTestId('decision-history')).toContainText(`por ${me.name}`);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByTestId('pagela-teacher-decision-modal')).toBeHidden();
    expect(await decisionsOf(child)).toEqual(['ACCEPTED', 'RECONCILED']);
  });

  test('a API recusa segunda aceitação e reconciliação de quem nunca aceitou', async () => {
    child = await seedChild(api);

    const early = await api.send('POST', '/accepted-christs', { childId: child.id, decision: 'RECONCILED' });
    expect(early).toMatchObject({ status: 409, code: 'CHILD_7005' });

    const first = await api.send('POST', '/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
    expect(first.status).toBe(201);
    const second = await api.send('POST', '/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
    expect(second).toMatchObject({ status: 409, code: 'CHILD_7005' });

    const untyped = await api.send('POST', '/accepted-christs', { childId: child.id });
    expect(untyped.status).toBe(400);

    // Reconciliar pode se repetir.
    for (let round = 0; round < 2; round += 1) {
      const again = await api.send('POST', '/accepted-christs', { childId: child.id, decision: 'RECONCILED' });
      expect(again.status).toBe(201);
    }
    expect(await decisionsOf(child)).toEqual(['ACCEPTED', 'RECONCILED', 'RECONCILED']);
  });

  test('registro lançado por engano é excluído pela tela; a aceitação só sai depois das reconciliações', async ({ page }) => {
    child = await seedChild(api);
    const accepted = await api.post<{ id: string }>('/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
    await api.post('/accepted-christs', { childId: child.id, decision: 'RECONCILED' });

    const blocked = await api.send('DELETE', `/accepted-christs/${accepted.id}`);
    expect(blocked).toMatchObject({ status: 409, code: 'CHILD_7005' });

    await openModal(page, child);
    const history = page.getByTestId('decision-history');
    await history.getByRole('button', { name: /Excluir registro: Reconciliou-se/ }).click();
    // Só o clique de confirmação apaga.
    expect(await decisionsOf(child)).toEqual(['ACCEPTED', 'RECONCILED']);
    await history.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(history).not.toContainText('Reconciliou-se');
    expect(await decisionsOf(child)).toEqual(['ACCEPTED']);

    await history.getByRole('button', { name: /Excluir registro: Aceitou Jesus/ }).click();
    await history.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page.getByText('A criança fez a decisão de aceitar Jesus?')).toBeVisible();
    expect(await decisionsOf(child)).toEqual([]);
  });

  test('criança desativada não recebe decisão, na tela e na API', async ({ page }) => {
    child = await seedChild(api, { isActive: false });

    const refused = await api.send('POST', '/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });
    expect(refused).toMatchObject({ status: 409, code: 'CHILD_7003' });

    await openModal(page, child);
    await expect(page.getByTestId('decision-inactive')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  test('o filtro "Aceitaram Cristo" segue a mesma conta do cartão', async ({ page }) => {
    child = await seedChild(api);
    await api.post('/accepted-christs', { childId: child.id, decision: 'ACCEPTED' });

    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}&aceitaram=true`);
    await expect(page.getByText(child.name)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Registrar decisão' })).toBeVisible();

    await page.goto(`/area-das-criancas?busca=${encodeURIComponent(child.name)}&aceitaram=false`);
    await expect(page.getByText('Nenhuma criança encontrada')).toBeVisible();
  });
});
