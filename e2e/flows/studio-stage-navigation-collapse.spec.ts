import { expect, test } from '@playwright/test';
import { LessonStageType } from '@/features/ai-lessons/types';
import { ApiClient } from '../support/api';
import { createStudioFixture } from '../support/studio';

test('recolher o fluxo da produção amplia o documento e mantém a troca de etapa', async ({
  page,
}) => {
  const api = await ApiClient.login();
  const lesson = await createStudioFixture(api);
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/adm/estudio/licoes/${lesson.id}`);

    const nav = page.getByTestId('ai-lesson-stage-navigation-desktop');
    const toggle = page.getByTestId('ai-lesson-stage-navigation-toggle');
    await expect(nav).toHaveAttribute('data-collapsed', 'false');
    await expect(nav).toContainText('Fluxo da produção');
    const expandedWidth = (await nav.boundingBox())!.width;

    await toggle.click();
    await expect(nav).toHaveAttribute('data-collapsed', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).not.toContainText('Fluxo da produção');
    await expect.poll(async () => (await nav.boundingBox())!.width).toBeLessThan(expandedWidth / 2);

    const target = nav.getByTestId(`ai-stage-tab-${LessonStageType.MEDITATION_YOUNGER}`);
    await target.click();
    await expect(page).toHaveURL(new RegExp(`stage=${LessonStageType.MEDITATION_YOUNGER}`, 'i'));
    await expect(target).toHaveAttribute('aria-current', 'step');

    await toggle.click();
    await expect(nav).toHaveAttribute('data-collapsed', 'false');
    await expect(nav).toContainText('Fluxo da produção');
  } finally {
    await api.delete(`/api/v1/lessons/${lesson.id}`);
    await api.dispose();
  }
});
