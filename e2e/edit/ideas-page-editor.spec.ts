import { expect, test } from '@playwright/test';
import type { IdeasPageResponse } from '@/features/ideas-pages/types';
import { ApiClient, uniqueSuffix } from '../support/api';

const EDITOR = 'ideas-pages-ideas-section-editor';
const ENDPOINT = '/ideas-pages';

test.describe('Editor de páginas de ideias', () => {
  let api: ApiClient;
  const created: string[] = [];
  test.beforeAll(async () => {
    api = await ApiClient.login();
  });
  test.afterAll(async () => {
    for (const id of created) await api.delete(`${ENDPOINT}/${id}`);
    await api.dispose();
  });
  async function seed(): Promise<IdeasPageResponse> {
    const result = await api.postMultipart<IdeasPageResponse>(ENDPOINT, {
      ideasMaterialsPageData: JSON.stringify({
        title: `E2E Editor ${uniqueSuffix()}`,
        subtitle: 'Subtítulo original',
        description: 'Materiais de apoio',
        public: false,
        sections: ['Primeira ideia', 'Segunda ideia'].map((title) => ({
          title,
          description: 'Como aplicar',
          public: true,
          medias: [],
        })),
      }),
    });
    created.push(result.id);
    return result;
  }

  test('cria uma página pelo formulário e persiste o corpo multipart', async ({ page }) => {
    const title = `E2E Nova ideia ${uniqueSuffix()}`;
    await page.goto('/adm/criar-pagina');
    await page.getByRole('button', { name: 'Criar Página de Ideias', exact: true }).click();
    await page.getByRole('textbox', { name: 'Título da página' }).fill(title);
    await page
      .getByRole('textbox', { name: 'Descrição', exact: true })
      .fill('Materiais da nova página');
    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByTestId('ideas-page-empty')).toContainText('Adicione ao menos uma seção');
    await page.getByTestId('ideas-page-add-section').click();
    await page.getByRole('textbox', { name: 'Título da seção' }).fill('Ideia de abertura');
    const responsePromise = page.waitForResponse(
      (response) => response.url().endsWith(ENDPOINT) && response.request().method() === 'POST'
    );
    await page.getByTestId('ideas-page-save').click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    const saved = (await response.json()) as IdeasPageResponse;
    created.push(saved.id);
    expect(response.request().headers()['content-type']).toContain('multipart/form-data');
    expect(await api.get<IdeasPageResponse>(`${ENDPOINT}/${saved.id}`)).toMatchObject({
      title,
      description: 'Materiais da nova página',
      sections: [{ title: 'Ideia de abertura' }],
    });
    await expect(page).toHaveURL(new RegExp(`/${saved.route.path}$`));
  });

  test('preserva rascunho ao trocar abas, recolher e remover outra seção', async ({ page }) => {
    const idea = await seed();
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    const second = page
      .getByTestId(EDITOR)
      .filter({ has: page.getByRole('heading', { name: 'Segunda ideia', exact: true }) });
    await second
      .getByRole('textbox', { name: 'Título do Documento', exact: false })
      .fill('Meu documento pendente');
    await second.getByTestId('ideas-section-tab-image').click();
    await expect(page.getByTestId('ideas-page-save')).toBeDisabled();
    await second.getByTestId('ideas-section-toggle').click();
    await page.getByTestId('ideas-page-resume-media').click();
    await expect(second.getByTestId('ideas-section-toggle')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(second.getByTestId('ideas-section-toggle')).toBeFocused();
    await expect(second.getByTestId('ideas-section-panel-document')).toBeVisible();
    await expect(second.getByTestId('ideas-section-draft-document')).toHaveText('Em edição');
    const first = page
      .getByTestId(EDITOR)
      .filter({ has: page.getByRole('heading', { name: 'Primeira ideia', exact: true }) });
    await first.getByTestId('ideas-section-remove').click();
    await page
      .getByTestId('ideas-section-remove-dialog')
      .getByRole('button', { name: 'Remover', exact: true })
      .click();
    await second.getByTestId('ideas-section-tab-document').click();
    await expect(
      second.getByRole('textbox', { name: 'Título do Documento', exact: false })
    ).toHaveValue('Meu documento pendente');
    await expect(page.getByTestId('ideas-page-media-draft-warning')).toBeVisible();
    await second.getByRole('button', { name: 'Descartar rascunho' }).click();
    await expect(page.getByTestId('ideas-page-save')).toBeEnabled();
    await page.getByTestId('ideas-page-save').click();
    await expect
      .poll(async () =>
        (await api.get<IdeasPageResponse>(`${ENDPOINT}/${idea.id}`)).sections.map(
          (section) => section.title
        )
      )
      .toEqual(['Segunda ideia']);
  });

  test('retoma vários rascunhos sem misturá-los e deixa de bloquear ao remover a seção', async ({
    page,
  }) => {
    const idea = await seed();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    const second = page
      .getByTestId(EDITOR)
      .filter({ has: page.getByRole('heading', { name: 'Segunda ideia', exact: true }) });
    await second.getByRole('textbox', { name: 'Título do Documento' }).fill('Documento em edição');
    await second.getByTestId('ideas-section-tab-image').click();
    await second.getByRole('textbox', { name: 'Título do Imagem' }).fill('Imagem em edição');
    await second.getByTestId('ideas-section-toggle').click();
    await expect(page.getByTestId('ideas-page-resume-media')).toHaveCount(2);
    await page.getByTestId('ideas-page-resume-media').filter({ hasText: 'Documentos' }).click();
    await expect(second.getByRole('textbox', { name: 'Título do Documento' })).toHaveValue(
      'Documento em edição'
    );
    await second.getByRole('button', { name: 'Descartar rascunho' }).click();
    await expect(page.getByTestId('ideas-page-resume-media')).toHaveCount(1);
    await page.getByTestId('ideas-page-resume-media').click();
    await expect(second.getByRole('textbox', { name: 'Título do Imagem' })).toHaveValue(
      'Imagem em edição'
    );
    await second.getByTestId('ideas-section-remove').click();
    await page
      .getByTestId('ideas-section-remove-dialog')
      .getByRole('button', { name: 'Remover', exact: true })
      .click();
    await expect(page.getByTestId('ideas-page-media-draft-warning')).toBeHidden();
    await expect(page.getByTestId('ideas-page-save')).toBeEnabled();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test('salva subtítulo e visibilidade; bloqueia alterações durante a requisição', async ({
    page,
  }) => {
    const idea = await seed();
    let patchCount = 0;
    await page.route(`**${ENDPOINT}/${idea.id}`, async (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      patchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    });
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    await page.getByRole('textbox', { name: 'Subtítulo', exact: true }).fill('Subtítulo revisado');
    await page.getByRole('checkbox', { name: 'Página em rascunho' }).check();
    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByTestId('ideas-page-save')).toBeDisabled();
    await expect(page.getByRole('textbox', { name: 'Título da página' })).toBeDisabled();
    await expect
      .poll(async () => api.get<IdeasPageResponse>(`${ENDPOINT}/${idea.id}`))
      .toMatchObject({ subtitle: 'Subtítulo revisado', public: true });
    expect(patchCount).toBe(1);
  });

  test('mantém os valores e uma única mensagem quando a API recusa o salvamento', async ({
    page,
  }) => {
    const idea = await seed();
    await page.route(`**${ENDPOINT}/${idea.id}`, async (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      await route.fulfill({
        status: 422,
        json: {
          success: false,
          error: { code: 'VAL_4002', message: 'Arquivo de substituição ausente.' },
        },
      });
    });
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    await page.getByRole('textbox', { name: 'Título da página' }).fill('Meu título preservado');
    await page.getByTestId('ideas-page-save').click();
    await expect(page.getByTestId('ideas-page-feedback')).toContainText(
      'Arquivo de substituição ausente.'
    );
    await expect(
      page.getByRole('alert').filter({ hasText: 'Arquivo de substituição ausente.' })
    ).toHaveCount(1);
    await expect(page.getByRole('textbox', { name: 'Título da página' })).toHaveValue(
      'Meu título preservado'
    );
    await expect(page.getByTestId('ideas-page-save')).toBeEnabled();
    expect((await api.get<IdeasPageResponse>(`${ENDPOINT}/${idea.id}`)).title).toBe(idea.title);
  });

  test('aponta a seção recusada pela API e abre a seção recolhida', async ({ page }) => {
    const idea = await seed();
    await page.route(`**${ENDPOINT}/${idea.id}`, async (route) => {
      if (route.request().method() !== 'PATCH') return route.fallback();
      await route.fulfill({
        status: 422,
        json: {
          success: false,
          error: {
            code: 'VAL_4002',
            message: 'Seção 2, material 1: tipo inválido.',
            details: {
              fieldErrors: [
                {
                  field: 'sections.1.medias.0.mediaType',
                  message: 'Seção 2, material 1: tipo inválido.',
                },
              ],
            },
          },
        },
      });
    });
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    const sections = page.getByTestId(EDITOR);
    await sections.nth(1).getByTestId('ideas-section-toggle').click();
    await page.getByRole('textbox', { name: 'Título da página' }).fill('Título alterado');
    await page.getByTestId('ideas-page-save').click();
    const apiErrors = sections.nth(1).getByTestId('ideas-section-api-errors');
    await expect(apiErrors).toBeVisible();
    await expect(apiErrors).toContainText('tipo inválido');
    await expect(sections.nth(0).getByTestId('ideas-section-api-errors')).toHaveCount(0);
    // Editar a lista invalida os índices: o aviso some.
    await page.getByTestId('ideas-page-add-section').click();
    await expect(page.getByTestId('ideas-section-api-errors')).toHaveCount(0);
  });

  test('página com muitas seções abre recolhida, com busca, índice e expandir todas', async ({
    page,
  }) => {
    const many = await api.postMultipart<IdeasPageResponse>(ENDPOINT, {
      ideasMaterialsPageData: JSON.stringify({
        title: `E2E Muitas ${uniqueSuffix()}`,
        description: 'Várias seções',
        public: false,
        sections: Array.from({ length: 8 }, (_, i) => ({
          title: i === 5 ? 'Brincadeira da arca' : `Ideia ${i + 1}`,
          description: '',
          public: i % 2 === 0,
          medias: [],
        })),
      }),
    });
    created.push(many.id);
    await page.goto(`/adm/editar-pagina-ideias/${many.id}`);
    const toggles = page.getByTestId('ideas-section-toggle');
    await expect(toggles).toHaveCount(8);
    for (const toggle of await toggles.all()) {
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    await page.getByTestId('ideas-section-search').fill('arca');
    await expect(page.getByTestId('ideas-section-search-result')).toContainText('1 de 8');
    await expect(page.locator(`[data-testid="${EDITOR}"]:visible`)).toHaveCount(1);
    await page.getByTestId('ideas-section-search').fill('');
    await page.getByTestId('ideas-section-outline-item').nth(5).click();
    await expect(toggles.nth(5)).toHaveAttribute('aria-expanded', 'true');
    await expect(toggles.nth(4)).toHaveAttribute('aria-expanded', 'false');
    await page.getByTestId('ideas-sections-expand-all').click();
    await expect(toggles.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('ideas-sections-collapse-all').click();
    await expect(toggles.nth(5)).toHaveAttribute('aria-expanded', 'false');
  });

  test('visualiza imagem, PDF e Word enviados no próprio editor, em tela cheia no celular', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    const idea = await seed();
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    const first = page.getByTestId(EDITOR).first();
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const add = async (
      tab: string,
      file: { name: string; mimeType: string; buffer: Buffer },
      title: string
    ) => {
      await first.getByTestId(`ideas-section-tab-${tab}`).click();
      const panel = first.getByTestId(`ideas-section-panel-${tab}`);
      await panel.getByLabel(/^Título d/).fill(title);
      await panel.getByLabel(/^Descrição d/).fill('Descrição');
      await panel.getByRole('combobox', { name: 'Tipo' }).click();
      await page.getByRole('option', { name: 'Upload' }).click();
      await panel.locator('input[type="file"]').setInputFiles(file);
      await panel.getByRole('button', { name: /^Adicionar/ }).click();
      await panel.getByRole('button', { name: `Visualizar ${title}` }).click();
    };
    const viewer = page.getByTestId('media-viewer-dialog');
    const close = async () => {
      await viewer.getByRole('button', { name: 'Fechar' }).first().click();
      await expect(viewer).toHaveCount(0);
    };

    await add('image', { name: 'foto.png', mimeType: 'image/png', buffer: png }, 'Foto');
    await expect(viewer.getByTestId('media-viewer-image')).toBeVisible();
    expect((await viewer.boundingBox())?.width).toBeGreaterThanOrEqual(385);
    await close();

    await add(
      'document',
      { name: 'roteiro.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') },
      'Roteiro'
    );
    await expect(viewer.getByTestId('media-viewer-embed')).toBeVisible();
    await close();

    await add(
      'document',
      {
        name: 'plano.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('PK'),
      },
      'Plano'
    );
    await expect(viewer.getByTestId('media-viewer-download')).toBeVisible();
    await close();
  });

  test('recupera falha de carregamento e funciona em tela estreita', async ({ page }) => {
    const idea = await seed();
    let shouldFail = true;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(`**${ENDPOINT}/${idea.id}`, async (route) => {
      if (shouldFail && route.request().method() === 'GET')
        return route.fulfill({
          status: 503,
          json: { success: false, error: { message: 'Indisponível temporariamente' } },
        });
      return route.fallback();
    });
    await page.goto(`/adm/editar-pagina-ideias/${idea.id}`);
    await expect(page.getByTestId('ideas-page-load-error')).toBeVisible();
    shouldFail = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('textbox', { name: 'Título da página' })).toHaveValue(idea.title);
    await expect(page.getByTestId('ideas-page-summary')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    for (const tab of ['document', 'image', 'video', 'audio']) {
      await page.getByTestId(EDITOR).first().getByTestId(`ideas-section-tab-${tab}`).click();
      await expect(
        page.getByTestId(EDITOR).first().getByTestId(`ideas-section-panel-${tab}`)
      ).toBeVisible();
    }
  });
});
