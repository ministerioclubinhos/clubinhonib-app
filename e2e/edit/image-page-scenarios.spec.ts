import { expect, Locator, Page, test } from '@playwright/test';

import { MediaUploadType } from '@/store/slices/types';
import type { ImagePageResponse } from '@/features/image-pages/types';

import { ApiClient, PNG_1X1, uniqueSuffix } from '../support/api';
import {
  ImagePageSeed,
  PAGE_ENDPOINTS,
  PAGE_PAYLOAD_FIELDS,
  SeedMediaItem,
  seedImagePage,
  uploadMedia,
} from '../support/pageSeeds';
import { expectS3ObjectGone, expectS3ObjectPresent, expectUploadedToS3 } from '../support/s3';
import { cardOf, searchListing } from '../support/ui';

/**
 * Todos os cenários do editor de galeria de fotos: criar, editar, remover e
 * excluir a galeria, as seções e as imagens. Cada cenário confere o resultado
 * relendo a API e, quando há arquivo, o objeto no S3. Os de recusa provam as
 * regras do back diretamente na API.
 */

const EDITOR = 'image-pages-image-section-editor';
const ENDPOINT = PAGE_ENDPOINTS.imagePage;
const FIELD = PAGE_PAYLOAD_FIELDS.imagePage;
const EDIT_ROUTE = '/adm/editar-pagina-imagens';
const LIST_ROUTE = '/adm/paginas-fotos';

const png = (name: string) => ({ name, mimeType: 'image/png', buffer: PNG_1X1 });

test.describe('Editor de galeria de fotos: cenários completos', () => {
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
  const cardTitled = (section: Locator, title: string): Locator =>
    section.getByTestId('image-pages-image-card').filter({ hasText: title });

  /**
   * Abre a edição de uma galeria salva. As seções chegam recolhidas; os
   * cenários que mexem no conteúdo precisam delas abertas.
   */
  async function openEditor(page: Page, id: string): Promise<void> {
    await page.goto(`${EDIT_ROUTE}/${id}`);
    const toggles = page.getByTestId('image-section-toggle');
    await expect(toggles.first()).toBeVisible();
    for (const toggle of await toggles.all()) {
      if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
    }
  }

  async function openTemplate(page: Page): Promise<void> {
    await page.goto('/adm/criar-pagina');
    const picker = page.getByTestId('adm-page-creator-select-page-template-selec-page-template');
    await expect(picker).toBeVisible();
    await picker.getByRole('button', { name: 'Criar Galeria de Fotos' }).click();
  }

  async function fillSection(
    section: Locator,
    data: { caption: string; description?: string; restrict?: boolean }
  ): Promise<void> {
    await section.getByRole('textbox', { name: 'Legenda da seção' }).fill(data.caption);
    if (data.description !== undefined) {
      await section.getByRole('textbox', { name: 'Descrição da seção' }).fill(data.description);
    }
    if (data.restrict !== undefined) {
      const toggle = section.getByRole('checkbox', { name: /Seção (pública|restrita)/ });
      if ((await toggle.isChecked()) === data.restrict) await toggle.click();
    }
  }

  /** Abre o diálogo, escolhe as fotos, preenche título/descrição e confirma. */
  async function addImages(
    page: Page,
    section: Locator,
    images: { name: string; title: string; description?: string }[]
  ): Promise<void> {
    await section.getByRole('button', { name: 'Adicionar imagens' }).click();
    const dialog = page.getByTestId('image-pages-add-images-dialog');
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="file"]').setInputFiles(images.map((i) => png(i.name)));
    for (const [index, image] of images.entries()) {
      await dialog
        .getByRole('textbox', { name: 'Título', exact: true })
        .nth(index)
        .fill(image.title);
      if (image.description) {
        await dialog
          .getByRole('textbox', { name: 'Descrição', exact: true })
          .nth(index)
          .fill(image.description);
      }
    }
    await dialog
      .getByRole('button', { name: new RegExp(`^Adicionar \\(${images.length}\\)`) })
      .click();
    await expect(dialog).toBeHidden();
  }

  const confirmRemoval = async (page: Page): Promise<void> => {
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(dialog).toBeHidden();
  };

  async function save(page: Page, method: 'POST' | 'PATCH'): Promise<ImagePageResponse> {
    const done = page.waitForResponse(
      (r) => r.request().method() === method && r.url().includes(ENDPOINT),
      { timeout: 120_000 }
    );
    await page.getByTestId('image-page-save').click();
    const response = await done;
    expect(response.ok(), `o salvamento foi recusado: ${await response.text()}`).toBeTruthy();
    return (await response.json()) as ImagePageResponse;
  }

  const fetchPage = (id: string): Promise<ImagePageSeed> =>
    api.get<ImagePageSeed>(`${ENDPOINT}/${id}`);

  const titles = (medias: readonly SeedMediaItem[]): string[] => medias.map((m) => m.title).sort();

  async function seedSimple(title: string, sections = 2): Promise<ImagePageSeed> {
    const seed = await seedImagePage(
      api,
      title,
      Array.from({ length: sections }, (_, i) => ({
        caption: `Seção ${i + 1}`,
        mediaItems: [
          uploadMedia(`f${i}a`, `Foto ${i + 1}A`),
          uploadMedia(`f${i}b`, `Foto ${i + 1}B`),
        ],
      })),
      Object.fromEntries(
        Array.from({ length: sections }, (_, i) => [
          [`f${i}a`, png(`a${i}.png`)],
          [`f${i}b`, png(`b${i}.png`)],
        ]).flat()
      )
    );
    created.push(seed.id);
    return seed;
  }

  // ───────────────────────────── CRIAÇÃO ─────────────────────────────

  test('cria galeria com duas seções e várias fotos pela tela', async ({ page }) => {
    const title = `E2E Galeria ${uniqueSuffix()}`;
    await openTemplate(page);
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill(title);
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Fotos do evento');

    await page.getByTestId('image-page-add-section').click();
    await fillSection(sectionAt(page, 0), {
      caption: 'Abertura',
      description: 'Primeiras fotos',
      restrict: false,
    });
    await addImages(page, sectionAt(page, 0), [
      { name: 'a.png', title: 'Chegada', description: 'Todos chegando' },
      { name: 'b.png', title: 'Oração' },
    ]);

    await page.getByTestId('image-page-add-section').click();
    await fillSection(sectionAt(page, 1), { caption: 'Brincadeiras', restrict: true });
    await addImages(page, sectionAt(page, 1), [{ name: 'c.png', title: 'Corrida' }]);

    const summary = page.getByTestId('image-page-summary');
    await expect(summary.getByText('3', { exact: true })).toBeVisible();

    const saved = await save(page, 'POST');
    created.push(saved.id);
    await expect(page).toHaveURL(new RegExp(`/${saved.route.path}$`));

    const stored = await fetchPage(saved.id);
    expect(stored).toMatchObject({ title, description: 'Fotos do evento' });
    const byCaption = Object.fromEntries(stored.sections.map((s) => [s.caption, s]));
    expect(Object.keys(byCaption).sort()).toEqual(['Abertura', 'Brincadeiras']);
    expect(titles(byCaption['Abertura'].mediaItems)).toEqual(['Chegada', 'Oração']);
    expect(titles(byCaption['Brincadeiras'].mediaItems)).toEqual(['Corrida']);
    expect(byCaption['Abertura'].mediaItems.find((m) => m.title === 'Chegada')).toMatchObject({
      description: 'Todos chegando',
    });
    for (const media of stored.sections.flatMap((s) => s.mediaItems)) {
      expect(media.uploadType).toBe(MediaUploadType.UPLOAD);
      expectUploadedToS3(media.url, `foto "${media.title}"`);
    }
  });

  test('diálogo de fotos: remove uma escolhida, recusa arquivo que não é imagem e cancela sem adicionar', async ({
    page,
  }) => {
    await openTemplate(page);
    await page.getByTestId('image-page-add-section').click();
    const section = sectionAt(page, 0);
    await section.getByRole('button', { name: 'Adicionar imagens' }).click();
    const dialog = page.getByTestId('image-pages-add-images-dialog');

    await dialog
      .locator('input[type="file"]')
      .setInputFiles([
        png('boa.png'),
        png('descartar.png'),
        { name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('oi') },
      ]);
    await expect(dialog.getByTestId('image-pages-add-images-rejected')).toContainText('nota.txt');
    await expect(dialog.getByRole('textbox', { name: 'Título', exact: true })).toHaveCount(2);
    await dialog.getByRole('button', { name: 'Remover descartar' }).click();
    await expect(dialog.getByRole('textbox', { name: 'Título', exact: true })).toHaveCount(1);

    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(dialog).toBeHidden();
    await expect(section.getByText('Nenhuma imagem nesta seção ainda.')).toBeVisible();
  });

  test('cria galeria só com seção vazia e valida título, descrição e seção antes de enviar', async ({
    page,
  }) => {
    let posts = 0;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().endsWith(ENDPOINT)) posts += 1;
    });
    await openTemplate(page);
    await page.getByTestId('image-page-save').click();
    await expect(page.getByTestId('image-page-feedback')).toContainText(
      'Preencha todos os campos obrigatórios.'
    );
    await expect(page.getByText('Informe um título com até 255 caracteres.')).toBeVisible();
    await expect(page.getByText('Preencha a descrição da galeria.')).toBeVisible();
    await expect(page.getByTestId('image-page-empty')).toBeVisible();
    expect(posts).toBe(0);

    const title = `E2E Só texto ${uniqueSuffix()}`;
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill(title);
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Sem fotos ainda');
    await page.getByTestId('image-page-add-section').click();
    await fillSection(sectionAt(page, 0), { caption: 'Só legenda' });
    const saved = await save(page, 'POST');
    created.push(saved.id);
    expect(
      (await fetchPage(saved.id)).sections.map((s) => [s.caption, s.mediaItems.length])
    ).toEqual([['Só legenda', 0]]);
  });

  test('a API recusa corpo inválido: título em branco, sem seções, link inválido e arquivo ausente', async () => {
    const base = (over: Record<string, unknown>) =>
      JSON.stringify({
        title: 'Galeria',
        description: 'Descrição',
        public: true,
        sections: [{ caption: 'Seção', description: '', public: true, mediaItems: [] }],
        ...over,
      });
    const post = (body: string, files = {}) =>
      api.sendMultipart('POST', ENDPOINT, { [FIELD]: body }, files);

    const blank = await post(base({ title: '   ' }));
    expect(blank.status).toBe(422);
    expect(blank.fieldErrors.map((e) => e.field)).toContain('title');
    expect(blank.message).toContain('Galeria · Título');

    const noSections = await post(base({ sections: [] }));
    expect(noSections.status).toBe(422);
    expect(noSections.message).toContain('Adicione ao menos uma seção.');

    const badLink = await post(
      base({
        sections: [
          {
            caption: 'S',
            description: '',
            public: true,
            mediaItems: [
              {
                title: 'Link ruim',
                description: '',
                uploadType: 'link',
                mediaType: 'image',
                isLocalFile: false,
                url: 'javascript:alert(1)',
              },
            ],
          },
        ],
      })
    );
    expect(badLink.status).toBeGreaterThanOrEqual(400);
    expect(badLink.message).toContain('link HTTP ou HTTPS');

    const missingFile = await post(
      base({
        sections: [
          {
            caption: 'S',
            description: '',
            public: true,
            mediaItems: [
              {
                title: 'Sem arquivo',
                description: '',
                uploadType: 'upload',
                mediaType: 'image',
                isLocalFile: true,
                fieldKey: 'nao_enviado',
              },
            ],
          },
        ],
      })
    );
    expect(missingFile.status).toBeGreaterThanOrEqual(400);
    expect(missingFile.message).toContain('Arquivo ausente');

    const wrongSection = await seedSimple(`E2E Recusa ${uniqueSuffix()}`, 1);
    const stored = await fetchPage(wrongSection.id);
    const foreignId = await api.sendMultipart(
      'PATCH',
      `${ENDPOINT}/${wrongSection.id}`,
      {
        [FIELD]: JSON.stringify({
          id: wrongSection.id,
          title: 'T',
          description: 'D',
          public: true,
          sections: [
            {
              id: '00000000-0000-4000-8000-000000000000',
              caption: 'x',
              description: '',
              public: true,
              mediaItems: [],
            },
          ],
        }),
      },
      {}
    );
    expect(foreignId.status).toBeGreaterThanOrEqual(400);
    expect(foreignId.message).toContain('Identificador de seção inválido');
    // A recusa não mexeu em nada.
    expect((await fetchPage(wrongSection.id)).sections.map((s) => s.id)).toEqual(
      stored.sections.map((s) => s.id)
    );
  });

  // ───────────────────────────── EDIÇÃO ─────────────────────────────

  test('edita a galeria e as seções: textos, visibilidade, nova seção com fotos', async ({
    page,
  }) => {
    const seed = await seedSimple(`E2E Editar ${uniqueSuffix()}`);
    const before = await fetchPage(seed.id);
    const first = before.sections.findIndex((s) => s.caption === 'Seção 1');

    await openEditor(page, seed.id);
    await page.getByRole('textbox', { name: 'Título da galeria' }).fill('Título novo da galeria');
    await page.getByRole('textbox', { name: 'Descrição', exact: true }).fill('Descrição nova');
    await page
      .getByTestId('image-page-summary')
      .getByRole('checkbox', { name: /Página/ })
      .setChecked(false);

    await fillSection(sectionAt(page, first), {
      caption: 'Primeira renomeada',
      description: 'Descrição da primeira',
      restrict: true,
    });
    await page.getByTestId('image-page-add-section').click();
    const last = sectionAt(page, 2);
    await fillSection(last, { caption: 'Terceira nova' });
    await addImages(page, last, [{ name: 'n.png', title: 'Foto nova' }]);

    await save(page, 'PATCH');

    const after = await fetchPage(seed.id);
    expect(after).toMatchObject({
      title: 'Título novo da galeria',
      description: 'Descrição nova',
      public: false,
    });
    const byCaption = Object.fromEntries(after.sections.map((s) => [s.caption, s]));
    expect(Object.keys(byCaption).sort()).toEqual([
      'Primeira renomeada',
      'Seção 2',
      'Terceira nova',
    ]);
    expect(byCaption['Primeira renomeada']).toMatchObject({
      description: 'Descrição da primeira',
      public: false,
    });
    expect(byCaption['Primeira renomeada'].id).toBe(before.sections[first].id);
    expect(titles(byCaption['Terceira nova'].mediaItems)).toEqual(['Foto nova']);
    expectUploadedToS3(byCaption['Terceira nova'].mediaItems[0].url, 'foto da seção nova');
  });

  test('edita título e descrição de uma foto salva e acrescenta fotos a uma seção existente', async ({
    page,
  }) => {
    const seed = await seedSimple(`E2E Editar Foto ${uniqueSuffix()}`, 1);
    const keptUrl = seed.sections[0].mediaItems.find((m) => m.title === 'Foto 1A')?.url ?? '';

    await openEditor(page, seed.id);
    const section = sectionAt(page, 0);
    await cardTitled(section, 'Foto 1A')
      .getByRole('button', { name: /^Editar imagem/ })
      .click();
    const dialog = page.getByTestId('image-pages-edit-image-dialog');
    await dialog.getByRole('textbox', { name: 'Título da imagem' }).fill('Foto renomeada');
    await dialog.getByRole('textbox', { name: 'Descrição da imagem' }).fill('Legenda nova da foto');
    await dialog.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(dialog).toBeHidden();
    await expect(cardTitled(section, 'Foto renomeada')).toBeVisible();

    // Cancelar a edição não altera nada.
    await cardTitled(section, 'Foto 1B')
      .getByRole('button', { name: /^Editar imagem/ })
      .click();
    await dialog.getByRole('textbox', { name: 'Título da imagem' }).fill('NÃO DEVE SALVAR');
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    await expect(cardTitled(section, 'Foto 1B')).toBeVisible();

    await addImages(page, section, [{ name: 'extra.png', title: 'Foto extra' }]);
    await save(page, 'PATCH');

    const medias = (await fetchPage(seed.id)).sections[0].mediaItems;
    expect(titles(medias)).toEqual(['Foto 1B', 'Foto extra', 'Foto renomeada']);
    const renamed = medias.find((m) => m.title === 'Foto renomeada');
    expect(renamed).toMatchObject({ description: 'Legenda nova da foto', url: keptUrl });
    await expectS3ObjectPresent(keptUrl, 'foto que só mudou de texto');
  });

  test('visualiza a foto ampliada, inclusive em tela cheia no celular', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const seed = await seedSimple(`E2E Visualizar ${uniqueSuffix()}`, 1);
    await openEditor(page, seed.id);
    const section = sectionAt(page, 0);
    await cardTitled(section, 'Foto 1A')
      .getByRole('button', { name: /^Ampliar imagem/ })
      .click();
    const viewer = page.getByTestId('media-viewer-dialog');
    await expect(viewer.getByTestId('media-viewer-image')).toBeVisible();
    expect((await viewer.boundingBox())?.width).toBeGreaterThanOrEqual(385);
    await viewer.getByRole('button', { name: 'Fechar' }).first().click();
    await expect(viewer).toHaveCount(0);
  });

  test('edição obsoleta: a API recusa de verdade, aponta a seção e preserva o que foi digitado', async ({
    page,
  }) => {
    const seed = await seedSimple(`E2E Obsoleta ${uniqueSuffix()}`);
    const before = await fetchPage(seed.id);
    const stale = before.sections.findIndex((s) => s.caption === 'Seção 2');
    await openEditor(page, seed.id);
    await expect(page.getByTestId(EDITOR)).toHaveCount(2);

    // Outra pessoa remove a segunda seção enquanto este editor está aberto.
    const removal = await api.sendMultipart('PATCH', `${ENDPOINT}/${seed.id}`, {
      [FIELD]: JSON.stringify({
        id: seed.id,
        title: before.title,
        description: 'Galeria criada pelo Playwright',
        public: true,
        sections: before.sections
          .filter((s) => s.caption !== 'Seção 2')
          .map((s) => ({
            id: s.id,
            caption: s.caption,
            description: '',
            public: true,
            mediaItems: s.mediaItems.map((m) => ({
              id: m.id,
              title: m.title,
              description: '',
              uploadType: 'upload',
              mediaType: 'image',
              isLocalFile: true,
              url: m.url,
            })),
          })),
      }),
    });
    expect(removal.status).toBeLessThan(300);

    await page.getByRole('textbox', { name: 'Título da galeria' }).fill('Título preservado');
    await page.getByTestId('image-page-save').click();
    await expect(page.getByTestId('image-page-feedback')).toContainText(
      `Seção ${stale + 1}: Identificador de seção inválido`
    );
    await expect(sectionAt(page, stale).getByTestId('image-section-api-errors')).toContainText(
      'Recarregue a página'
    );
    await expect(sectionAt(page, 1 - stale).getByTestId('image-section-api-errors')).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Título da galeria' })).toHaveValue(
      'Título preservado'
    );
    await expect(page.getByTestId('image-page-save')).toBeEnabled();
    expect((await fetchPage(seed.id)).title).toBe(before.title);

    await page.getByTestId('image-page-add-section').click();
    await expect(page.getByTestId('image-section-api-errors')).toHaveCount(0);
  });

  test('galeria com muitas seções abre recolhida, com busca, índice e expandir todas', async ({
    page,
  }) => {
    const seed = await seedImagePage(
      api,
      `E2E Muitas ${uniqueSuffix()}`,
      Array.from({ length: 8 }, (_, i) => ({
        caption: i === 5 ? 'Passeio ao parque' : `Seção ${i + 1}`,
        mediaItems: [],
      })),
      {}
    );
    created.push(seed.id);
    await page.goto(`${EDIT_ROUTE}/${seed.id}`);
    const toggles = page.getByTestId('image-section-toggle');
    await expect(toggles).toHaveCount(8);
    for (const toggle of await toggles.all())
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await page.getByTestId('image-section-search').fill('parque');
    await expect(page.getByTestId('image-section-search-result')).toContainText('1 de 8');
    await expect(page.locator(`[data-testid="${EDITOR}"]:visible`)).toHaveCount(1);
    await page.getByTestId('image-section-search').fill('');

    await page.getByTestId('section-outline-item').nth(5).click();
    await expect(toggles.nth(5)).toHaveAttribute('aria-expanded', 'true');
    await expect(toggles.nth(4)).toHaveAttribute('aria-expanded', 'false');
    await page.getByTestId('image-sections-expand-all').click();
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('image-sections-collapse-all').click();
    await expect(toggles.nth(5)).toHaveAttribute('aria-expanded', 'false');

    await page.getByTestId('image-page-add-section').click();
    await expect(toggles.nth(8)).toHaveAttribute('aria-expanded', 'true');
  });

  test('recupera falha de carregamento da galeria e funciona em tela estreita', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${EDIT_ROUTE}/00000000-0000-4000-8000-000000000000`);
    await expect(page.getByTestId('image-page-load-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });

  // ───────────────────────────── REMOÇÃO ─────────────────────────────

  test('remove fotos: cancelar mantém, confirmar apaga só o arquivo removido', async ({ page }) => {
    const seed = await seedSimple(`E2E Remover Foto ${uniqueSuffix()}`, 1);
    const medias = seed.sections[0].mediaItems;
    const goneUrl = medias.find((m) => m.title === 'Foto 1B')?.url ?? '';
    const keptUrl = medias.find((m) => m.title === 'Foto 1A')?.url ?? '';

    await openEditor(page, seed.id);
    const section = sectionAt(page, 0);
    await cardTitled(section, 'Foto 1B')
      .getByRole('button', { name: /^Remover imagem/ })
      .click();
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancelar' }).click();
    await expect(cardTitled(section, 'Foto 1B')).toBeVisible();

    await cardTitled(section, 'Foto 1B')
      .getByRole('button', { name: /^Remover imagem/ })
      .click();
    await confirmRemoval(page);
    await expect(cardTitled(section, 'Foto 1B')).toHaveCount(0);
    await save(page, 'PATCH');

    expect(titles((await fetchPage(seed.id)).sections[0].mediaItems)).toEqual(['Foto 1A']);
    await expectS3ObjectGone(goneUrl, 'foto removida');
    await expectS3ObjectPresent(keptUrl, 'foto que ficou');
  });

  test('remove seções: cancelar mantém, confirmar leva as fotos e a última não salva vazia', async ({
    page,
  }) => {
    const seed = await seedSimple(`E2E Remover Seção ${uniqueSuffix()}`);
    const before = await fetchPage(seed.id);
    const leaving = before.sections.findIndex((s) => s.caption === 'Seção 2');
    const keeping = before.sections.findIndex((s) => s.caption === 'Seção 1');
    const goneUrls = before.sections[leaving].mediaItems.map((m) => m.url);
    const keptUrl = before.sections[keeping].mediaItems[0].url;

    await openEditor(page, seed.id);
    await page.getByRole('button', { name: `Remover seção ${leaving + 1}` }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByTestId(EDITOR)).toHaveCount(2);

    await page.getByRole('button', { name: `Remover seção ${leaving + 1}` }).click();
    await confirmRemoval(page);
    await expect(page.getByTestId(EDITOR)).toHaveCount(1);
    await save(page, 'PATCH');
    expect((await fetchPage(seed.id)).sections.map((s) => s.caption)).toEqual(['Seção 1']);
    for (const url of goneUrls) await expectS3ObjectGone(url, 'foto da seção removida');
    await expectS3ObjectPresent(keptUrl, 'foto da seção que ficou');

    // O salvamento levou à página pública: reabre o editor e tira a última seção.
    await openEditor(page, seed.id);
    await page.getByRole('button', { name: 'Remover seção 1' }).click();
    await confirmRemoval(page);
    await expect(page.getByTestId('image-page-empty')).toBeVisible();
    await page.getByTestId('image-page-save').click();
    await expect(page.getByTestId('image-page-feedback')).toBeVisible();
    expect((await fetchPage(seed.id)).sections.map((s) => s.caption)).toEqual(['Seção 1']);
    await expectS3ObjectPresent(keptUrl, 'foto da última seção');
  });

  // ───────────────────────────── EXCLUSÃO ─────────────────────────────

  test('exclui a galeria pela listagem: cancelar mantém; confirmar apaga galeria e arquivos', async ({
    page,
  }) => {
    const suffix = uniqueSuffix();
    const seed = await seedSimple(`E2E Excluir Galeria ${suffix}`);
    const urls = seed.sections.flatMap((s) => s.mediaItems).map((m) => m.url);
    expect(urls).toHaveLength(4);

    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'image-pages', 'image-page-list-card', seed.id);
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
    for (const url of urls) await expectS3ObjectGone(url, 'foto da galeria excluída');
  });

  test('abre a galeria na edição a partir da listagem', async ({ page }) => {
    const suffix = uniqueSuffix();
    const seed = await seedSimple(`E2E Listagem Galeria ${suffix}`, 1);
    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'image-pages', 'image-page-list-card', seed.id);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'Editar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${EDIT_ROUTE}/${seed.id}$`));
    await expect(sectionAt(page, 0)).toBeVisible();
  });
});
