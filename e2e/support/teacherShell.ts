import { expect, type Locator, type Page } from '@playwright/test';

/** Largura da casca da Área do Professor sobre a janela (celular / desktop). */
const SHELL_RATIO = { mobile: 0.98, desktop: 0.95 } as const;
const DESKTOP_MIN_WIDTH = 900;

/**
 * A largura padrão (98% no celular, 95% no desktop) é da casca da Área do
 * Professor; a página ocupa tudo o que a casca lhe dá — sozinha no celular,
 * ao lado do menu no desktop.
 */
export async function expectTeacherShellWidth(page: Page, content: Locator): Promise<void> {
  const viewport = await page.evaluate(() => document.documentElement.clientWidth);
  const desktop = viewport >= DESKTOP_MIN_WIDTH;
  const shell = page.getByTestId('teacher-area');

  await expect
    .poll(async () => ((await shell.boundingBox())?.width ?? 0) / viewport)
    .toBeCloseTo(desktop ? SHELL_RATIO.desktop : SHELL_RATIO.mobile, 2);

  const column = shell.getByTestId('teacher-area-content');
  const available = (await column.boundingBox())?.width ?? 0;
  const used = (await content.boundingBox())?.width ?? 0;
  expect(used, 'a página ocupa o espaço que a casca oferece').toBeGreaterThanOrEqual(available - 2);
  expect(used).toBeLessThanOrEqual(available + 1);
}
