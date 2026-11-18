import { expect, Locator, Page, test } from '@playwright/test';

import { MediaType } from '@/store/slices/types';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  IdeasPageSeed,
  ImagePageSeed,
  linkMedia,
  PAGE_ENDPOINTS,
  pngFile,
  seedIdeasPage,
  seedImagePage,
  seedVideoPage,
  seedWeekMaterial,
  uploadedUrls,
  uploadMedia,
  VideoPageSeed,
} from '../support/pageSeeds';
import { expectS3ObjectGone } from '../support/s3';
import { cardOf, searchListing } from '../support/ui';

/**
 * Exclusão das páginas de conteúdo pela listagem do painel.
 *
 * Cada teste cria a página com **arquivo de verdade no S3**, exclui pela tela
 * e cobra as três coisas que a exclusão promete: o card sai da listagem, a API
 * deixa de servir a página e o objeto sai do bucket. A última é a que ninguém
 * vê acontecer — uma exclusão que esquece o arquivo responde 204 igualzinho, e
 * o órfão só aparece na conta do S3 meses depois.
 */

/** Onde cada tipo de página é listado no painel. */
const LISTING_ROUTES = {
  weekMaterial: '/adm/paginas-materiais-semanais',
  videoPage: '/adm/paginas-videos',
  ideasPage: '/adm/paginas-ideias',
  imagePage: '/adm/paginas-fotos',
} as const;

/** Uma página já criada, do jeito que a limpeza precisa dela. */
interface CreatedPage {
  path: string;
  id: string;
}

/**
 * Espera do `DELETE` no navegador.
 *
 * A exclusão apaga cada arquivo no S3 antes de responder, e cada um é uma ida
 * à AWS: a resposta demora bem mais que uma escrita comum. Esperar pela
 * requisição — em vez de só pelo diálogo sumir — deixa o teste medir o que
 * interessa e não vira intermitência quando a rede está mais lenta.
 */
const DELETE_TIMEOUT = 60_000;

/** Aciona a exclusão pelo card e confirma, esperando a resposta da API. */
async function deleteFromListing(page: Page, card: Locator, endpoint: string, id: string): Promise<void> {
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Excluir', exact: true }).click();

  const dialog = page.getByTestId('modal-delete-confirm-dialog');
  await expect(dialog).toBeVisible();

  const deleted = page.waitForResponse(
    (response) => response.request().method() === 'DELETE' && response.url().endsWith(`${endpoint}/${id}`),
    { timeout: DELETE_TIMEOUT },
  );
  await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
  expect((await deleted).status(), 'a API recusou a exclusão').toBeLessThan(300);

  await expect(dialog).toBeHidden({ timeout: DELETE_TIMEOUT });
  await expect(card).toHaveCount(0);
}

test.describe('Exclusão de páginas: a página sai e o arquivo sai junto', () => {
  // Cada cenário sobe arquivo para o bucket, exclui pela tela e volta a
  // consultar o S3: são idas à AWS que o teste de tela comum não faz, e o
  // minuto padrão da suíte não cobre.
  test.describe.configure({ timeout: 150_000 });

  let api: ApiClient;
  const created: CreatedPage[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.afterAll(async () => {
    // Só sobra o que o próprio teste não conseguiu excluir.
    for (const { path, id } of created.reverse()) await api.delete(`${path}/${id}`);
    await api.dispose();
  });

  test('materiais da semana: exclui pela listagem e apaga o arquivo do S3', async ({ page }) => {
    const suffix = uniqueSuffix();
    const title = `E2E Excluir Semana ${suffix}`;
    const material = await seedWeekMaterial(
      api,
      title,
      {
        videos: [linkMedia('Vídeo por link')],
        images: [uploadMedia('week_img', 'Imagem enviada')],
      },
      { week_img: pngFile('semana.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.weekMaterial, id: material.id });
    const arquivos = uploadedUrls(material.images);
    expect(arquivos).toHaveLength(1);

    await page.goto(LISTING_ROUTES.weekMaterial);
    await searchListing(page, suffix);
    await deleteFromListing(page, cardOf(page, 'week-materials', 'week-material-list-card', material.id), PAGE_ENDPOINTS.weekMaterial, material.id);

    expect(await api.statusOf(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).toBe(404);
    await expectS3ObjectGone(arquivos[0], 'imagem do material da semana excluído');
  });

  test('galeria de vídeos: exclui pela listagem e apaga o arquivo do S3', async ({ page }) => {
    const suffix = uniqueSuffix();
    const title = `E2E Excluir Vídeos ${suffix}`;
    const gallery: VideoPageSeed = await seedVideoPage(
      api,
      title,
      [uploadMedia('video_file', 'Vídeo enviado', MediaType.VIDEO), linkMedia('Vídeo por link')],
      { video_file: pngFile('video.mp4') },
    );
    created.push({ path: PAGE_ENDPOINTS.videoPage, id: gallery.id });
    const arquivos = uploadedUrls(gallery.videos);
    expect(arquivos).toHaveLength(1);

    await page.goto(LISTING_ROUTES.videoPage);
    await searchListing(page, suffix);
    await deleteFromListing(page, cardOf(page, 'video-pages', 'video-page-list-card', gallery.id), PAGE_ENDPOINTS.videoPage, gallery.id);

    expect(await api.statusOf(`${PAGE_ENDPOINTS.videoPage}/${gallery.id}`)).toBe(404);
    await expectS3ObjectGone(arquivos[0], 'vídeo da galeria excluída');
  });

  test('página de ideias: exclui pela listagem e apaga os arquivos das seções', async ({ page }) => {
    const suffix = uniqueSuffix();
    const title = `E2E Excluir Ideias ${suffix}`;
    const ideas: IdeasPageSeed = await seedIdeasPage(
      api,
      title,
      [
        { title: 'Seção 1', medias: [uploadMedia('ideas_a', 'Foto da ideia 1'), linkMedia('Vídeo por link')] },
        { title: 'Seção 2', medias: [uploadMedia('ideas_b', 'Foto da ideia 2')] },
      ],
      { ideas_a: pngFile('ideia-1.png'), ideas_b: pngFile('ideia-2.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.ideasPage, id: ideas.id });
    // As mídias pendem das seções, e não da página: é o caso em que um arquivo
    // esquecido tem mais chance de sobrar.
    const arquivos = uploadedUrls(ideas.sections.flatMap((section) => section.medias));
    expect(arquivos).toHaveLength(2);

    await page.goto(LISTING_ROUTES.ideasPage);
    await searchListing(page, suffix);
    await deleteFromListing(page, cardOf(page, 'ideas-pages', 'ideas-page-list-card', ideas.id), PAGE_ENDPOINTS.ideasPage, ideas.id);

    expect(await api.statusOf(`${PAGE_ENDPOINTS.ideasPage}/${ideas.id}`)).toBe(404);
    for (const url of arquivos) await expectS3ObjectGone(url, 'mídia da página de ideias excluída');
  });

  test('galeria de fotos: exclui pela listagem e apaga as fotos de todas as seções', async ({ page }) => {
    const suffix = uniqueSuffix();
    const title = `E2E Excluir Galeria ${suffix}`;
    const gallery: ImagePageSeed = await seedImagePage(
      api,
      title,
      [
        { caption: 'Seção 1', mediaItems: [uploadMedia('gal_a', 'Foto 1'), uploadMedia('gal_b', 'Foto 2')] },
        { caption: 'Seção 2', mediaItems: [uploadMedia('gal_c', 'Foto 3')] },
      ],
      { gal_a: pngFile('foto-1.png'), gal_b: pngFile('foto-2.png'), gal_c: pngFile('foto-3.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.imagePage, id: gallery.id });
    const arquivos = uploadedUrls(gallery.sections.flatMap((section) => section.mediaItems));
    expect(arquivos).toHaveLength(3);

    await page.goto(LISTING_ROUTES.imagePage);
    await searchListing(page, suffix);
    await deleteFromListing(page, cardOf(page, 'image-pages', 'image-page-list-card', gallery.id), PAGE_ENDPOINTS.imagePage, gallery.id);

    expect(await api.statusOf(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`)).toBe(404);
    for (const url of arquivos) await expectS3ObjectGone(url, 'foto da galeria excluída');
  });
});
