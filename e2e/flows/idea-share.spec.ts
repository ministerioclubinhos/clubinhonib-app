import { expect, type Page, test } from '@playwright/test';

import type { IdeasSectionResponse } from '@/features/ideas-sections/types';

import { ApiClient, uniqueSuffix } from '../support/api';
import { TEACHER_EMAIL, TEACHER_PASSWORD } from '../support/env';
import { enableProductFlags } from '../support/featureFlags';
import { loginAs } from '../support/session';
import { expectTeacherShellWidth } from '../support/teacherShell';

/**
 * Compartilhar ideia como o professor, contra a API real. Só são encenados o
 * que o servidor não provoca sob demanda: a falha e a demora do envio.
 */
const TEACHER_STORAGE = 'e2e/.auth/idea-share-teacher.json';
const PDF = {
  name: 'roteiro.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4\n%%EOF'),
};
const CREATE_URL = /\/ideas-sections$/;

let admin: ApiClient;
let restoreFlags: () => Promise<void>;
const created: string[] = [];

test.beforeAll(async ({ browser }) => {
  admin = await ApiClient.login();
  restoreFlags = await enableProductFlags(admin);
  const page = await loginAs(browser, TEACHER_EMAIL, TEACHER_PASSWORD);
  await page.context().storageState({ path: TEACHER_STORAGE });
  await page.context().close();
});

test.afterAll(async () => {
  for (const id of created) await admin.delete(`/ideas-sections/${id}`);
  await restoreFlags?.();
  await admin?.dispose();
});

/** Guarda o id de toda ideia criada pela tela, para conferir e limpar. */
function trackCreated(page: Page): string[] {
  const ids: string[] = [];
  page.on('response', async (response) => {
    if (response.request().method() !== 'POST' || !CREATE_URL.test(response.url())) return;
    if (response.status() !== 201) return;
    const { id } = (await response.json()) as { id: string };
    ids.push(id);
    created.push(id);
  });
  return ids;
}

async function fillRequired(page: Page, title: string): Promise<void> {
  await page.goto('/compartilhar-ideia');
  await page.getByTestId('idea-share-title').fill(title);
  await page.getByTestId('idea-share-description').fill('Separe 3 bolas e forme 2 equipes.');
  await page.getByTestId('idea-share-dropzone-input').setInputFiles(PDF);
}

// Só os testes usam a sessão do professor: a preparação cria o arquivo dela.
test.describe('Compartilhar ideia', () => {
  test.use({ storageState: TEACHER_STORAGE });

  test('categorias de material, YouTube só em vídeo, remover/desfazer e envio gravado', async ({
    page,
  }) => {
    const ids = trackCreated(page);
    const title = `E2E Envio ${uniqueSuffix()}`;
    await page.goto('/compartilhar-ideia');
    await page.getByTestId('idea-share-submit').click();
    await expect(page.getByTestId('idea-share-title')).toBeFocused();
    await page.getByTestId('idea-share-title').fill(title);
    await page.getByTestId('idea-share-description').fill('Separe 3 bolas e forme 2 equipes.');
    await expect(page.getByTestId('idea-share-youtube-url-input')).toHaveCount(0);
    await page.getByTestId('idea-share-dropzone-input').setInputFiles(PDF);
    await page.getByTestId('idea-share-kind-image').click();
    await expect(page.getByTestId('idea-share-youtube-url-input')).toHaveCount(0);
    await page.getByTestId('idea-share-dropzone-input').setInputFiles({
      name: 'incorreto.mov',
      mimeType: 'video/quicktime',
      buffer: Buffer.from('movie'),
    });
    await expect(page.getByTestId('idea-share-validation-alert')).toContainText('incorreto.mov');
    await page.getByTestId('idea-share-kind-video').click();
    await page
      .getByTestId('idea-share-youtube-url-input')
      .fill('https://youtube.com.evil.test/watch?v=abcdefghijk');
    await page.getByTestId('idea-share-youtube-add').click();
    await expect(page.getByTestId('idea-share-validation-alert')).toContainText('válido');
    await page.getByTestId('idea-share-youtube-url-input').fill('https://youtu.be/abcdefghijk');
    await page.getByTestId('idea-share-youtube-url-input').press('Enter');
    await expect(page.getByTestId('idea-share-material-item')).toHaveCount(2);
    await page.getByTestId('idea-share-material-remove').first().click();
    await page.getByTestId('idea-share-material-undo').click();
    await expect(page.getByTestId('idea-share-material-item')).toHaveCount(2);
    await page.getByTestId('idea-share-submit').click();
    await expect(page.getByTestId('idea-share-success')).toBeVisible();

    await expect.poll(() => ids.length).toBe(1);
    const stored = await admin.get<IdeasSectionResponse>(`/ideas-sections/${ids[0]}`);
    expect(stored).toMatchObject({
      title,
      description: 'Separe 3 bolas e forme 2 equipes.',
      public: false,
    });
    expect(stored.pageId ?? null).toBeNull();
    expect(stored.medias.map((media) => [media.mediaType, media.uploadType]).sort()).toEqual([
      ['document', 'upload'],
      ['video', 'link'],
    ]);

    await page.getByTestId('idea-share-success-new-idea').click();
    await expect(page.getByTestId('idea-share-title')).toHaveValue('');
  });

  for (const width of [390, 1440])
    test(`o formulário ocupa a largura da área do professor e cabe em ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/compartilhar-ideia');
      await expect(page.getByTestId('idea-share-form')).toBeVisible();
      const dimensions = await page.getByTestId('idea-share-form').evaluate((el) => ({
        width: el.clientWidth,
        content: el.scrollWidth,
      }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.width + 1);
      await expectTeacherShellWidth(page, page.getByTestId('ideas-sections-share-form'));
      if (width === 390) {
        expect(
          await page
            .getByTestId('idea-share-submit-bar')
            .evaluate((el) => getComputedStyle(el).position)
        ).toBe('fixed');
        const button = await page.getByTestId('idea-share-submit').boundingBox();
        expect(button?.height).toBeGreaterThanOrEqual(44);
        expect(button!.y + button!.height).toBeLessThanOrEqual(1000);
      }
      await page.screenshot({ path: testInfo.outputPath(`share-${width}.png`), fullPage: true });
    });

  test('uma falha no envio preserva o rascunho e a nova tentativa grava uma única ideia', async ({
    page,
  }) => {
    const ids = trackCreated(page);
    const title = `E2E Repetição ${uniqueSuffix()}`;
    let attempts = 0;
    await page.route(CREATE_URL, async (route) => {
      if (route.request().method() !== 'POST' || ++attempts > 1) return route.continue();
      return route.fulfill({
        status: 500,
        json: { success: false, error: { message: 'Falha temporária' } },
      });
    });
    await fillRequired(page, title);
    await page.getByTestId('idea-share-submit').click();
    await expect(page.getByTestId('idea-share-error-alert')).toBeVisible();
    await expect(page.getByTestId('idea-share-title')).toHaveValue(title);
    await expect(page.getByTestId('idea-share-material-item')).toHaveCount(1);
    await page.getByTestId('idea-share-error-retry').click();
    await expect(page.getByTestId('idea-share-success')).toBeVisible();
    expect(attempts).toBe(2);
    await expect.poll(() => ids.length).toBe(1);
    expect((await admin.get<IdeasSectionResponse>(`/ideas-sections/${ids[0]}`)).title).toBe(title);
  });

  test('o envio duplo enquanto a confirmação não chega grava uma única ideia', async ({ page }) => {
    const ids = trackCreated(page);
    let requests = 0;
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(CREATE_URL, async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      requests++;
      await pending;
      return route.continue();
    });
    await fillRequired(page, `E2E Duplo ${uniqueSuffix()}`);
    await page.getByTestId('idea-share-form').evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
      (form as HTMLFormElement).requestSubmit();
    });
    await expect.poll(() => requests).toBe(1);
    await expect(page.getByTestId('idea-share-submit')).toBeDisabled();
    await expect(page.getByTestId('idea-share-progress')).toBeVisible();
    release();
    await expect(page.getByTestId('idea-share-success')).toBeVisible();
    expect(requests).toBe(1);
    await expect.poll(() => ids.length).toBe(1);
  });
});
