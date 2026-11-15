import { expect, Locator, Page, test } from '@playwright/test';

import { MediaType, MediaUploadType } from '@/store/slices/types';
import type { VideoPageResponse } from '@/features/video-pages/types';

import { ApiClient, uniqueSuffix } from '../support/api';
import {
  PAGE_ENDPOINTS,
  PAGE_PAYLOAD_FIELDS,
  SeedFile,
  VideoPageSeed,
  linkMedia,
  seedVideoPage,
  uploadMedia,
} from '../support/pageSeeds';
import { expectS3ObjectGone, expectS3ObjectPresent, expectUploadedToS3 } from '../support/s3';
import { cardOf, searchListing } from '../support/ui';

/**
 * Todos os cenários do editor de galeria de vídeos, contra a API real: criar,
 * editar, remover e excluir a galeria e os vídeos (por link e por upload).
 * Cada cenário confere o resultado relendo a API e, quando há arquivo, o
 * objeto no S3. Os de recusa provam as regras do back diretamente na API e,
 * pela tela, com uma edição obsoleta de verdade.
 */

const EDITOR = 'video-pages-video-editor';
const ENDPOINT = PAGE_ENDPOINTS.videoPage;
const FIELD = PAGE_PAYLOAD_FIELDS.videoPage;
const EDIT_ROUTE = '/adm/editar-pagina-videos';
const LIST_ROUTE = '/adm/paginas-videos';
const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const DRIVE = 'https://drive.google.com/file/d/vid123/view';

const mp4 = (name: string): SeedFile => ({
  name,
  mimeType: 'video/mp4',
  buffer: Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x18]),
    Buffer.from('ftypmp42'),
    Buffer.alloc(16),
  ]),
});

test.describe('Editor de galeria de vídeos: cenários completos', () => {
  test.describe.configure({ timeout: 180_000 });

  let api: ApiClient;
  const created: string[] = [];

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });
  test.afterAll(async () => {
    for (const id of created) await api.delete(`${ENDPOINT}/${id}`);
    await api.dispose();
  });

  const editor = (page: Page): Locator => page.getByTestId(EDITOR);
  const fetchPage = (id: string): Promise<VideoPageSeed> =>
    api.get<VideoPageSeed>(`${ENDPOINT}/${id}`);
  const titles = (page: VideoPageSeed): string[] => page.videos.map((v) => v.title).sort();
  const cardTitled = (page: Page, title: string): Locator =>
    editor(page).getByTestId('media-item-card').filter({ hasText: title });

  async function openTemplate(page: Page): Promise<void> {
    await page.goto('/adm/criar-pagina');
    const picker = page.getByTestId('adm-page-creator-select-page-template-selec-page-template');
    await expect(picker).toBeVisible();
    await picker.getByRole('button', { name: 'Criar Galeria de Vídeos' }).click();
  }

  async function selectMode(page: Page, mode: 'Link' | 'Upload'): Promise<void> {
    await editor(page).getByRole('combobox', { name: 'Tipo' }).click();
    await page.getByRole('option', { name: mode }).click();
  }

  /** Preenche o formulário do editor e adiciona o vídeo à lista. */
  async function addVideo(
    page: Page,
    input: {
      title: string;
      mode: 'link' | 'upload';
      url?: string;
      file?: SeedFile;
      platform?: string;
    }
  ): Promise<void> {
    const ed = editor(page);
    await ed.getByRole('textbox', { name: /^Título do vídeo/ }).fill(input.title);
    await ed
      .getByRole('textbox', { name: /^Descrição do vídeo/ })
      .fill(`Descrição de ${input.title}`);
    if (input.mode === 'upload') {
      await selectMode(page, 'Upload');
      await ed.locator('input[type="file"]').setInputFiles(input.file ?? mp4('video.mp4'));
    } else {
      if (input.platform) {
        await ed.getByRole('combobox', { name: 'Plataforma' }).click();
        await page.getByRole('option', { name: input.platform }).click();
      }
      await ed.getByRole('textbox', { name: /^URL do vídeo/ }).fill(input.url ?? YOUTUBE);
    }
    await ed.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(cardTitled(page, input.title)).toBeVisible();
  }

  const confirmRemoval = async (page: Page): Promise<void> => {
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(dialog).toBeHidden();
  };

  async function save(page: Page, method: 'POST' | 'PATCH'): Promise<VideoPageResponse> {
    const done = page.waitForResponse(
      (r) => r.request().method() === method && r.url().includes(ENDPOINT),
      { timeout: 120_000 }
    );
    await page.getByTestId('video-page-save').click();
    const response = await done;
    expect(response.ok(), `o salvamento foi recusado: ${await response.text()}`).toBeTruthy();
    return (await response.json()) as VideoPageResponse;
  }

  async function seedMixed(title: string): Promise<VideoPageSeed> {
    const seed = await seedVideoPage(
      api,
      title,
      [
        linkMedia('Vídeo por link', MediaType.VIDEO),
        uploadMedia('up_a', 'Vídeo enviado A', MediaType.VIDEO),
        uploadMedia('up_b', 'Vídeo enviado B', MediaType.VIDEO),
      ],
      { up_a: mp4('a.mp4'), up_b: mp4('b.mp4') }
    );
    created.push(seed.id);
    return seed;
  }

  const urlOf = (seed: VideoPageSeed, title: string): string => {
    const video = seed.videos.find((v) => v.title === title);
    expect(video, `vídeo "${title}" não encontrado`).toBeTruthy();
    return video?.url ?? '';
  };

  // ───────────────────────────── CRIAÇÃO ─────────────────────────────

  test('cria galeria com vídeo do YouTube, link do Drive e arquivo enviado', async ({ page }) => {
    const title = `E2E Vídeos ${uniqueSuffix()}`;
    await openTemplate(page);
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill(title);
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Vídeos do evento');

    await addVideo(page, { title: 'Abertura', mode: 'link', url: YOUTUBE });
    await addVideo(page, {
      title: 'Bastidores',
      mode: 'link',
      url: DRIVE,
      platform: 'Google Drive',
    });
    await addVideo(page, { title: 'Arquivo próprio', mode: 'upload' });

    const summary = page.getByTestId('video-page-summary');
    await expect(summary.getByText('3', { exact: true }).first()).toBeVisible();

    const saved = await save(page, 'POST');
    created.push(saved.id);
    await expect(page).toHaveURL(new RegExp(`/${saved.route.path}$`));

    const stored = await fetchPage(saved.id);
    expect(stored).toMatchObject({ title, description: 'Vídeos do evento' });
    expect(titles(stored)).toEqual(['Abertura', 'Arquivo próprio', 'Bastidores']);
    const byTitle = Object.fromEntries(stored.videos.map((v) => [v.title, v]));
    expect(byTitle['Abertura']).toMatchObject({ uploadType: MediaUploadType.LINK, url: YOUTUBE });
    expect(byTitle['Bastidores']).toMatchObject({ uploadType: MediaUploadType.LINK, url: DRIVE });
    expect(byTitle['Arquivo próprio'].uploadType).toBe(MediaUploadType.UPLOAD);
    expectUploadedToS3(byTitle['Arquivo próprio'].url, 'vídeo enviado');
  });

  test('cria galeria sem vídeos (rascunho só com texto)', async ({ page }) => {
    const title = `E2E Sem vídeos ${uniqueSuffix()}`;
    await openTemplate(page);
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill(title);
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Ainda sem vídeos');
    await expect(editor(page).getByText('Nenhum vídeo adicionado ainda.')).toBeVisible();
    const saved = await save(page, 'POST');
    created.push(saved.id);
    expect((await fetchPage(saved.id)).videos).toHaveLength(0);
  });

  test('validações: página, vídeo vazio, URL da plataforma, upload sem arquivo e rascunho que bloqueia', async ({
    page,
  }) => {
    let posts = 0;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith(ENDPOINT)) posts += 1;
    });
    await openTemplate(page);

    await page.getByTestId('video-page-save').click();
    await expect(page.getByTestId('video-page-feedback')).toContainText(
      'Preencha todos os campos obrigatórios.'
    );
    await expect(page.getByText('Informe um título com até 255 caracteres.')).toBeVisible();
    await expect(page.getByText('Preencha a descrição da galeria.')).toBeVisible();
    expect(posts).toBe(0);

    const ed = editor(page);
    await ed.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(ed.getByText('Este campo é obrigatório.')).toHaveCount(2);

    await ed.getByRole('textbox', { name: /^Título do vídeo/ }).fill('Inválido');
    await ed.getByRole('textbox', { name: /^Descrição do vídeo/ }).fill('d');
    await ed
      .getByRole('textbox', { name: /^URL do vídeo/ })
      .fill('https://exemplo.com/nao-e-youtube');
    await ed.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(ed.getByText('URL inválida')).toBeVisible();
    await expect(cardTitled(page, 'Inválido')).toHaveCount(0);

    // O rascunho aberto impede salvar a galeria até ser concluído ou descartado.
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill('Título válido');
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Descrição válida');
    await expect(page.getByTestId('video-page-draft-warning')).toBeVisible();
    await expect(page.getByTestId('video-page-save')).toBeDisabled();
    await selectMode(page, 'Upload');
    await ed.getByRole('button', { name: 'Adicionar vídeo' }).click();
    await expect(cardTitled(page, 'Inválido')).toHaveCount(0);
    await ed.getByRole('button', { name: 'Descartar rascunho' }).click();
    await expect(page.getByTestId('video-page-draft-warning')).toHaveCount(0);
    await expect(page.getByTestId('video-page-save')).toBeEnabled();
    expect(posts).toBe(0);
  });

  test('a API recusa corpo inválido: título, link sem esquema, arquivo ausente e id de outra página', async () => {
    const base = (over: Record<string, unknown>) =>
      JSON.stringify({
        title: 'Galeria',
        description: 'Descrição',
        public: true,
        videos: [],
        ...over,
      });
    const post = (body: string) => api.sendMultipart('POST', ENDPOINT, { [FIELD]: body });
    const video = (over: Record<string, unknown>) => ({
      title: 'V',
      description: 'd',
      uploadType: 'link',
      mediaType: 'video',
      isLocalFile: false,
      url: YOUTUBE,
      ...over,
    });

    const blank = await post(base({ title: '   ' }));
    expect(blank.status).toBe(422);
    expect(blank.fieldErrors.map((e) => e.field)).toContain('title');
    expect(blank.message).toContain('Galeria · Título');

    const long = await post(base({ title: 'x'.repeat(256) }));
    expect(long.status).toBe(422);
    expect(long.message).toContain('Use até 255 caracteres.');

    const badLink = await post(
      base({ videos: [video({}), video({ url: 'youtube.com/watch?v=x' })] })
    );
    expect(badLink.status).toBeGreaterThanOrEqual(400);
    expect(badLink.message).toContain('Vídeo 2 · Link');
    expect(badLink.fieldErrors.map((e) => e.field)).toEqual(['videos.1.url']);

    const missingFile = await post(
      base({
        videos: [
          video({
            uploadType: 'upload',
            isLocalFile: true,
            fieldKey: 'nao_enviado',
            url: undefined,
          }),
        ],
      })
    );
    expect(missingFile.status).toBeGreaterThanOrEqual(400);
    expect(missingFile.message).toContain('Arquivo ausente');

    const seed = await seedMixed(`E2E Recusa ${uniqueSuffix()}`);
    const before = await fetchPage(seed.id);
    const foreign = await api.sendMultipart('PATCH', `${ENDPOINT}/${seed.id}`, {
      [FIELD]: JSON.stringify({
        id: seed.id,
        title: 'T',
        description: 'D',
        public: true,
        videos: [video({ id: '00000000-0000-4000-8000-000000000000' })],
      }),
    });
    expect(foreign.status).toBeGreaterThanOrEqual(400);
    expect(foreign.message).toContain('Vídeo 1: Identificador de vídeo inválido');
    expect(foreign.fieldErrors.map((e) => e.field)).toEqual(['videos.0.id']);
    // A recusa não mexeu em nada.
    expect((await fetchPage(seed.id)).videos.map((v) => v.id).sort()).toEqual(
      before.videos.map((v) => v.id).sort()
    );
  });

  // ───────────────────────────── EDIÇÃO ─────────────────────────────

  test('edita os textos e a visibilidade da galeria', async ({ page }) => {
    const seed = await seedMixed(`E2E Editar ${uniqueSuffix()}`);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill('Título renovado');
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Descrição renovada');
    await page
      .getByTestId('video-page-summary')
      .getByRole('checkbox', { name: /Página/ })
      .setChecked(false);
    await save(page, 'PATCH');
    expect(await fetchPage(seed.id)).toMatchObject({
      title: 'Título renovado',
      description: 'Descrição renovada',
      public: false,
    });
    expect(titles(await fetchPage(seed.id))).toEqual(titles(seed));
  });

  test('edita os vídeos: textos, upload→link, link→upload e troca de arquivo', async ({ page }) => {
    const seed = await seedMixed(`E2E Editar Vídeos ${uniqueSuffix()}`);
    const urlA = urlOf(seed, 'Vídeo enviado A');
    const urlB = urlOf(seed, 'Vídeo enviado B');
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const ed = editor(page);

    // Só os textos de um upload: o arquivo continua o mesmo.
    await ed.getByRole('button', { name: 'Editar Vídeo enviado A' }).click();
    await expect(ed.getByText('Editando vídeo')).toBeVisible();
    await ed.getByRole('textbox', { name: /^Título do vídeo/ }).fill('Enviado A renomeado');
    await ed.getByRole('textbox', { name: /^Descrição do vídeo/ }).fill('Descrição nova');
    await ed.getByRole('button', { name: 'Salvar alterações' }).click();

    // Upload → link.
    await ed.getByRole('button', { name: 'Editar Vídeo enviado B' }).click();
    await selectMode(page, 'Link');
    await ed.getByRole('textbox', { name: /^URL do vídeo/ }).fill(YOUTUBE);
    await ed.getByRole('button', { name: 'Salvar alterações' }).click();

    // Link → upload.
    await ed.getByRole('button', { name: 'Editar Vídeo por link' }).click();
    await selectMode(page, 'Upload');
    await ed.locator('input[type="file"]').setInputFiles(mp4('novo.mp4'));
    await ed.getByRole('button', { name: 'Salvar alterações' }).click();

    await save(page, 'PATCH');
    const after = await fetchPage(seed.id);
    const byTitle = Object.fromEntries(after.videos.map((v) => [v.title, v]));
    expect(byTitle['Enviado A renomeado']).toMatchObject({
      description: 'Descrição nova',
      uploadType: MediaUploadType.UPLOAD,
      url: urlA,
    });
    expect(byTitle['Vídeo enviado B']).toMatchObject({
      uploadType: MediaUploadType.LINK,
      url: YOUTUBE,
    });
    expect(byTitle['Vídeo por link'].uploadType).toBe(MediaUploadType.UPLOAD);
    expectUploadedToS3(byTitle['Vídeo por link'].url, 'link virou upload');
    await expectS3ObjectPresent(urlA, 'arquivo que só mudou de texto');
    await expectS3ObjectGone(urlB, 'arquivo que virou link');
  });

  test('troca o arquivo de um vídeo enviado e apaga o antigo', async ({ page }) => {
    const seed = await seedMixed(`E2E Trocar arquivo ${uniqueSuffix()}`);
    const oldUrl = urlOf(seed, 'Vídeo enviado A');
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const ed = editor(page);
    await ed.getByRole('button', { name: 'Editar Vídeo enviado A' }).click();
    await ed.locator('input[type="file"]').setInputFiles(mp4('substituto.mp4'));
    await ed.getByRole('button', { name: 'Salvar alterações' }).click();
    await save(page, 'PATCH');
    const media = (await fetchPage(seed.id)).videos.find((v) => v.title === 'Vídeo enviado A');
    expect(media?.url).not.toBe(oldUrl);
    expectUploadedToS3(media?.url ?? '', 'arquivo substituto');
    await expectS3ObjectGone(oldUrl, 'arquivo substituído');
  });

  test('visualiza o vídeo (YouTube e arquivo) em um diálogo, em tela cheia no celular', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const seed = await seedMixed(`E2E Visualizar ${uniqueSuffix()}`);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const viewer = page.getByTestId('media-viewer-dialog');

    await cardTitled(page, 'Vídeo por link')
      .getByRole('button', { name: /^Visualizar Vídeo por link/ })
      .click();
    await expect(viewer.getByTestId('media-viewer-embed')).toHaveAttribute(
      'src',
      /youtube\.com\/embed\/dQw4w9WgXcQ/
    );
    expect((await viewer.boundingBox())?.width).toBeGreaterThanOrEqual(385);
    await viewer.getByRole('button', { name: 'Fechar' }).first().click();
    await expect(viewer).toHaveCount(0);

    await cardTitled(page, 'Vídeo enviado A')
      .getByRole('button', { name: /^Visualizar Vídeo enviado A/ })
      .click();
    await expect(viewer.getByTestId('media-viewer-video')).toBeVisible();
    await viewer.getByRole('button', { name: 'Fechar' }).first().click();
  });

  test('edição obsoleta: a API recusa de verdade, aponta o vídeo e preserva o que foi digitado', async ({
    page,
  }) => {
    const seed = await seedMixed(`E2E Obsoleta ${uniqueSuffix()}`);
    const before = await fetchPage(seed.id);
    const staleIndex = before.videos.findIndex((v) => v.title === 'Vídeo enviado B');
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await expect(editor(page).getByTestId('media-item-card')).toHaveCount(3);

    // Outra pessoa remove o vídeo B enquanto este editor está aberto.
    const removal = await api.sendMultipart('PATCH', `${ENDPOINT}/${seed.id}`, {
      [FIELD]: JSON.stringify({
        id: seed.id,
        title: before.title,
        description: 'Galeria criada pelo Playwright',
        public: true,
        videos: before.videos
          .filter((v) => v.title !== 'Vídeo enviado B')
          .map((v) => ({
            id: v.id,
            title: v.title,
            description: 'd',
            uploadType: v.uploadType,
            mediaType: 'video',
            isLocalFile: v.isLocalFile,
            url: v.url,
            ...(v.uploadType === 'link' ? { platformType: 'youtube' } : {}),
          })),
      }),
    });
    expect(removal.status).toBeLessThan(300);

    await page.getByRole('textbox', { name: 'Título da galeria' }).fill('Título preservado');
    await page.getByTestId('video-page-save').click();
    await expect(page.getByTestId('video-page-feedback')).toContainText(
      `Vídeo ${staleIndex + 1}: Identificador de vídeo inválido`
    );
    await expect(page.getByTestId('video-api-errors')).toContainText('Recarregue a página');
    await expect(page.getByRole('textbox', { name: 'Título da galeria' })).toHaveValue(
      'Título preservado'
    );
    await expect(page.getByTestId('video-page-save')).toBeEnabled();
    expect((await fetchPage(seed.id)).title).toBe(before.title);

    // Editar a lista invalida as posições: o aviso some.
    await editor(page).getByRole('button', { name: 'Remover Vídeo por link' }).click();
    await confirmRemoval(page);
    await expect(page.getByTestId('video-api-errors')).toHaveCount(0);
  });

  test('galeria com muitos vídeos ganha busca por título', async ({ page }) => {
    const seed = await seedVideoPage(
      api,
      `E2E Muitos ${uniqueSuffix()}`,
      Array.from({ length: 8 }, (_, i) =>
        Object.assign(
          linkMedia(i === 5 ? 'Louvor da manhã' : `Vídeo ${i + 1}`, MediaType.VIDEO),
          {}
        )
      ),
      {}
    );
    created.push(seed.id);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await expect(editor(page).getByTestId('media-item-card')).toHaveCount(8);
    await page.getByTestId('video-search').fill('louvor');
    await expect(page.getByTestId('video-search-result')).toContainText('1 de 8');
    await expect(editor(page).getByTestId('media-item-card')).toHaveCount(1);
    await page.getByTestId('video-search').fill('zzz');
    await expect(page.getByTestId('video-search-result')).toContainText('Nenhum vídeo encontrado');
    await page.getByTestId('video-search').fill('');
    await expect(editor(page).getByTestId('media-item-card')).toHaveCount(8);
  });

  test('página inexistente mostra o erro real da API e cabe em tela estreita', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${EDIT_ROUTE}/00000000-0000-4000-8000-000000000000`);
    await expect(page.getByTestId('video-page-load-error')).toBeVisible();
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByTestId('video-page-load-error')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);

    const seed = await seedMixed(`E2E Estreita ${uniqueSuffix()}`);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await expect(page.getByRole('textbox', { name: 'Título da galeria' })).toHaveValue(seed.title);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  // ───────────────────────────── REMOÇÃO ─────────────────────────────

  test('remove vídeos: cancelar mantém, confirmar apaga só o arquivo removido, e a galeria pode ficar vazia', async ({
    page,
  }) => {
    const seed = await seedMixed(`E2E Remover ${uniqueSuffix()}`);
    const goneUrl = urlOf(seed, 'Vídeo enviado A');
    const keptUrl = urlOf(seed, 'Vídeo enviado B');
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const ed = editor(page);

    await ed.getByRole('button', { name: 'Remover Vídeo enviado A' }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancelar' }).click();
    await expect(cardTitled(page, 'Vídeo enviado A')).toBeVisible();

    await ed.getByRole('button', { name: 'Remover Vídeo enviado A' }).click();
    await confirmRemoval(page);
    await ed.getByRole('button', { name: 'Remover Vídeo por link' }).click();
    await confirmRemoval(page);
    await expect(ed.getByTestId('media-item-card')).toHaveCount(1);
    await save(page, 'PATCH');
    expect(titles(await fetchPage(seed.id))).toEqual(['Vídeo enviado B']);
    await expectS3ObjectGone(goneUrl, 'vídeo removido');
    await expectS3ObjectPresent(keptUrl, 'vídeo que ficou');

    // O salvamento levou à página pública: reabre e remove o último.
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await editor(page).getByRole('button', { name: 'Remover Vídeo enviado B' }).click();
    await confirmRemoval(page);
    await expect(editor(page).getByText('Nenhum vídeo adicionado ainda.')).toBeVisible();
    await save(page, 'PATCH');
    expect((await fetchPage(seed.id)).videos).toHaveLength(0);
    await expectS3ObjectGone(keptUrl, 'último vídeo removido');
  });

  // ───────────────────────────── EXCLUSÃO ─────────────────────────────

  test('exclui a galeria pela listagem: cancelar mantém; confirmar apaga galeria e arquivos', async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seed = await seedMixed(`E2E Excluir Vídeos ${suffix}`);
    const urls = seed.videos.filter((v) => v.isLocalFile).map((v) => v.url);
    expect(urls).toHaveLength(2);

    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'video-pages', 'video-page-list-card', seed.id);
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const dialog = page.getByTestId('modal-delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /Cancelar/ }).click();
    await expect(dialog).toBeHidden();
    await expect(card).toBeVisible();
    expect(await api.statusOf(`${ENDPOINT}/${seed.id}`)).toBe(200);
    await expectS3ObjectPresent(urls[0], 'arquivo após cancelar a exclusão');

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const deleted = page.waitForResponse(
      (r) => r.request().method() === 'DELETE' && r.url().endsWith(`${ENDPOINT}/${seed.id}`),
      { timeout: 90_000 }
    );
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
    expect((await deleted).status()).toBeLessThan(300);
    await expect(card).toHaveCount(0, { timeout: 60_000 });

    expect(await api.statusOf(`${ENDPOINT}/${seed.id}`)).toBe(404);
    for (const url of urls) await expectS3ObjectGone(url, 'vídeo da galeria excluída');
  });

  test('abre a galeria na edição a partir da listagem', async ({ page }) => {
    const suffix = uniqueSuffix();
    const seed = await seedVideoPage(
      api,
      `E2E Listagem Vídeos ${suffix}`,
      [linkMedia('Único', MediaType.VIDEO)],
      {}
    );
    created.push(seed.id);
    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'video-pages', 'video-page-list-card', seed.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${EDIT_ROUTE}/${seed.id}$`));
    await expect(cardTitled(page, 'Único')).toBeVisible();
  });
});
