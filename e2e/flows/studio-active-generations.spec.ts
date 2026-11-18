import { expect, test } from '@playwright/test';

import { ApiClient } from '../support/api';

/**
 * Gerações em andamento no Estúdio, contra a API real.
 *
 * Nada é gerado aqui — gerar custa tokens de IA. O teste lê a lista de gerações
 * ativas pela API e confere que cada tela diz a mesma coisa: sem geração, o
 * bloco não aparece; com geração (alguém gerando de verdade durante o teste),
 * há uma linha por lição.
 */
interface ActiveGeneration {
  lessonId: string;
  totalImages: number;
  completedImages: number;
  percent: number | null;
}

const SCREENS = ['/adm/estudio', '/adm/estudio/licoes', '/adm/estudio/revisao'];
let api: ApiClient;

test.beforeAll(async () => {
  api = await ApiClient.login();
});

test('a API lista as gerações ativas com contagem coerente', async () => {
  const active = await api.get<ActiveGeneration[]>('/api/v1/lessons/generations/active');

  expect(Array.isArray(active)).toBe(true);
  for (const item of active) {
    expect(item.completedImages).toBeLessThanOrEqual(item.totalImages);
    if (item.percent !== null) expect(item.percent).toBeLessThan(100);
  }
});

for (const path of SCREENS) {
  test(`${path} mostra o bloco só quando há geração em andamento`, async ({ page }) => {
    const response = page.waitForResponse((item) =>
      item.url().includes('/api/v1/lessons/generations/active')
    );
    await page.goto(path);
    const active = (await (await response).json()) as ActiveGeneration[];

    const banner = page.getByTestId('studio-active-generations');
    if (active.length === 0) {
      await expect(banner).toHaveCount(0);
      return;
    }
    await expect(banner).toBeVisible();
    await expect(page.getByTestId(`studio-active-generation-${active[0].lessonId}`)).toBeVisible();
  });
}
