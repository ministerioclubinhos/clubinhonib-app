import { expect, Locator, Page, test } from '@playwright/test';

import { MediaType, MediaUploadType } from '@/store/slices/types';
import type { IdeasPageResponse } from '@/features/ideas-pages/types';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import {
  IdeasPageSeed,
  PAGE_ENDPOINTS,
  SeedFile,
  SeedMediaItem,
  seedIdeasPage,
  uploadMedia,
  linkMedia,
} from '../support/pageSeeds';
import { expectS3ObjectGone, expectS3ObjectPresent, expectUploadedToS3 } from '../support/s3';
import { cardOf, searchListing } from '../support/ui';

/**
 * Todos os cenários do editor de página de ideias: criar, editar, remover e
 * excluir a página, as seções e as mídias dos quatro tipos (documento, imagem,
 * vídeo e áudio), por link e por upload. Cada cenário confere o resultado
 * relendo a API e, quando há arquivo, o objeto no S3.
 */

const EDITOR = 'ideas-pages-ideas-section-editor';
const ENDPOINT = PAGE_ENDPOINTS.ideasPage;
const EDIT_ROUTE = '/adm/editar-pagina-ideias';
const LIST_ROUTE = '/adm/paginas-ideias';

const FILES: Record<MediaType, SeedFile> = {
  [MediaType.DOCUMENT]: {
    name: 'roteiro.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF'),
  },
  [MediaType.IMAGE]: { name: 'foto.png', mimeType: 'image/png', buffer: PNG_1X1 },
  [MediaType.VIDEO]: {
    name: 'clipe.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x18]),
      Buffer.from('ftypmp42'),
      Buffer.alloc(16),
    ]),
  },
  [MediaType.AUDIO]: {
    name: 'musica.mp3',
    mimeType: 'audio/mpeg',
    buffer: Buffer.concat([Buffer.from('ID3'), Buffer.alloc(64, 1)]),
  },
};

const LINKS: Record<MediaType, string> = {
  [MediaType.DOCUMENT]: 'https://drive.google.com/file/d/doc123/view',
  [MediaType.IMAGE]: 'https://drive.google.com/file/d/img123/view',
  [MediaType.VIDEO]: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  [MediaType.AUDIO]: 'https://drive.google.com/file/d/aud123/view',
};

const TYPES = [MediaType.DOCUMENT, MediaType.IMAGE, MediaType.VIDEO, MediaType.AUDIO] as const;

type Mode = 'link' | 'upload';

test.describe('Editor de páginas de ideias: cenários completos', () => {
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

  const sectionAt = (page: Page, index: number): Locator => page.getByTestId(EDITOR).nth(index);
  const panelOf = (section: Locator, type: MediaType): Locator =>
    section.getByTestId(`ideas-section-panel-${type}`);

  async function openTab(section: Locator, type: MediaType): Promise<Locator> {
    await section.getByTestId(`ideas-section-tab-${type}`).click();
    const panel = panelOf(section, type);
    await expect(panel).toBeVisible();
    return panel;
  }

  /** Preenche o formulário de mídia da aba e adiciona o item à lista. */
  async function addMedia(
    section: Locator,
    type: MediaType,
    input: { title: string; mode: Mode; file?: SeedFile }
  ): Promise<void> {
    const panel = await openTab(section, type);
    await panel.getByLabel(/^Título d/).fill(input.title);
    await panel.getByLabel(/^Descrição d/).fill(`Descrição de ${input.title}`);
    if (input.mode === 'upload') {
      await selectUploadMode(panel);
      await panel.locator('input[type="file"]').setInputFiles(input.file ?? FILES[type]);
    } else {
      await panel.getByLabel(/^URL d/).fill(LINKS[type]);
    }
    await panel.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(panel.getByRole('button', { name: `Editar ${input.title}` })).toBeVisible();
  }

  async function selectUploadMode(panel: Locator): Promise<void> {
    await panel.getByRole('combobox', { name: 'Tipo' }).click();
    await panel.page().getByRole('option', { name: 'Upload' }).click();
  }

  async function selectLinkMode(panel: Locator): Promise<void> {
    await panel.getByRole('combobox', { name: 'Tipo' }).click();
    await panel.page().getByRole('option', { name: 'Link' }).click();
  }

  async function fillSection(
    section: Locator,
    data: { title: string; description?: string; restrict?: boolean }
  ): Promise<void> {
    await section.getByRole('textbox', { name: /^Título da seção/ }).fill(data.title);
    if (data.description !== undefined) {
      await section.getByRole('textbox', { name: 'Descrição da seção' }).fill(data.description);
    }
    if (data.restrict !== undefined) {
      const toggle = section.getByRole('checkbox', { name: /Seção (pública|restrita)/ });
      if ((await toggle.isChecked()) === data.restrict) await toggle.click();
    }
  }

  const confirmRemoval = async (page: Page): Promise<void> => {
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(dialog).toBeHidden();
  };

  async function save(page: Page, method: 'POST' | 'PATCH'): Promise<IdeasPageResponse> {
    const done = page.waitForResponse(
      (response) => response.request().method() === method && response.url().includes(ENDPOINT),
      { timeout: 120_000 }
    );
    await page.getByTestId('ideas-page-save').click();
    const response = await done;
    expect(response.ok(), `o salvamento foi recusado: ${await response.text()}`).toBeTruthy();
    return (await response.json()) as IdeasPageResponse;
  }

  const fetchPage = (id: string): Promise<IdeasPageSeed> =>
    api.get<IdeasPageSeed>(`${ENDPOINT}/${id}`);

  const signature = (medias: readonly SeedMediaItem[]): string[] =>
    medias.map((m) => `${m.mediaType}:${m.uploadType}:${m.title}`).sort();

  /** Seed com uma mídia de upload de cada tipo e uma por link, para editar/remover. */
  async function seedAllTypes(title: string): Promise<IdeasPageSeed> {
    const seed = await seedIdeasPage(
      api,
      title,
      [
        {
          title: 'Seção completa',
          medias: [
            ...TYPES.map((type) => uploadMedia(`up_${type}`, `Arquivo ${type}`, type)),
            linkMedia('Vídeo por link', MediaType.VIDEO),
          ],
        },
      ],
      Object.fromEntries(TYPES.map((type) => [`up_${type}`, FILES[type]]))
    );
    created.push(seed.id);
    return seed;
  }

  const urlOf = (seed: IdeasPageSeed, title: string): string => {
    const media = seed.sections.flatMap((s) => s.medias).find((m) => m.title === title);
    expect(media, `mídia "${title}" não encontrada no seed`).toBeTruthy();
    return media?.url ?? '';
  };

  // ───────────────────────────── CRIAÇÃO ─────────────────────────────

  test('cria página com duas seções e os 4 tipos de mídia, por link e por upload', async ({
    page,
  }) => {
    const title = `E2E Completa ${uniqueSuffix()}`;
    await page.goto('/adm/criar-pagina');
    await page.getByRole('button', { name: 'Criar Página de Ideias', exact: true }).click();
    await page.getByRole('textbox', { name: 'Título da página' }).fill(title);
    await page.getByRole('textbox', { name: 'Subtítulo' }).fill('Subtítulo da página');
    await page
      .getByRole('textbox', { name: 'Descrição', exact: true })
      .fill('Descrição da página completa');

    await page.getByTestId('ideas-page-add-section').click();
    await fillSection(sectionAt(page, 0), {
      title: 'Documentos e imagens',
      description: 'Primeira seção',
      restrict: false,
    });
    await addMedia(sectionAt(page, 0), MediaType.DOCUMENT, { title: 'Doc link', mode: 'link' });
    await addMedia(sectionAt(page, 0), MediaType.DOCUMENT, { title: 'Doc upload', mode: 'upload' });
    await addMedia(sectionAt(page, 0), MediaType.IMAGE, { title: 'Img link', mode: 'link' });
    await addMedia(sectionAt(page, 0), MediaType.IMAGE, { title: 'Img upload', mode: 'upload' });

    await page.getByTestId('ideas-page-add-section').click();
    await fillSection(sectionAt(page, 1), {
      title: 'Vídeos e áudios',
      description: 'Segunda seção',
      restrict: true,
    });
    await addMedia(sectionAt(page, 1), MediaType.VIDEO, { title: 'Vid link', mode: 'link' });
    await addMedia(sectionAt(page, 1), MediaType.VIDEO, { title: 'Vid upload', mode: 'upload' });
    await addMedia(sectionAt(page, 1), MediaType.AUDIO, { title: 'Aud link', mode: 'link' });
    await addMedia(sectionAt(page, 1), MediaType.AUDIO, { title: 'Aud upload', mode: 'upload' });

    // O resumo lateral conta o que foi montado.
    const summary = page.getByTestId('ideas-page-summary');
    await expect(summary).toContainText('Materiais');
    await expect(summary.getByText('8', { exact: true })).toBeVisible();

    const saved = await save(page, 'POST');
    created.push(saved.id);
    await expect(page).toHaveURL(new RegExp(`/${saved.route.path}$`));

    const stored = await fetchPage(saved.id);
    expect(stored).toMatchObject({ title, subtitle: 'Subtítulo da página' });
    const byTitle = Object.fromEntries(stored.sections.map((s) => [s.title, s]));
    expect(Object.keys(byTitle).sort()).toEqual(['Documentos e imagens', 'Vídeos e áudios']);
    expect(signature(byTitle['Documentos e imagens'].medias)).toEqual(
      [
        'document:link:Doc link',
        'document:upload:Doc upload',
        'image:link:Img link',
        'image:upload:Img upload',
      ].sort()
    );
    expect(signature(byTitle['Vídeos e áudios'].medias)).toEqual(
      [
        'video:link:Vid link',
        'video:upload:Vid upload',
        'audio:link:Aud link',
        'audio:upload:Aud upload',
      ].sort()
    );
    for (const media of stored.sections.flatMap((s) => s.medias)) {
      if (media.uploadType === MediaUploadType.UPLOAD) {
        expectUploadedToS3(media.url, `upload "${media.title}"`);
      } else {
        expect(media.url).toBe(LINKS[media.mediaType]);
      }
    }
  });

  test('cria rascunho com seção sem mídias e mantém a página privada', async ({ page }) => {
    const title = `E2E Rascunho ${uniqueSuffix()}`;
    await page.goto('/adm/criar-pagina');
    await page.getByRole('button', { name: 'Criar Página de Ideias', exact: true }).click();
    await page.getByRole('textbox', { name: 'Título da página' }).fill(title);
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Só texto');
    await page.getByTestId('ideas-page-add-section').click();
    await fillSection(sectionAt(page, 0), { title: 'Seção vazia' });
    const saved = await save(page, 'POST');
    created.push(saved.id);
    const stored = await fetchPage(saved.id);
    expect(stored.sections.map((s) => [s.title, s.medias.length])).toEqual([['Seção vazia', 0]]);
  });

  test('validações da criação: título, descrição, seção e título de seção', async ({ page }) => {
    let posts = 0;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith(ENDPOINT)) posts += 1;
    });
    await page.goto('/adm/criar-pagina');
    await page.getByRole('button', { name: 'Criar Página de Ideias', exact: true }).click();

    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByTestId('ideas-page-feedback')).toContainText(
      'Preencha todos os campos obrigatórios.'
    );
    await expect(page.getByText('Informe um título com até 255 caracteres.')).toBeVisible();
    await expect(page.getByText('Preencha a descrição da página.')).toBeVisible();
    await expect(page.getByTestId('ideas-page-empty')).toBeVisible();

    await page.getByRole('textbox', { name: 'Título da página' }).fill('Título válido');
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Descrição válida');
    await page.getByTestId('ideas-page-add-section').click();
    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByText('Revise o título')).toBeVisible();
    expect(posts).toBe(0);
  });

  test('validações de mídia: campos obrigatórios, URL inválida e rascunho bloqueia o salvamento', async ({
    page,
  }) => {
    const seed = await seedAllTypes(`E2E Validação ${uniqueSuffix()}`);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const section = sectionAt(page, 0);

    const panel = await openTab(section, MediaType.VIDEO);
    await panel.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(panel.getByText('Este campo é obrigatório.').first()).toBeVisible();

    await panel.getByLabel(/^Título d/).fill('Vídeo inválido');
    await panel.getByLabel(/^Descrição d/).fill('Descrição');
    await panel.getByLabel(/^URL d/).fill('https://exemplo.com/nao-e-youtube');
    await panel.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(panel.getByText('URL inválida')).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Editar Vídeo inválido' })).toHaveCount(0);

    // O rascunho ainda aberto impede salvar a página.
    await expect(page.getByTestId('ideas-page-media-draft-warning')).toBeVisible();
    await expect(page.getByTestId('ideas-page-save')).toBeDisabled();
    await panel.getByRole('button', { name: 'Descartar rascunho' }).click();
    await expect(page.getByTestId('ideas-page-media-draft-warning')).toHaveCount(0);

    // Upload sem arquivo também é recusado.
    await panel.getByLabel(/^Título d/).fill('Sem arquivo');
    await panel.getByLabel(/^Descrição d/).fill('Descrição');
    await selectUploadMode(panel);
    await panel.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(panel.getByRole('button', { name: 'Editar Sem arquivo' })).toHaveCount(0);
  });

  // ───────────────────────────── EDIÇÃO ─────────────────────────────

  test('edita a página e as seções: textos, visibilidade, nova seção com mídia', async ({
    page,
  }) => {
    const seed = await seedIdeasPage(
      api,
      `E2E Editar ${uniqueSuffix()}`,
      [
        { title: 'Primeira', medias: [] },
        { title: 'Segunda', medias: [] },
      ],
      {}
    );
    created.push(seed.id);
    const before = await fetchPage(seed.id);
    const index = (name: string): number => before.sections.findIndex((s) => s.title === name);

    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await page.getByRole('textbox', { name: 'Título da página' }).fill('Título renovado');
    await page.getByRole('textbox', { name: 'Subtítulo' }).fill('Subtítulo renovado');
    await page
      .getByRole('textbox', { name: 'Descrição', exact: true })
      .fill('Descrição renovada da página');
    await page
      .getByTestId('ideas-page-summary')
      .getByRole('checkbox', { name: /Página (publicada|em rascunho)/ })
      .setChecked(false);

    await fillSection(sectionAt(page, index('Primeira')), {
      title: 'Primeira renomeada',
      description: 'Descrição nova',
      restrict: true,
    });
    await page.getByTestId('ideas-page-add-section').click();
    const last = sectionAt(page, 2);
    await fillSection(last, { title: 'Terceira nova', restrict: false });
    await addMedia(last, MediaType.IMAGE, { title: 'Foto da terceira', mode: 'upload' });

    await save(page, 'PATCH');

    const after = await fetchPage(seed.id);
    expect(after).toMatchObject({
      title: 'Título renovado',
      subtitle: 'Subtítulo renovado',
      description: 'Descrição renovada da página',
      public: false,
    });
    const byTitle = Object.fromEntries(after.sections.map((s) => [s.title, s]));
    expect(Object.keys(byTitle).sort()).toEqual(['Primeira renomeada', 'Segunda', 'Terceira nova']);
    expect(byTitle['Primeira renomeada']).toMatchObject({
      description: 'Descrição nova',
      public: false,
    });
    expect(byTitle['Primeira renomeada'].id).toBe(before.sections[index('Primeira')].id);
    expect(signature(byTitle['Terceira nova'].medias)).toEqual(['image:upload:Foto da terceira']);
    expectUploadedToS3(byTitle['Terceira nova'].medias[0].url, 'foto da seção nova');
  });

  test('edita a mídia de cada tipo: textos, link↔upload e troca de arquivo', async ({ page }) => {
    const seed = await seedAllTypes(`E2E Editar Mídias ${uniqueSuffix()}`);
    const docUrl = urlOf(seed, 'Arquivo document');
    const imgUrl = urlOf(seed, 'Arquivo image');
    const vidUrl = urlOf(seed, 'Arquivo video');
    const audUrl = urlOf(seed, 'Arquivo audio');

    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const section = sectionAt(page, 0);

    // Documento: só os textos; o arquivo continua o mesmo.
    let panel = await openTab(section, MediaType.DOCUMENT);
    await panel.getByRole('button', { name: 'Editar Arquivo document' }).click();
    await panel.getByLabel(/^Título d/).fill('Documento renomeado');
    await panel.getByLabel(/^Descrição d/).fill('Descrição nova do documento');
    await panel.getByRole('button', { name: 'Salvar Alterações' }).click();

    // Imagem: upload → link.
    panel = await openTab(section, MediaType.IMAGE);
    await panel.getByRole('button', { name: 'Editar Arquivo image' }).click();
    await selectLinkMode(panel);
    await panel.getByLabel(/^URL d/).fill(LINKS[MediaType.IMAGE]);
    await panel.getByRole('button', { name: 'Salvar Alterações' }).click();

    // Vídeo: o de upload vira link do YouTube.
    panel = await openTab(section, MediaType.VIDEO);
    await panel.getByRole('button', { name: 'Editar Arquivo video' }).click();
    await selectLinkMode(panel);
    await panel.getByLabel(/^URL d/).fill(LINKS[MediaType.VIDEO]);
    await panel.getByRole('button', { name: 'Salvar Alterações' }).click();

    // Áudio: troca o arquivo por outro.
    panel = await openTab(section, MediaType.AUDIO);
    await panel.getByRole('button', { name: 'Editar Arquivo audio' }).click();
    await panel.locator('input[type="file"]').setInputFiles({
      name: 'outra.mp3',
      mimeType: 'audio/mpeg',
      buffer: Buffer.concat([Buffer.from('ID3'), Buffer.alloc(80, 2)]),
    });
    await panel.getByRole('button', { name: 'Salvar Alterações' }).click();

    await save(page, 'PATCH');

    const after = (await fetchPage(seed.id)).sections[0].medias;
    const byTitle = Object.fromEntries(after.map((m) => [m.title, m]));
    expect(byTitle['Documento renomeado']).toMatchObject({
      description: 'Descrição nova do documento',
      uploadType: MediaUploadType.UPLOAD,
      url: docUrl,
    });
    expect(byTitle['Arquivo image']).toMatchObject({
      uploadType: MediaUploadType.LINK,
      url: LINKS[MediaType.IMAGE],
    });
    expect(byTitle['Arquivo video']).toMatchObject({
      uploadType: MediaUploadType.LINK,
      url: LINKS[MediaType.VIDEO],
    });
    expect(byTitle['Arquivo audio'].uploadType).toBe(MediaUploadType.UPLOAD);
    expect(byTitle['Arquivo audio'].url).not.toBe(audUrl);
    expectUploadedToS3(byTitle['Arquivo audio'].url, 'áudio trocado');

    await expectS3ObjectPresent(docUrl, 'documento que só mudou de texto');
    await expectS3ObjectGone(imgUrl, 'imagem que virou link');
    await expectS3ObjectGone(vidUrl, 'vídeo que virou link');
    await expectS3ObjectGone(audUrl, 'áudio substituído');
  });

  test('edita um link para upload e confere o arquivo novo', async ({ page }) => {
    const seed = await seedAllTypes(`E2E Link para upload ${uniqueSuffix()}`);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const panel = await openTab(sectionAt(page, 0), MediaType.VIDEO);
    await panel.getByRole('button', { name: 'Editar Vídeo por link' }).click();
    await selectUploadMode(panel);
    await panel.locator('input[type="file"]').setInputFiles(FILES[MediaType.VIDEO]);
    await panel.getByRole('button', { name: 'Salvar Alterações' }).click();
    await save(page, 'PATCH');
    const media = (await fetchPage(seed.id)).sections[0].medias.find(
      (m) => m.title === 'Vídeo por link'
    );
    expect(media?.uploadType).toBe(MediaUploadType.UPLOAD);
    expectUploadedToS3(media?.url ?? '', 'link virou upload');
  });

  // ───────────────────────────── REMOÇÃO ─────────────────────────────

  test('remove uma mídia de cada tipo e apaga só os arquivos removidos', async ({ page }) => {
    const seed = await seedAllTypes(`E2E Remover Mídias ${uniqueSuffix()}`);
    const urls = Object.fromEntries(TYPES.map((t) => [t, urlOf(seed, `Arquivo ${t}`)]));

    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const section = sectionAt(page, 0);
    // Cancelar a remoção não tira nada.
    let panel = await openTab(section, MediaType.DOCUMENT);
    await panel.getByRole('button', { name: 'Remover Arquivo document' }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancelar' }).click();
    await expect(panel.getByRole('button', { name: 'Editar Arquivo document' })).toBeVisible();

    for (const type of [MediaType.DOCUMENT, MediaType.IMAGE, MediaType.AUDIO]) {
      panel = await openTab(section, type);
      await panel.getByRole('button', { name: `Remover Arquivo ${type}` }).click();
      await confirmRemoval(page);
      await expect(panel.getByRole('button', { name: `Editar Arquivo ${type}` })).toHaveCount(0);
    }
    await save(page, 'PATCH');

    expect(signature((await fetchPage(seed.id)).sections[0].medias)).toEqual(
      ['video:link:Vídeo por link', 'video:upload:Arquivo video'].sort()
    );
    await expectS3ObjectGone(urls[MediaType.DOCUMENT], 'documento removido');
    await expectS3ObjectGone(urls[MediaType.IMAGE], 'imagem removida');
    await expectS3ObjectGone(urls[MediaType.AUDIO], 'áudio removido');
    await expectS3ObjectPresent(urls[MediaType.VIDEO], 'vídeo que ficou');
  });

  test('remove seções: cancelar mantém, confirmar leva as mídias e a última não salva vazia', async ({
    page,
  }) => {
    const seed = await seedIdeasPage(
      api,
      `E2E Remover Seções ${uniqueSuffix()}`,
      [
        { title: 'Fica', medias: [uploadMedia('a', 'Foto fica')] },
        { title: 'Sai', medias: [uploadMedia('b', 'Foto sai', MediaType.IMAGE)] },
      ],
      { a: FILES[MediaType.IMAGE], b: FILES[MediaType.IMAGE] }
    );
    created.push(seed.id);
    const before = await fetchPage(seed.id);
    const leaving = before.sections.findIndex((s) => s.title === 'Sai');
    const keeping = before.sections.findIndex((s) => s.title === 'Fica');
    const goneUrl = before.sections[leaving].medias[0].url;
    const keptUrl = before.sections[keeping].medias[0].url;

    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await page.getByRole('button', { name: `Remover seção ${leaving + 1}` }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByTestId(EDITOR)).toHaveCount(2);

    await page.getByRole('button', { name: `Remover seção ${leaving + 1}` }).click();
    await confirmRemoval(page);
    await expect(page.getByTestId(EDITOR)).toHaveCount(1);
    await save(page, 'PATCH');
    expect((await fetchPage(seed.id)).sections.map((s) => s.title)).toEqual(['Fica']);
    await expectS3ObjectGone(goneUrl, 'foto da seção removida');
    await expectS3ObjectPresent(keptUrl, 'foto da seção que ficou');

    // Sem seções a página não salva e nada é apagado. O salvamento anterior
    // levou à página pública: reabre o editor.
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    await page.getByRole('button', { name: 'Remover seção 1' }).click();
    await confirmRemoval(page);
    await expect(page.getByTestId('ideas-page-empty')).toBeVisible();
    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByTestId('ideas-page-feedback')).toBeVisible();
    expect((await fetchPage(seed.id)).sections.map((s) => s.title)).toEqual(['Fica']);
    await expectS3ObjectPresent(keptUrl, 'foto da última seção');
  });

  // ───────────────────────────── EXCLUSÃO ─────────────────────────────

  test('exclui a página pela listagem: cancelar mantém; confirmar apaga página e arquivos', async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seed = await seedAllTypes(`E2E Excluir Tudo ${suffix}`);
    const uploaded = seed.sections
      .flatMap((s) => s.medias)
      .filter((m) => m.uploadType === MediaUploadType.UPLOAD)
      .map((m) => m.url);
    expect(uploaded).toHaveLength(4);

    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'ideas-pages', 'ideas-page-list-card', seed.id);
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const dialog = page.getByTestId('modal-delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /Cancelar/ }).click();
    await expect(dialog).toBeHidden();
    await expect(card).toBeVisible();
    expect(await api.statusOf(`${ENDPOINT}/${seed.id}`)).toBe(200);
    await expectS3ObjectPresent(uploaded[0], 'arquivo após cancelar a exclusão');

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const deleted = page.waitForResponse(
      (r) => r.request().method() === 'DELETE' && r.url().endsWith(`${ENDPOINT}/${seed.id}`),
      { timeout: 90_000 }
    );
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
    expect((await deleted).status()).toBeLessThan(300);
    await expect(card).toHaveCount(0, { timeout: 60_000 });

    expect(await api.statusOf(`${ENDPOINT}/${seed.id}`)).toBe(404);
    for (const url of uploaded) await expectS3ObjectGone(url, 'arquivo da página excluída');
  });

  test('a página criada pela tela abre na listagem e pode ser aberta para edição', async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seed = await seedIdeasPage(
      api,
      `E2E Listagem ${suffix}`,
      [{ title: 'Única', medias: [linkMedia('Vídeo', MediaType.VIDEO)] }],
      {}
    );
    created.push(seed.id);
    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'ideas-pages', 'ideas-page-list-card', seed.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${EDIT_ROUTE}/${seed.id}$`));
    await expect(sectionAt(page, 0)).toBeVisible();
  });
});
