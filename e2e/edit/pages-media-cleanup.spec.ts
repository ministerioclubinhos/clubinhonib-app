import { expect, Page, test } from '@playwright/test';

import { MediaType } from '@/store/slices/types';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
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
  SeedMediaItem,
  uploadedUrls,
  uploadMedia,
  VideoPageSeed,
  WeekMaterialSeed,
} from '../support/pageSeeds';
import { expectS3ObjectGone, expectS3ObjectPresent } from '../support/s3';
import { replaceText } from '../support/ui';

/**
 * Edição das páginas de conteúdo: o que o administrador tira some do bucket, e
 * o que ele não tocou continua lá.
 *
 * São os dois erros opostos da mesma operação. Esquecer de apagar o arquivo
 * deixa órfão no S3 — invisível, porque a página fica certa. Apagar demais
 * quebra o que continuava publicado — a mídia aponta para um objeto que não
 * existe mais, e não há como trazer de volta. Nenhum dos dois aparece na
 * resposta da API, então cada cenário confere o bucket direto.
 */

/** Rotas de edição de cada tipo de página. */
const EDIT_ROUTES = {
  weekMaterial: '/adm/editar-pagina-semana',
  videoPage: '/adm/editar-pagina-videos',
  ideasPage: '/adm/editar-pagina-ideias',
  imagePage: '/adm/editar-pagina-imagens',
} as const;

/** Uma página já criada, do jeito que a limpeza precisa dela. */
interface CreatedPage {
  path: string;
  id: string;
}

/** Confirma a remoção de um item ou de uma seção dentro do formulário. */
async function confirmRemoval(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Remover', exact: true }).click();
  await expect(dialog).toBeHidden();
}

/** A mídia de um título, dentro da lista devolvida pela API. */
function mediaTitled(items: readonly SeedMediaItem[], title: string): SeedMediaItem | undefined {
  return items.find((item) => item.title === title);
}

/** A única URL de arquivo da lista; falha alto quando o seed não subiu nada. */
function onlyUploadedUrl(items: readonly SeedMediaItem[]): string {
  const urls = uploadedUrls(items);
  expect(urls, 'o seed precisava ter subido exatamente um arquivo').toHaveLength(1);
  return urls[0];
}

/**
 * Posição (contando de 1) de um item na lista que a tela vai renderizar.
 *
 * Os botões de remover seção e remover foto são numerados pela posição, e a
 * API não ordena nem as seções nem as mídias: a lista chega na ordem que o
 * banco quiser, que não é a da criação. Fixar o número aqui faria o teste
 * remover o item errado — exatamente o engano que ele existe para pegar.
 */
function positionOf(labels: readonly string[], label: string): number {
  const index = labels.indexOf(label);
  expect(index, `"${label}" não veio na resposta da API: ${labels.join(', ')}`).toBeGreaterThanOrEqual(0);
  return index + 1;
}

test.describe('Edição de páginas: só o arquivo removido sai do S3', () => {
  // Mesmo motivo do teste de exclusão: upload no seed, gravação pela tela e
  // consulta ao bucket depois não cabem no minuto padrão da suíte.
  test.describe.configure({ timeout: 150_000 });

  let api: ApiClient;
  const created: CreatedPage[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });

  test.afterAll(async () => {
    for (const { path, id } of created.reverse()) await api.delete(`${path}/${id}`);
    await api.dispose();
  });

  test('materiais da semana: remover uma imagem apaga só o arquivo dela', async ({ page }) => {
    const suffix = uniqueSuffix();
    const material: WeekMaterialSeed = await seedWeekMaterial(
      api,
      `E2E Semana Mídia ${suffix}`,
      {
        videos: [linkMedia('Vídeo por link')],
        images: [uploadMedia('img_a', 'Imagem A'), uploadMedia('img_b', 'Imagem B')],
      },
      { img_a: pngFile('a.png'), img_b: pngFile('b.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.weekMaterial, id: material.id });
    const mantida = mediaTitled(material.images, 'Imagem A');
    const removida = mediaTitled(material.images, 'Imagem B');
    expect(mantida?.url && removida?.url, 'o seed precisava ter as duas imagens').toBeTruthy();

    await page.goto(`${EDIT_ROUTES.weekMaterial}/${material.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();
    await form.getByRole('tab', { name: 'Imagens: 2' }).click();

    const editor = form.getByTestId('media-media-editor');
    await editor.getByRole('button', { name: 'Remover Imagem B' }).click();
    await confirmRemoval(page);
    await expect(editor.getByRole('button', { name: 'Editar Imagem B' })).toHaveCount(0);

    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect
      .poll(async () => (await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).images.map((item) => item.title))
      .toEqual(['Imagem A']);
    await expectS3ObjectGone(removida?.url ?? '', 'imagem removida do material da semana');
    await expectS3ObjectPresent(mantida?.url ?? '', 'imagem que continuou no material da semana');
  });

  test('materiais da semana: editar só o texto não mexe nos arquivos', async ({ page }) => {
    const suffix = uniqueSuffix();
    const material: WeekMaterialSeed = await seedWeekMaterial(
      api,
      `E2E Semana Texto ${suffix}`,
      { images: [uploadMedia('img_a', 'Imagem A'), uploadMedia('img_b', 'Imagem B')] },
      { img_a: pngFile('a.png'), img_b: pngFile('b.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.weekMaterial, id: material.id });
    const arquivos = uploadedUrls(material.images);
    expect(arquivos).toHaveLength(2);

    await page.goto(`${EDIT_ROUTES.weekMaterial}/${material.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();
    await replaceText(form.getByRole('textbox', { name: /^Semana( \*)?$/ }), `E2E Semana Texto Editada ${suffix}`);
    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect
      .poll(async () => (await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).title)
      .toBe(`E2E Semana Texto Editada ${suffix}`);
    // As mesmas URLs de antes: uma reescrita da mídia trocaria o objeto e
    // deixaria o anterior para trás.
    const depois = await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`);
    expect(uploadedUrls(depois.images).sort()).toEqual([...arquivos].sort());
    for (const url of arquivos) await expectS3ObjectPresent(url, 'arquivo de material só com texto editado');
  });

  test('materiais da semana: trocar o arquivo de uma imagem apaga o antigo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const material: WeekMaterialSeed = await seedWeekMaterial(
      api,
      `E2E Semana Troca ${suffix}`,
      { images: [uploadMedia('img_a', 'Imagem A')] },
      { img_a: pngFile('antiga.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.weekMaterial, id: material.id });
    const antigo = onlyUploadedUrl(material.images);

    await page.goto(`${EDIT_ROUTES.weekMaterial}/${material.id}`);
    const form = page.getByTestId('week-materials-week-material-page-form');
    await expect(form).toBeVisible();
    await form.getByRole('tab', { name: 'Imagens: 1' }).click();

    const editor = form.getByTestId('media-media-editor');
    await editor.getByRole('button', { name: 'Editar Imagem A' }).click();
    await editor.locator('input[type="file"]').setInputFiles({ name: 'nova.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await editor.getByRole('button', { name: 'Salvar Alterações' }).click();
    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect
      .poll(async () => onlyUploadedUrl((await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).images))
      .not.toBe(antigo);
    const novo = onlyUploadedUrl((await api.get<WeekMaterialSeed>(`${PAGE_ENDPOINTS.weekMaterial}/${material.id}`)).images);
    await expectS3ObjectPresent(novo, 'arquivo novo da imagem trocada');
    await expectS3ObjectGone(antigo, 'arquivo antigo da imagem trocada');
  });

  test('galeria de vídeos: remover o vídeo enviado apaga o arquivo e mantém o link', async ({ page }) => {
    const suffix = uniqueSuffix();
    const gallery: VideoPageSeed = await seedVideoPage(
      api,
      `E2E Vídeos Mídia ${suffix}`,
      [uploadMedia('video_file', 'Vídeo enviado', MediaType.VIDEO), linkMedia('Vídeo por link')],
      { video_file: pngFile('video.mp4') },
    );
    created.push({ path: PAGE_ENDPOINTS.videoPage, id: gallery.id });
    const arquivo = onlyUploadedUrl(gallery.videos);

    await page.goto(`${EDIT_ROUTES.videoPage}/${gallery.id}`);
    const form = page.getByTestId('video-pages-video-page-form');
    await expect(form).toBeVisible();

    const editor = page.getByTestId('video-pages-video-editor');
    await editor.getByRole('button', { name: 'Remover Vídeo enviado' }).click();
    await confirmRemoval(page);
    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect
      .poll(async () => (await api.get<VideoPageSeed>(`${PAGE_ENDPOINTS.videoPage}/${gallery.id}`)).videos.map((item) => item.title))
      .toEqual(['Vídeo por link']);
    await expectS3ObjectGone(arquivo, 'vídeo removido da galeria');
  });

  test('página de ideias: remover uma mídia da seção apaga só o arquivo dela', async ({ page }) => {
    const suffix = uniqueSuffix();
    const ideas: IdeasPageSeed = await seedIdeasPage(
      api,
      `E2E Ideias Mídia ${suffix}`,
      [{ title: 'Seção única', medias: [uploadMedia('idea_a', 'Foto A'), uploadMedia('idea_b', 'Foto B')] }],
      { idea_a: pngFile('a.png'), idea_b: pngFile('b.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.ideasPage, id: ideas.id });
    const medias = ideas.sections[0].medias;
    const mantida = mediaTitled(medias, 'Foto A');
    const removida = mediaTitled(medias, 'Foto B');
    expect(mantida?.url && removida?.url, 'o seed precisava ter as duas fotos').toBeTruthy();

    await page.goto(`${EDIT_ROUTES.ideasPage}/${ideas.id}`);
    const form = page.getByTestId('ideas-pages-ideas-page-form');
    await expect(form).toBeVisible();

    const section = form.getByTestId('ideas-pages-ideas-section-editor').first();
    await section.getByRole('tab', { name: /Imagens/ }).click();
    const editor = section.getByTestId('media-media-editor');
    await editor.getByRole('button', { name: 'Remover Foto B' }).click();
    await confirmRemoval(page);

    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect
      .poll(async () => (await api.get<IdeasPageSeed>(`${PAGE_ENDPOINTS.ideasPage}/${ideas.id}`)).sections[0].medias.map((item) => item.title))
      .toEqual(['Foto A']);
    await expectS3ObjectGone(removida?.url ?? '', 'foto removida da seção de ideias');
    await expectS3ObjectPresent(mantida?.url ?? '', 'foto que continuou na seção de ideias');
  });

  test('página de ideias: remover a seção leva as mídias dela', async ({ page }) => {
    const suffix = uniqueSuffix();
    const ideas: IdeasPageSeed = await seedIdeasPage(
      api,
      `E2E Ideias Seção ${suffix}`,
      [
        { title: 'Seção que fica', medias: [uploadMedia('idea_a', 'Foto que fica')] },
        { title: 'Seção que sai', medias: [uploadMedia('idea_b', 'Foto que sai')] },
      ],
      { idea_a: pngFile('fica.png'), idea_b: pngFile('sai.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.ideasPage, id: ideas.id });

    // A tela renderiza as seções na ordem em que a API as devolve, e não na
    // ordem em que foram criadas.
    const antes = await api.get<IdeasPageSeed>(`${PAGE_ENDPOINTS.ideasPage}/${ideas.id}`);
    const posicao = positionOf(antes.sections.map((section) => section.title), 'Seção que sai');
    const mantida = onlyUploadedUrl(antes.sections.flatMap((section) => (section.title === 'Seção que fica' ? section.medias : [])));
    const removida = onlyUploadedUrl(antes.sections.flatMap((section) => (section.title === 'Seção que sai' ? section.medias : [])));

    await page.goto(`${EDIT_ROUTES.ideasPage}/${ideas.id}`);
    const form = page.getByTestId('ideas-pages-ideas-page-form');
    await expect(form.getByTestId('ideas-pages-ideas-section-editor')).toHaveCount(2);

    await form.getByRole('button', { name: `Remover seção ${posicao}` }).click();
    await confirmRemoval(page);
    await expect(form.getByTestId('ideas-pages-ideas-section-editor')).toHaveCount(1);

    await form.getByRole('button', { name: 'Salvar Página' }).click();

    await expect
      .poll(async () => (await api.get<IdeasPageSeed>(`${PAGE_ENDPOINTS.ideasPage}/${ideas.id}`)).sections.map((section) => section.title))
      .toEqual(['Seção que fica']);
    await expectS3ObjectGone(removida, 'foto da seção de ideias removida');
    await expectS3ObjectPresent(mantida, 'foto da seção de ideias preservada');
  });

  test('galeria de fotos: remover uma foto da seção apaga só o arquivo dela', async ({ page }) => {
    const suffix = uniqueSuffix();
    const gallery: ImagePageSeed = await seedImagePage(
      api,
      `E2E Galeria Foto ${suffix}`,
      [{ caption: 'Seção única', mediaItems: [uploadMedia('gal_a', 'Foto A'), uploadMedia('gal_b', 'Foto B')] }],
      { gal_a: pngFile('a.png'), gal_b: pngFile('b.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.imagePage, id: gallery.id });

    // O botão de remover é numerado pela posição na tela, que é a da resposta.
    const antes = await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`);
    const fotos = antes.sections[0].mediaItems;
    const posicao = positionOf(fotos.map((item) => item.title), 'Foto B');
    const mantida = mediaTitled(fotos, 'Foto A');
    const removida = mediaTitled(fotos, 'Foto B');
    expect(mantida?.url && removida?.url, 'o seed precisava ter as duas fotos').toBeTruthy();

    await page.goto(`${EDIT_ROUTES.imagePage}/${gallery.id}`);
    const form = page.getByTestId('image-pages-image-page-form');
    await expect(form).toBeVisible();

    const section = form.getByTestId('image-pages-image-section-editor').first();
    await section.getByRole('button', { name: `Remover imagem ${posicao} da seção 1` }).click();
    await confirmRemoval(page);

    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect
      .poll(async () => (await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`)).sections[0].mediaItems.map((item) => item.title))
      .toEqual(['Foto A']);
    await expectS3ObjectGone(removida?.url ?? '', 'foto removida da galeria');
    await expectS3ObjectPresent(mantida?.url ?? '', 'foto que continuou na galeria');
  });

  test('galeria de fotos: remover a seção leva as fotos dela', async ({ page }) => {
    const suffix = uniqueSuffix();
    const gallery: ImagePageSeed = await seedImagePage(
      api,
      `E2E Galeria Seção ${suffix}`,
      [
        { caption: 'Seção que fica', mediaItems: [uploadMedia('gal_a', 'Foto que fica')] },
        { caption: 'Seção que sai', mediaItems: [uploadMedia('gal_b', 'Foto que sai')] },
      ],
      { gal_a: pngFile('fica.png'), gal_b: pngFile('sai.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.imagePage, id: gallery.id });

    const antes = await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`);
    const posicao = positionOf(antes.sections.map((section) => section.caption), 'Seção que sai');
    const mantida = onlyUploadedUrl(antes.sections.flatMap((section) => (section.caption === 'Seção que fica' ? section.mediaItems : [])));
    const removida = onlyUploadedUrl(antes.sections.flatMap((section) => (section.caption === 'Seção que sai' ? section.mediaItems : [])));

    await page.goto(`${EDIT_ROUTES.imagePage}/${gallery.id}`);
    const form = page.getByTestId('image-pages-image-page-form');
    await expect(form.getByTestId('image-pages-image-section-editor')).toHaveCount(2);

    await form.getByRole('button', { name: `Remover seção ${posicao}` }).click();
    await confirmRemoval(page);
    await expect(form.getByTestId('image-pages-image-section-editor')).toHaveCount(1);

    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect
      .poll(async () => (await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`)).sections.map((section) => section.caption))
      .toEqual(['Seção que fica']);
    await expectS3ObjectGone(removida, 'foto da seção removida da galeria');
    await expectS3ObjectPresent(mantida, 'foto da seção preservada da galeria');
  });

  test('galeria de fotos: acrescentar uma foto preserva as que já estavam', async ({ page }) => {
    const suffix = uniqueSuffix();
    const gallery: ImagePageSeed = await seedImagePage(
      api,
      `E2E Galeria Nova Foto ${suffix}`,
      [{ caption: 'Seção única', mediaItems: [uploadMedia('gal_a', 'Foto antiga')] }],
      { gal_a: pngFile('antiga.png') },
    );
    created.push({ path: PAGE_ENDPOINTS.imagePage, id: gallery.id });
    const antiga = onlyUploadedUrl(gallery.sections[0].mediaItems);

    await page.goto(`${EDIT_ROUTES.imagePage}/${gallery.id}`);
    const form = page.getByTestId('image-pages-image-page-form');
    const section = form.getByTestId('image-pages-image-section-editor').first();
    await section.getByRole('button', { name: 'Adicionar imagens' }).click();

    const dialog = page.getByTestId('image-pages-add-images-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="file"]').setInputFiles({ name: 'nova.png', mimeType: 'image/png', buffer: PNG_1X1 });
    await dialog.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(dialog).toBeHidden();

    await form.getByRole('button', { name: 'Salvar Galeria' }).click();

    await expect
      .poll(async () => (await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`)).sections[0].mediaItems.length)
      .toBe(2);
    const depois = await api.get<ImagePageSeed>(`${PAGE_ENDPOINTS.imagePage}/${gallery.id}`);
    const urls = uploadedUrls(depois.sections[0].mediaItems);
    expect(urls, 'a foto que já estava precisa continuar apontando para o mesmo objeto').toContain(antiga);
    for (const url of urls) await expectS3ObjectPresent(url, 'foto da galeria depois de acrescentar outra');
  });
});
