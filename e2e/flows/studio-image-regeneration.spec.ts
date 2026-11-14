import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

/**
 * Regerar só algumas imagens de um item (`/adm/estudio/licoes/:id`), contra a
 * API real.
 *
 * O pedido em si nunca é confirmado aqui: regerar imagem custa tokens de IA. O
 * teste abre o diálogo numa lição que já tem imagens, confere a seleção e
 * cancela; o que a API recusa sem gastar nada (escolha vazia, imagem
 * inexistente, versão antiga) é conferido direto na rota.
 */
interface Asset {
  id?: string | number;
  url?: string;
}
interface Stage {
  type: string;
  status: string;
  lockVersion: number;
  currentVersionId: string | null;
  versions: { id: string; structuredDataJson: Record<string, unknown> | null }[];
}
interface LessonItem {
  id: string;
  status: string;
  stages: Stage[];
}

const OPEN_LESSON_STATUSES = ['DRAFT', 'IN_PROGRESS', 'CHANGES_REQUESTED', 'PACKAGE_READY'];
const EDITABLE_STAGE_STATUSES = ['DRAFT', 'PRODUCER_APPROVED', 'CHANGES_REQUESTED'];
const ROUTE = (id: string) => `/api/v1/lessons/${id}/stages/regenerate-images`;

let api: ApiClient;
let target: { lesson: LessonItem; stage: Stage; assets: Asset[] } | null = null;

const assetsOf = (stage: Stage): Asset[] => {
  const data = stage.versions.find(
    (version) => version.id === stage.currentVersionId
  )?.structuredDataJson;
  const list = data?.assets ?? data?.printableAssets;
  return Array.isArray(list) ? (list as Asset[]) : [];
};

test.beforeAll(async () => {
  api = await ApiClient.login();
  const page = await api.get<{ items: { id: string; status: string }[] }>('/api/v1/lessons', {
    limit: 50,
  });
  for (const item of page.items.filter((entry) => OPEN_LESSON_STATUSES.includes(entry.status))) {
    const lesson = await api.get<LessonItem>(`/api/v1/lessons/${item.id}`);
    if (lesson.stages.some((stage) => stage.status === 'GENERATING')) continue;
    const stage = lesson.stages.find((entry) => {
      const assets = assetsOf(entry);
      return (
        entry.type !== 'MEDITATION_OLDER' &&
        EDITABLE_STAGE_STATUSES.includes(entry.status) &&
        assets.length > 1 &&
        assets.every((asset) => Boolean(asset.url))
      );
    });
    if (stage) {
      target = { lesson, stage, assets: assetsOf(stage) };
      break;
    }
  }
});

test('a API recusa, sem gerar nada, escolha vazia, imagem inexistente e versão antiga', async () => {
  test.skip(!target, 'nenhuma lição em produção com imagens geradas no banco local');
  const { lesson, stage } = target!;
  const body = { stage: stage.type, lockVersion: stage.lockVersion };

  expect((await api.send('POST', ROUTE(lesson.id), { ...body, assetIds: [] })).status).toBe(400);
  expect(
    (await api.send('POST', ROUTE(lesson.id), { ...body, assetIds: ['nao-existe'] })).status
  ).toBe(400);
  expect(
    (
      await api.send('POST', ROUTE(lesson.id), {
        ...body,
        lockVersion: stage.lockVersion + 100,
        assetIds: [String(target!.assets[0].id)],
      })
    ).status
  ).toBe(409);

  const after = await api.get<LessonItem>(`/api/v1/lessons/${lesson.id}`);
  expect(after.stages.find((entry) => entry.type === stage.type)?.status).toBe(stage.status);
});

test('o diálogo lista as imagens do item, conta a seleção e cancela sem enviar', async ({
  page,
}) => {
  test.skip(!target, 'nenhuma lição em produção com imagens geradas no banco local');
  const { lesson, stage, assets } = target!;
  let sent = false;
  page.on('request', (request) => {
    if (request.url().includes('/stages/regenerate-images')) sent = true;
  });

  await page.goto(`/adm/estudio/licoes/${lesson.id}?stage=${stage.type}`);
  // Regressão: os visuais da história mostravam dois botões para a mesma coisa.
  const trigger = page.getByRole('button', { name: 'Regerar imagens', exact: true });
  await expect(trigger).toHaveCount(1);
  await trigger.click();

  const dialog = page.getByTestId('ai-lesson-image-regeneration-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('checkbox')).toHaveCount(assets.length);
  const confirm = page.getByTestId('ai-lesson-image-regeneration-confirm');
  await expect(confirm).toBeDisabled();

  const second = String(assets[1].id);
  await page.getByTestId(`ai-lesson-image-regeneration-option-${second}`).click();
  await expect(confirm).toHaveText('Regerar 1 imagem');
  await expect(page.getByTestId('ai-lesson-image-regeneration-summary')).toContainText(
    `1 de ${assets.length}`
  );

  await page.getByTestId('ai-lesson-image-regeneration-select-all').click();
  await expect(confirm).toHaveText(`Regerar ${assets.length} imagens`);

  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toBeHidden();
  expect(sent).toBe(false);
});

test('no celular o diálogo ocupa a tela e o botão de confirmar fica sempre visível', async ({
  page,
}) => {
  test.skip(!target, 'nenhuma lição em produção com imagens geradas no banco local');
  const { lesson, stage, assets } = target!;
  const viewport = { width: 390, height: 844 };
  await page.setViewportSize(viewport);

  await page.goto(`/adm/estudio/licoes/${lesson.id}?stage=${stage.type}`);
  const trigger = page.getByRole('button', { name: 'Regerar imagens', exact: true });
  await expect(trigger).toHaveCount(1);
  await trigger.click();

  const dialog = page.getByTestId('ai-lesson-image-regeneration-dialog');
  const paper = dialog.locator('.MuiDialog-paper');
  await expect(paper).toBeVisible();
  const box = await paper.boundingBox();
  expect(box?.width).toBe(viewport.width);
  expect(box?.height).toBe(viewport.height);

  // Nada estoura para os lados, e cada miniatura é um alvo de toque confortável.
  const overflow = await paper.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const option = await dialog.getByRole('checkbox').first().boundingBox();
  expect(option?.width ?? 0).toBeGreaterThanOrEqual(140);

  await dialog
    .getByRole('checkbox')
    .nth(assets.length - 1)
    .click();
  const confirm = page.getByTestId('ai-lesson-image-regeneration-confirm');
  await expect(confirm).toHaveText('Regerar 1 imagem');
  await expect(confirm).toBeInViewport({ ratio: 1 });
  expect((await confirm.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();
});
