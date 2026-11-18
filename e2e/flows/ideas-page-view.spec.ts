import { expect, Page, test } from '@playwright/test';

import { MediaType } from '@/store/slices/types';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  IdeasPageSeed,
  linkMedia,
  PAGE_ENDPOINTS,
  pngFile,
  seedIdeasPage,
  uploadMedia,
} from '../support/pageSeeds';

/**
 * Página pública de uma coleção de ideias, do jeito que o professor a abre.
 *
 * A tela gastava a primeira dobra do celular com um banner animado, aninhava
 * quatro camadas de cartão antes do primeiro texto e mantinha um diálogo
 * montado por tipo de mídia de cada seção. O que se cobre aqui é o que sobrou:
 * cabeçalho com o que a página tem, uma seção por cartão, e uma galeria por
 * tipo de mídia aberta sob demanda.
 */

test.describe('Página pública de ideias', () => {
  let api: ApiClient;
  let page_: IdeasPageSeed;
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    page_ = await seedIdeasPage(
      api,
      `E2E Ideias Pública ${suffix}`,
      [
        {
          title: 'Brincadeira do encontro',
          medias: [
            linkMedia('Vídeo da dinâmica'),
            uploadMedia('foto', 'Foto da atividade', MediaType.IMAGE),
          ],
        },
        {
          title: 'Material de apoio',
          medias: [uploadMedia('doc', 'Roteiro em PDF', MediaType.DOCUMENT)],
        },
      ],
      { foto: pngFile('atividade.png'), doc: pngFile('roteiro.pdf') },
    );
  });

  test.afterAll(async () => {
    await api.delete(`${PAGE_ENDPOINTS.ideasPage}/${page_.id}`);
    await api.dispose();
  });

  /** Abre a página pelo endereço público, como um link compartilhado faria. */
  async function openPublicPage(page: Page) {
    await page.goto(`/${page_.route.path}`);
    const view = page.getByTestId('page-view-ideas-material-viewpage-ideas-page-view');
    await expect(view).toBeVisible();
    return view;
  }

  test('o cabeçalho diz o que a página reúne e as seções viram cartões', async ({ page }) => {
    const view = await openPublicPage(page);

    await expect(view.getByRole('heading', { name: `E2E Ideias Pública ${suffix}` })).toBeVisible();
    await expect(view.getByText('2 seções · 3 materiais')).toBeVisible();

    const sections = view.getByTestId('page-view-ideas-material-viewpage-media-section');
    await expect(sections).toHaveCount(2);

    // As seções são procuradas pelo título, e não pela posição: a API não as
    // ordena, e a ordem da resposta muda entre leituras.
    const brincadeira = sections.filter({ hasText: 'Brincadeira do encontro' });
    const apoio = sections.filter({ hasText: 'Material de apoio' });

    // Um item de cada tipo aparece no singular, e a contagem sai uma vez só.
    await expect(brincadeira.getByRole('button', { name: /^Vídeo 1$/ })).toBeVisible();
    await expect(brincadeira.getByRole('button', { name: /^Imagem 1$/ })).toBeVisible();
    await expect(brincadeira.getByRole('button', { name: /Documento/ })).toHaveCount(0);
    await expect(apoio.getByRole('button', { name: /^Documento 1$/ })).toBeVisible();
  });

  test('cada tipo abre a galeria daquela seção, e só ela', async ({ page }) => {
    const view = await openPublicPage(page);

    await view.getByRole('button', { name: /^Vídeo 1$/ }).click();
    const gallery = page.getByTestId('page-view-ideas-material-viewpage-ideas-gallery-dialog');
    await expect(gallery).toBeVisible();
    await expect(gallery.getByRole('heading', { name: 'Vídeos · 1' })).toBeVisible();
    await expect(gallery.getByText('Brincadeira do encontro')).toBeVisible();
    await expect(gallery.getByRole('heading', { name: 'Vídeo da dinâmica' })).toBeVisible();
    // O documento é de outra seção e não pode aparecer nesta galeria.
    await expect(gallery.getByRole('heading', { name: 'Roteiro em PDF' })).toHaveCount(0);

    await gallery.getByRole('button', { name: 'Fechar' }).click();
    await expect(gallery).toBeHidden();

    await view.getByRole('button', { name: /^Documento 1$/ }).click();
    await expect(gallery.getByRole('heading', { name: 'Documentos · 1' })).toBeVisible();
    await expect(gallery.getByRole('heading', { name: 'Roteiro em PDF' })).toBeVisible();
  });

  /** Quanto o conteúdo ocupa da largura da janela, em porcentagem. */
  async function contentWidthRatio(page: Page): Promise<number> {
    const box = await page.getByTestId('page-view-ideas-material-viewpage-content').boundingBox();
    const viewport = page.viewportSize();
    return box && viewport ? (box.width / viewport.width) * 100 : 0;
  }

  test('segue a largura padrão do site: 95% no desktop e 98% no celular', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openPublicPage(page);
    expect(await contentWidthRatio(page)).toBeCloseTo(95, 0);

    await page.setViewportSize({ width: 390, height: 844 });
    await openPublicPage(page);
    expect(await contentWidthRatio(page)).toBeCloseTo(98, 0);
  });

  test('no celular a página não rola para o lado e a galeria ocupa a tela', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const view = await openPublicPage(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'a página rolou na horizontal').toBeLessThanOrEqual(1);

    await view.getByRole('button', { name: /^Imagem 1$/ }).click();
    const gallery = page.getByTestId('page-view-ideas-material-viewpage-ideas-gallery-dialog');
    await expect(gallery).toBeVisible();

    const box = await gallery.boundingBox();
    expect(box?.width, 'a galeria não ocupou a largura do celular').toBeGreaterThan(380);
  });

  test('o administrador edita a página pelo cabeçalho, com o id na rota', async ({ page }) => {
    const view = await openPublicPage(page);

    await view.getByRole('button', { name: 'Editar' }).click();
    // Sem o id a edição abria uma rota que não existe.
    await expect(page).toHaveURL(new RegExp(`/adm/editar-pagina-ideias/${page_.id}$`));
    await expect(page.getByTestId('ideas-pages-ideas-page-form')).toBeVisible();
  });
});
