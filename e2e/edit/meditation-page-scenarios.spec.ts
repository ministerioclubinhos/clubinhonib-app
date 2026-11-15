import { expect, Locator, Page, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import type { SeedFile } from '../support/pageSeeds';
import { expectS3ObjectGone, expectS3ObjectPresent, expectUploadedToS3 } from '../support/s3';
import { cardOf, replaceText, searchListing } from '../support/ui';

/**
 * Editor de meditação contra a API real (tela → API → banco → S3), sem IA.
 *
 * O ponto delicado é o arquivo do documento: editar, trocar, virar link,
 * recusar um salvamento e excluir não podem deixar objeto órfão no bucket
 * nem apagar o que ainda está em uso. Cada cenário relê a API e consulta o S3.
 */

const ENDPOINT = '/meditations';
const EDIT_ROUTE = '/adm/editar-meditacao';
const LIST_ROUTE = '/adm/meditacoes';
const DRIVE = 'https://drive.google.com/file/d/e2e/view';

interface MeditationApi {
  id: string;
  topic: string;
  days: { day: string; topic: string }[];
  media: { id: string; url: string; uploadType: string; isLocalFile: boolean; originalName?: string } | null;
}

const pdf = (name: string): SeedFile => ({
  name,
  mimeType: 'application/pdf',
  buffer: Buffer.from(`%PDF-1.4\n% ${name} ${Date.now()}\n%%EOF\n`),
});

test.describe('Editor de meditação: cenários completos', () => {
  test.describe.configure({ timeout: 180_000 });

  let api: ApiClient;
  const created: string[] = [];
  let yearCounter = 2100;

  test.beforeAll(async () => {
    api = await ApiClient.login();
  });
  test.afterAll(async () => {
    for (const id of created) await api.delete(`${ENDPOINT}/${id}`);
    await api.dispose();
  });

  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /** Cria uma meditação numa semana livre própria (um ano distinto por cenário). */
  async function seed(topic: string, kind: 'upload' | 'link'): Promise<MeditationApi> {
    const monday = new Date(yearCounter++, 0, 7, 12);
    while (monday.getDay() !== 1) monday.setDate(monday.getDate() + 1);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => ({
      day,
      verse: `Salmos 1:${i + 1}`,
      topic: `Dia ${i + 1}`,
    }));
    const media =
      kind === 'upload'
        ? { title: topic, description: 'doc', uploadType: 'upload', mediaType: 'document', isLocalFile: true }
        : {
            title: topic,
            description: 'link',
            uploadType: 'link',
            mediaType: 'document',
            isLocalFile: false,
            url: DRIVE,
            platformType: 'googledrive',
          };
    const files: Record<string, SeedFile> = kind === 'upload' ? { file: pdf(`${topic}.pdf`) } : {};
    const meditation = await api.postMultipart<{ id: string }>(
      ENDPOINT,
      { meditationData: JSON.stringify({ topic, startDate: iso(monday), endDate: iso(friday), media, days }) },
      files,
    );
    created.push(meditation.id);
    return fetchOne(meditation.id);
  }

  const fetchOne = (id: string): Promise<MeditationApi> => api.get<MeditationApi>(`${ENDPOINT}/${id}`);
  const form = (page: Page): Locator => page.getByTestId('meditations-meditation-page-form');

  async function open(page: Page, id: string): Promise<void> {
    await page.goto(`${EDIT_ROUTE}/${id}`);
    await expect(form(page)).toBeVisible();
  }

  async function save(page: Page, id: string): Promise<void> {
    const saved = page.waitForResponse(
      (r) => r.request().method() === 'PATCH' && r.url().includes(`${ENDPOINT}/${id}`),
      { timeout: 90_000 },
    );
    await form(page).getByRole('button', { name: 'Salvar Meditação' }).click();
    expect((await saved).status()).toBeLessThan(300);
  }

  async function chooseType(page: Page, mode: 'Link' | 'Upload'): Promise<void> {
    await form(page).getByRole('combobox', { name: 'Tipo do material' }).click();
    await page.getByRole('option', { name: mode }).click();
  }

  test('editar só o tema mantém o mesmo arquivo no S3', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Tema ${suffix}`, 'upload');
    const url = before.media!.url;
    expectUploadedToS3(url, 'meditação criada');

    await open(page, before.id);
    await replaceText(form(page).getByLabel('Tema da Meditação'), `E2E Med Tema Novo ${suffix}`);
    await save(page, before.id);

    const after = await fetchOne(before.id);
    expect(after.topic).toBe(`E2E Med Tema Novo ${suffix}`);
    expect(after.media!.url).toBe(url);
    expect(after.media!.id).toBe(before.media!.id);
    await expectS3ObjectPresent(url, 'arquivo após editar só o tema');
  });

  test('trocar o arquivo apaga o antigo e grava o novo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Troca ${suffix}`, 'upload');
    const oldUrl = before.media!.url;

    await open(page, before.id);
    await form(page).locator('input[type="file"]').setInputFiles({
      name: `novo-${suffix}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`%PDF-1.4\n% novo ${suffix}\n%%EOF\n`),
    });
    await save(page, before.id);

    const after = await fetchOne(before.id);
    expectUploadedToS3(after.media!.url, 'arquivo novo');
    expect(after.media!.url).not.toBe(oldUrl);
    await expectS3ObjectPresent(after.media!.url, 'arquivo novo');
    await expectS3ObjectGone(oldUrl, 'arquivo substituído');
  });

  test('virar link apaga o arquivo do bucket', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Link ${suffix}`, 'upload');
    const oldUrl = before.media!.url;

    await open(page, before.id);
    await chooseType(page, 'Link');
    await form(page).getByLabel('Link do documento').fill(DRIVE);
    await save(page, before.id);

    const after = await fetchOne(before.id);
    expect(after.media).toMatchObject({ uploadType: 'link', isLocalFile: false, url: DRIVE });
    await expectS3ObjectGone(oldUrl, 'arquivo de quem virou link');
  });

  test('virar upload envia o arquivo e o link antigo não vai ao bucket', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Upload ${suffix}`, 'link');

    await open(page, before.id);
    await chooseType(page, 'Upload');
    await form(page).locator('input[type="file"]').setInputFiles({
      name: `doc-${suffix}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`%PDF-1.4\n% doc ${suffix}\n%%EOF\n`),
    });
    await save(page, before.id);

    const after = await fetchOne(before.id);
    expect(after.media).toMatchObject({ uploadType: 'upload', isLocalFile: true });
    await expectS3ObjectPresent(after.media!.url, 'arquivo enviado');
  });

  test('salvamento recusado (tema vazio) não toca no banco nem no S3', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Recusa ${suffix}`, 'upload');
    const url = before.media!.url;

    await open(page, before.id);
    await form(page).locator('input[type="file"]').setInputFiles({
      name: `nao-vai-${suffix}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`%PDF-1.4\n% nao ${suffix}\n%%EOF\n`),
    });
    await replaceText(form(page).getByLabel('Tema da Meditação'), '');

    let patched = false;
    page.on('request', (r) => {
      if (r.method() === 'PATCH' && r.url().includes(ENDPOINT)) patched = true;
    });
    await form(page).getByRole('button', { name: 'Salvar Meditação' }).click();

    await expect(page.getByTestId('meditation-feedback')).toBeVisible();
    expect(patched).toBe(false);
    const after = await fetchOne(before.id);
    expect(after.topic).toBe(before.topic);
    expect(after.media!.url).toBe(url);
    await expectS3ObjectPresent(url, 'arquivo após salvamento recusado');
  });

  test('limpar o link mostra o erro no campo e não salva', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Sem Link ${suffix}`, 'link');

    await open(page, before.id);
    await replaceText(form(page).getByLabel('Link do documento'), '');
    await form(page).getByRole('button', { name: 'Salvar Meditação' }).click();

    await expect(form(page).getByText('Informe um link válido ou envie um arquivo.').first()).toBeVisible();
    expect((await fetchOne(before.id)).media!.url).toBe(DRIVE);
  });

  test('remover um dia bloqueia o salvamento e preserva tudo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const before = await seed(`E2E Med Dias ${suffix}`, 'upload');
    const url = before.media!.url;

    await open(page, before.id);
    await form(page).getByRole('button', { name: 'Remover Segunda-feira' }).click();
    await page.getByRole('button', { name: 'Remover', exact: true }).click();
    await expect(form(page).getByText('Faltam 1 dia para completar a semana')).toBeVisible();

    await form(page).getByRole('button', { name: 'Salvar Meditação' }).click();
    await expect(page.getByTestId('meditation-feedback')).toBeVisible();

    const after = await fetchOne(before.id);
    expect(after.days).toHaveLength(5);
    await expectS3ObjectPresent(url, 'arquivo com a semana incompleta');
  });

  test('exclui pela listagem: cancelar mantém; confirmar apaga registro e arquivo', async ({ page }) => {
    const suffix = uniqueSuffix();
    const seeded = await seed(`E2E Med Excluir ${suffix}`, 'upload');
    const url = seeded.media!.url;

    await page.goto(LIST_ROUTE);
    await searchListing(page, suffix);
    const card = cardOf(page, 'meditations', 'meditation-list-card', seeded.id);
    await expect(card).toBeVisible();

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const dialog = page.getByTestId('modal-delete-confirm-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /Cancelar/ }).click();
    await expect(dialog).toBeHidden();
    expect(await api.statusOf(`${ENDPOINT}/${seeded.id}`)).toBe(200);
    await expectS3ObjectPresent(url, 'arquivo após cancelar a exclusão');

    await card.getByRole('button', { name: 'Excluir', exact: true }).click();
    const deleted = page.waitForResponse(
      (r) => r.request().method() === 'DELETE' && r.url().endsWith(`${ENDPOINT}/${seeded.id}`),
      { timeout: 90_000 },
    );
    await dialog.getByRole('button', { name: 'Excluir', exact: true }).click();
    expect((await deleted).status()).toBeLessThan(300);
    await expect(card).toHaveCount(0, { timeout: 60_000 });

    expect(await api.statusOf(`${ENDPOINT}/${seeded.id}`)).toBe(404);
    await expectS3ObjectGone(url, 'arquivo da meditação excluída');
  });

  test('meditação inexistente oferece tentar de novo e voltar à lista', async ({ page }) => {
    await page.goto(`${EDIT_ROUTE}/00000000-0000-4000-8000-000000000000`);
    await expect(page.getByTestId('meditation-load-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver meditações' }).click();
    await expect(page).toHaveURL(/\/adm\/meditacoes/);
  });
});
