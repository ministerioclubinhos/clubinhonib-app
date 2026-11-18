import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

/**
 * Painel do Estúdio (`/adm/estudio`), contra a API real.
 *
 * O painel é uma fila de trabalho: os números do topo abrem a lista que
 * contam, e cada lição em andamento mostra o próximo passo a um clique. Nada é
 * simulado nem criado aqui — criar uma lição dispara geração por IA, que custa
 * tokens —, então os testes leem o painel pela API e conferem que a tela diz a
 * mesma coisa.
 */
interface Dashboard {
  total: number;
  byStatus: Record<string, number>;
  active: { id: string; status: string }[];
  recent: { id: string; status: string }[];
}

const QUEUE_LIMIT = 6;
let api: ApiClient;
let dashboard: Dashboard;

test.beforeAll(async () => {
  api = await ApiClient.login();
  dashboard = await api.get<Dashboard>('/api/v1/lessons/dashboard');
});

test.afterAll(async () => {
  await api.dispose();
});

const count = (...statuses: string[]) =>
  statuses.reduce((sum, status) => sum + (dashboard.byStatus[status] ?? 0), 0);

test.describe('Painel do Estúdio', () => {
  test('a API devolve só lições em andamento na fila de trabalho', () => {
    for (const lesson of dashboard.active) {
      expect(['PUBLISHED', 'ARCHIVED'], lesson.id).not.toContain(lesson.status);
    }
    expect(dashboard.active.length).toBeLessThanOrEqual(dashboard.total);
  });

  test('os números do topo são os da API e cada um abre a lista que conta', async ({ page }) => {
    await page.goto('/adm/estudio');
    const metric = (key: string) => page.getByTestId(`ai-lessons-hub-metric-${key}`);

    await expect(metric('CHANGES')).toContainText(String(count('CHANGES_REQUESTED')));
    await expect(metric('PRODUCTION')).toContainText(String(count('DRAFT', 'IN_PROGRESS')));
    await expect(metric('REVIEW')).toContainText(String(count('PACKAGE_READY', 'IN_REVIEW')));
    await expect(metric('READY')).toContainText(String(count('READY_FOR_PUBLICATION', 'PUBLISHING')));
    await expect(metric('PUBLISHED')).toContainText(String(count('PUBLISHED')));
    await expect(page.getByTestId('ai-lessons-hub-summary')).toContainText(`${dashboard.total} `);

    await metric('PUBLISHED').click();
    await expect(page).toHaveURL(/\/adm\/estudio\/licoes\?status=PUBLISHED$/);
    // A lista abre já filtrada: só publicadas, na mesma quantidade do painel.
    const listed = await api.get<{ total: number }>('/api/v1/lessons', { status: 'PUBLISHED', limit: 6 });
    expect(listed.total).toBe(count('PUBLISHED'));
    await expect(page.getByRole('combobox').filter({ hasText: 'Publicado' })).toBeVisible();
  });

  test('a fila mostra as lições em andamento com o próximo passo e as etapas', async ({ page }) => {
    await page.goto('/adm/estudio');
    const queue = page.getByTestId('ai-lessons-hub-queue');
    await expect(queue).toBeVisible();

    if (dashboard.active.length === 0) {
      await expect(page.getByTestId('ai-lessons-hub-queue-empty')).toBeVisible();
      return;
    }

    const items = queue.locator('[data-testid^="ai-lessons-hub-queue-item-"]');
    await expect(items).toHaveCount(Math.min(dashboard.active.length, QUEUE_LIMIT));
    // Toda lição da fila está em andamento na API, e tem botão e etapas.
    const activeIds = new Set(dashboard.active.map((lesson) => lesson.id));
    for (const testId of await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-testid')))) {
      expect(activeIds.has((testId ?? '').replace('ai-lessons-hub-queue-item-', ''))).toBe(true);
    }
    const first = items.first();
    await expect(first.getByTestId('ai-lessons-hub-pipeline').getByRole('listitem').first()).toBeVisible();
    await expect(first.getByText(/de \d+ etapas concluídas/)).toBeVisible();

    // O botão leva direto à lição, na etapa que precisa de atenção.
    const firstId = ((await first.getAttribute('data-testid')) ?? '').replace('ai-lessons-hub-queue-item-', '');
    await page.getByTestId(`ai-lessons-hub-queue-action-${firstId}`).click();
    await expect(page).toHaveURL(new RegExp(`/adm/estudio/(licoes|revisao)/${firstId}`));
  });

  test('o que é mais urgente vem primeiro na fila', async ({ page }) => {
    test.skip(dashboard.active.length < 2, 'menos de duas lições em andamento neste banco');
    await page.goto('/adm/estudio');
    const order = ['FIX_CHANGES', 'RETRY_FAILED', 'PUBLISH', 'REVIEW', 'CONTINUE', 'START', 'WAIT'];
    const items = page.locator('[data-testid^="ai-lessons-hub-queue-item-"]');
    await expect(items.first()).toBeVisible();

    const ranks = await items.evaluateAll(
      (nodes, known) => nodes.map((node) => known.indexOf(node.getAttribute('data-action') ?? '')),
      order,
    );
    expect(ranks.every((rank) => rank >= 0)).toBe(true);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  test('o fluxo editorial fica recolhido e abre sob demanda', async ({ page }) => {
    await page.goto('/adm/estudio');
    const reference = page.getByTestId('ai-lessons-hub-reference');

    await expect(reference.getByText('9. Material semanal')).toBeHidden();
    await reference.getByRole('button', { name: /Como funciona o fluxo editorial/ }).click();
    await expect(reference.getByText('9. Material semanal')).toBeVisible();
    await expect(reference.getByText('1. Lição completa')).toBeVisible();
  });

  test('os atalhos do cabeçalho levam à produção, à revisão e às orientações', async ({ page }) => {
    for (const [name, url] of [
      ['Produzir lição', /\/adm\/estudio\/licoes$/],
      ['Revisão', /\/adm\/estudio\/revisao$/],
      ['Orientações', /\/adm\/estudio\/orientacoes$/],
    ] as const) {
      await page.goto('/adm/estudio');
      await page.getByRole('banner').or(page.locator('header')).getByRole('link', { name }).first().click();
      await expect(page).toHaveURL(url);
    }
  });
});

for (const width of [320, 375, 768, 1440]) {
  test(`o painel cabe na tela em ${width}px, sem rolar para o lado`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/adm/estudio');

    for (const id of ['ai-lessons-hub-queue', 'ai-lessons-hub-published', 'ai-lessons-hub-reference']) {
      const panel = page.getByTestId(id);
      await expect(panel).toBeVisible();
      const bounds = await panel.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          viewport: document.documentElement.clientWidth,
          overflow: element.scrollWidth - element.clientWidth,
        };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);
      expect(bounds.overflow).toBeLessThanOrEqual(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      ),
    ).toBe(false);
    // Alvos de toque do tamanho certo no celular.
    const action = page.locator('[data-testid^="ai-lessons-hub-queue-action-"]').first();
    if (await action.count()) expect((await action.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
}
