import { expect, test } from '@playwright/test';

for (const width of [320, 375, 768, 1440]) {
  test(`estúdio mantém as caixas dentro da tela em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/api/v1/lessons/dashboard', (route) =>
      route.fulfill({
        json: {
          total: 1,
          byStatus: { CHANGES_REQUESTED: 1 },
          recent: Array.from({ length: 8 }, (_, index) => ({
            id: `mobile-layout-regression-${index}`,
            theme:
              'Uma lição com um título muito longo para verificar a quebra de texto no celular',
            biblicalReference: 'ReferênciaSemEspaços'.repeat(8),
            status: 'CHANGES_REQUESTED',
            stages: [],
          })),
        },
      })
    );
    await page.goto('/adm/estudio');
    for (const id of [
      'ai-lessons-hub-recent-productions',
      'ai-lessons-hub-editorial-flow',
      'ai-lessons-hub-studio-standards',
    ]) {
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
    await expect(page.locator('[data-testid^="ai-lessons-hub-recent-lesson-"]')).toHaveCount(3);
    await page.getByRole('button', { name: 'Ver todas' }).click();
    await expect(page).toHaveURL(/\/adm\/estudio\/licoes$/);
  });
}
