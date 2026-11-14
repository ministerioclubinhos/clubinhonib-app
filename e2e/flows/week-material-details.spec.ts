import { expect, Page, test } from '@playwright/test';

import { MediaType } from '@/store/slices/types';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  linkMedia,
  PAGE_ENDPOINTS,
  pngFile,
  seedWeekMaterial,
  uploadMedia,
  WeekMaterialSeed,
} from '../support/pageSeeds';
import { cardOf, searchListing } from '../support/ui';

/**
 * Detalhes de uma página de materiais semanais, abertos pela listagem.
 *
 * O diálogo empilhava vídeos, documentos, imagens e áudios um abaixo do outro,
 * com a URL crua de cada mídia — numa página cheia, uma rolagem em que nada era
 * encontrável. Agora cada tipo é uma aba, e a mídia mostra o que serve a quem
 * administra: se é arquivo ou link, o peso, e as ações de abrir e copiar.
 */

const LISTING_ROUTE = '/adm/paginas-materiais-semanais';

/** Abre os detalhes pelo botão do card. */
async function openDetails(page: Page, id: string, suffix: string) {
  await page.goto(LISTING_ROUTE);
  await searchListing(page, suffix);
  const card = cardOf(page, 'week-materials', 'week-material-list-card', id);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Detalhes', exact: true }).click();
  return page.getByTestId('week-materials-week-material-details-modal');
}

test.describe('Materiais semanais: detalhes da página', () => {
  let api: ApiClient;
  const created: string[] = [];
  const suffix = uniqueSuffix();
  let material: WeekMaterialSeed;
  let vazia: WeekMaterialSeed;

  test.beforeAll(async () => {
    api = await ApiClient.login();

    material = await seedWeekMaterial(
      api,
      `E2E Detalhes ${suffix}`,
      {
        videos: [linkMedia('Aula da semana')],
        documents: [uploadMedia('doc', 'Roteiro do encontro', MediaType.DOCUMENT)],
      },
      { doc: pngFile('roteiro.pdf') },
    );
    created.push(material.id);

    vazia = await seedWeekMaterial(api, `E2E Detalhes Vazia ${suffix}`, {}, {});
    created.push(vazia.id);
  });

  test.afterAll(async () => {
    for (const id of created.reverse()) await api.delete(`${PAGE_ENDPOINTS.weekMaterial}/${id}`);
    await api.dispose();
  });

  test('mostra o cabeçalho, o resumo e uma aba por tipo com conteúdo', async ({ page }) => {
    const modal = await openDetails(page, material.id, `E2E Detalhes ${suffix}`);
    await expect(modal).toBeVisible();

    await expect(modal.getByRole('heading', { name: `E2E Detalhes ${suffix}` })).toBeVisible();
    await expect(modal.getByText('Tema da semana')).toBeVisible();
    await expect(modal.getByText('2 materiais')).toBeVisible();

    // Só os tipos que a página tem viram aba.
    await expect(modal.getByRole('tab', { name: 'Vídeos: 1' })).toBeVisible();
    await expect(modal.getByRole('tab', { name: 'Documentos: 1' })).toBeVisible();
    await expect(modal.getByRole('tab', { name: /Imagens/ })).toHaveCount(0);
    await expect(modal.getByRole('tab', { name: /Áudios/ })).toHaveCount(0);
  });

  test('cada mídia diz se é arquivo ou link, e abre no endereço dela', async ({ page }) => {
    const modal = await openDetails(page, material.id, `E2E Detalhes ${suffix}`);

    const video = material.videos[0];
    const documento = material.documents[0];

    const videoRow = modal.getByTestId(`week-materials-week-material-media-${video.id}`);
    await expect(videoRow).toContainText('Aula da semana');
    await expect(videoRow).toContainText('Link · YouTube');
    // A URL crua saiu da tela; quem precisa dela usa "Abrir" ou "Copiar".
    await expect(videoRow).not.toContainText(video.url);
    await expect(videoRow.getByRole('link', { name: 'Abrir Aula da semana' })).toHaveAttribute('href', video.url);

    await modal.getByRole('tab', { name: 'Documentos: 1' }).click();
    const docRow = modal.getByTestId(`week-materials-week-material-media-${documento.id}`);
    await expect(docRow).toContainText('Roteiro do encontro');
    await expect(docRow).toContainText('Arquivo enviado');
    await expect(docRow.getByRole('link', { name: 'Abrir Roteiro do encontro' })).toHaveAttribute('href', documento.url);
  });

  test('copiar o link avisa que copiou', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const modal = await openDetails(page, material.id, `E2E Detalhes ${suffix}`);

    await modal.getByRole('button', { name: 'Copiar link de Aula da semana' }).click();
    await expect(modal.getByText('Link copiado.')).toBeVisible();

    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiado).toBe(material.videos[0].url);
  });

  test('"Editar" leva ao formulário e "Abrir página" leva à página pública', async ({ page }) => {
    const modal = await openDetails(page, material.id, `E2E Detalhes ${suffix}`);
    await modal.getByRole('button', { name: 'Editar' }).click();
    await expect(page).toHaveURL(new RegExp(`/adm/editar-pagina-semana/${material.id}$`));

    const reaberto = await openDetails(page, material.id, `E2E Detalhes ${suffix}`);
    await reaberto.getByRole('button', { name: 'Abrir página' }).click();
    await expect(page).not.toHaveURL(new RegExp(LISTING_ROUTE));
    await expect(page.getByRole('heading', { name: `E2E Detalhes ${suffix}` }).first()).toBeVisible();
  });

  test('página sem material nenhum explica o vazio, sem abas', async ({ page }) => {
    const modal = await openDetails(page, vazia.id, `E2E Detalhes Vazia ${suffix}`);

    await expect(modal.getByText('Sem material')).toBeVisible();
    await expect(modal.getByText(/Nenhum material nesta página/)).toBeVisible();
    await expect(modal.getByRole('tab')).toHaveCount(0);
  });

  test('o diálogo abre no clique e mostra esqueleto enquanto a página carrega', async ({ page }) => {
    await page.goto(LISTING_ROUTE);
    await searchListing(page, `E2E Detalhes ${suffix}`);

    // A resposta atrasada torna visível a janela em que o card antes ficava
    // sem reação nenhuma.
    await page.route(`**${PAGE_ENDPOINTS.weekMaterial}/${material.id}`, async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.continue();
    });

    const card = cardOf(page, 'week-materials', 'week-material-list-card', material.id);
    await card.getByRole('button', { name: 'Detalhes', exact: true }).click();

    const modal = page.getByTestId('week-materials-week-material-details-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('week-materials-week-material-details-loading')).toBeVisible();
    await expect(modal.getByRole('heading', { name: `E2E Detalhes ${suffix}` })).toBeVisible();
  });
});
