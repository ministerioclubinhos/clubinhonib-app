import { expect, Page, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  linkMedia,
  PAGE_ENDPOINTS,
  seedWeekMaterial,
  WeekMaterialSeed,
} from '../support/pageSeeds';
import { cardOf, replaceText, searchListing } from '../support/ui';

/**
 * As três proteções da tela de edição: o erro que a API devolveu chega ao
 * administrador, sair no meio da edição pergunta antes, e o botão de excluir
 * não aceita um segundo clique enquanto a exclusão acontece.
 *
 * Todas nasceram de falhas silenciosas — um "erro ao salvar" que não dizia
 * nada, um rascunho perdido ao clicar no menu, um DELETE repetido que
 * respondia 404 e mostrava erro de uma operação que tinha dado certo.
 */

const EDIT_ROUTE = '/adm/editar-pagina-semana';
const LISTING_ROUTE = '/adm/paginas-materiais-semanais';

/** O campo de título da página de materiais. */
function titleField(page: Page) {
  return page
    .getByTestId('week-materials-week-material-page-form')
    .getByRole('textbox', { name: /^Semana( \*)?$/ });
}

/** Abre a seção do menu e clica no item que leva à listagem de materiais. */
async function clickSidebarMaterials(page: Page): Promise<void> {
  const layout = page.getByTestId('adm-admin-layout');
  const section = layout.getByRole('button', { name: 'Materiais', exact: true });
  if ((await section.getAttribute('aria-expanded')) !== 'true') await section.click();
  await page.getByTestId('adm-admin-sidebar').getByRole('button', { name: 'Materiais semanais' }).click();
}

test.describe('Edição de página: erro visível, saída avisada e exclusão sem clique duplo', () => {
  let api: ApiClient;
  const created: string[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.afterAll(async () => {
    for (const id of created.reverse()) await api.delete(`${PAGE_ENDPOINTS.weekMaterial}/${id}`);
    await api.dispose();
  });

  /** Uma página de materiais só com mídia por link: nada sobe para o S3. */
  async function seedPage(): Promise<WeekMaterialSeed> {
    const material = await seedWeekMaterial(
      api,
      `E2E Segurança ${uniqueSuffix()}`,
      { videos: [linkMedia('Vídeo por link')] },
      {},
    );
    created.push(material.id);
    return material;
  }

  test('o salvamento mostra a mensagem que a API devolveu, e não um texto fixo', async ({ page }) => {
    const material = await seedPage();
    const recusa = 'Arquivo ausente para a mídia "Vídeo por link".';

    await page.route(`**${PAGE_ENDPOINTS.weekMaterial}/*`, async (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: { code: 'CONTENT_5002', message: recusa } }),
      });
    });

    await page.goto(`${EDIT_ROUTE}/${material.id}`);
    await replaceText(titleField(page), `${material.title} editada`);
    await page.getByRole('button', { name: 'Salvar Página' }).click();

    // O aviso sai duas vezes: no snackbar do formulário e no tratador global
    // de erros. Qualquer um dos dois prova que a mensagem chegou inteira.
    await expect(page.getByRole('alert').filter({ hasText: recusa }).first()).toBeVisible();
  });

  test('sair pelo menu com edição pendente pergunta antes, e "continuar editando" preserva o rascunho', async ({ page }) => {
    const material = await seedPage();
    const rascunho = `${material.title} rascunho`;

    await page.goto(`${EDIT_ROUTE}/${material.id}`);
    await replaceText(titleField(page), rascunho);

    await clickSidebarMaterials(page);
    const dialog = page.getByTestId('modal-unsaved-changes-dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Continuar editando' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${EDIT_ROUTE}/${material.id}$`));
    await expect(titleField(page)).toHaveValue(rascunho);

    await clickSidebarMaterials(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Sair sem salvar' }).click();
    await expect(page).toHaveURL(new RegExp(`${LISTING_ROUTE}$`));

    // O rascunho foi descartado de propósito: a página segue como estava.
    expect((await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).title).toBe(material.title);
  });

  test('o botão "Voltar para a lista" sai direto quando não há o que perder', async ({ page }) => {
    const material = await seedPage();

    await page.goto(`${EDIT_ROUTE}/${material.id}`);
    await expect(titleField(page)).toHaveValue(material.title);

    await page.getByRole('button', { name: 'Voltar para a lista' }).click();
    await expect(page.getByTestId('modal-unsaved-changes-dialog')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${LISTING_ROUTE}$`));
  });

  test('o botão "Voltar para a lista" confirma quando há alteração não salva', async ({ page }) => {
    const material = await seedPage();

    await page.goto(`${EDIT_ROUTE}/${material.id}`);
    await replaceText(titleField(page), `${material.title} mexida`);
    await page.getByRole('button', { name: 'Voltar para a lista' }).click();

    const dialog = page.getByTestId('modal-unsaved-changes-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Sair sem salvar' }).click();
    await expect(page).toHaveURL(new RegExp(`${LISTING_ROUTE}$`));
  });

  test('o botão de excluir trava enquanto a exclusão acontece', async ({ page }) => {
    const material = await seedPage();

    // A exclusão real leva segundos (apaga os arquivos no S3 antes de
    // responder); o atraso aqui reproduz essa janela de forma previsível.
    await page.route(`**${PAGE_ENDPOINTS.weekMaterial}/${material.id}`, async (route) => {
      if (route.request().method() !== 'DELETE') return route.fallback();
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      await route.continue();
    });

    await page.goto(LISTING_ROUTE);
    await searchListing(page, material.title);
    const card = cardOf(page, 'week-materials', 'week-material-list-card', material.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Excluir', exact: true }).click();

    const dialog = page.getByTestId('modal-delete-confirm-dialog');
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();

    const excluindo = dialog.getByRole('button', { name: 'Excluindo...' });
    await expect(excluindo).toBeVisible();
    await expect(excluindo).toBeDisabled();

    await expect(dialog).toBeHidden({ timeout: 30_000 });
    await expect(card).toHaveCount(0);
    expect(await api.statusOf(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).toBe(404);
  });
});
