import { expect, test } from '@playwright/test';
import { AI_ID, IDEA_ID, ideaWithAi, mockIdeasApp, originalIdea } from '../support/ideasMocks';
import { IdeaAiStatus } from '../../src/features/ideas-sections/types';
test.use({ storageState: { cookies: [], origins: [] } });
test('compares text, documents and images and publishes choices bound to the attempt', async ({
  page,
}) => {
  let published = '';
  await mockIdeasApp(page, async (route, path) => {
    if (path.includes('/attach/')) {
      published = route.request().postData() ?? '';
      await route.fulfill({ json: originalIdea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible();
  await expect(page.getByTestId('idea-ai-text-compare')).toHaveCount(2);
  await page.getByTestId('idea-ai-document-preview').first().click();
  await expect(page.getByTestId('idea-ai-document-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar', exact: true }).click();
  await expect(page.getByTestId('idea-ai-document-docx')).toHaveAttribute(
    'href',
    '/test-assets/editable.docx'
  );
  await page.getByTestId('idea-ai-image-slider').getByRole('slider').press('ArrowRight');
  await page.getByTestId('idea-ai-use-original').click();
  await page.getByRole('combobox', { name: 'Página de destino' }).click();
  await page.getByRole('option', { name: 'Atividades do Clubinho' }).click();
  await page.getByTestId('idea-review-publish').click();
  expect(published).toBe('');
  await page.getByTestId('idea-ai-confirm-choices').getByRole('checkbox').check();
  await page.getByTestId('idea-review-publish').click();
  await expect.poll(() => published).toContain(`"enhancementId":"${AI_ID}"`);
  expect(published).toContain('"title":"ORIGINAL"');
});
test('manual retry works with auto flag disabled and preserves the previous result while polling', async ({
  page,
}) => {
  const idea = ideaWithAi();
  let requested = false;
  let failFirstRefresh = true;
  await mockIdeasApp(page, async (route, path) => {
    if (path.endsWith('/ai-enhancement')) {
      requested = true;
      const active = {
        ...idea.aiEnhancement!.currentResult!,
        id: 'next',
        attempt: 2,
        status: IdeaAiStatus.PROCESSING,
        enhancedTitle: null,
        enhancedDescription: null,
        medias: [],
      };
      idea.aiEnhancement!.activeAttempt = active;
      idea.aiEnhancement!.attemptHistory.unshift(active);
      await route.fulfill({
        status: 202,
        json: { id: 'next', attempt: 2, status: IdeaAiStatus.PENDING },
      });
      return true;
    }
    if (path === `/ideas-sections/${IDEA_ID}`) {
      if (requested && failFirstRefresh) {
        failFirstRefresh = false;
        await route.fulfill({ status: 503, json: { message: 'Falha temporária' } });
        return true;
      }
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await page.getByTestId('idea-ai-reprocess').click();
  await expect(page.getByTestId('idea-ai-progress')).toBeVisible({ timeout: 12000 });
  expect(requested).toBe(true);
  await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
  await expect(page.getByTestId('idea-ai-text-compare').last()).toContainText(
    'Forme 2 equipes e separe 3 bolas.'
  );
  idea.aiEnhancement!.activeAttempt = null;
  idea.aiEnhancement!.attemptHistory[0].status = IdeaAiStatus.FAILED;
  await expect(page.getByTestId('idea-ai-progress')).toHaveCount(0, { timeout: 12000 });
  await expect(
    page.getByText('A melhoria anterior foi preservada.', { exact: false })
  ).toBeVisible();
});
test('requires confirmation to cancel the active attempt and publish original', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.activeAttempt = {
    ...idea.aiEnhancement!.currentResult!,
    status: IdeaAiStatus.PROCESSING,
  };
  let published = '';
  await mockIdeasApp(page, async (route, path) => {
    if (path.includes('/attach/')) {
      published = route.request().postData() ?? '';
      await route.fulfill({ json: originalIdea });
      return true;
    }
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await page.getByRole('combobox', { name: 'Página de destino' }).click();
  await page.getByRole('option', { name: 'Atividades do Clubinho' }).click();
  await page.getByTestId('idea-review-publish').click();
  await expect(page.getByTestId('idea-ai-publish-original-dialog')).toBeVisible();
  await page.getByTestId('idea-ai-confirm-publish-original').click();
  await expect.poll(() => published).toContain('"ignoreAiEnhancement":true');
  expect(published).not.toContain('"aiDecisions"');
});
for (const width of [390, 1440])
  test(`review fits ${width}px with comparison and publication available`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockIdeasApp(page);
    await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
    await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible();
    const size = await page
      .getByTestId('ideas-sections-ideas-section-review-page')
      .evaluate((el) => ({ width: el.clientWidth, content: el.scrollWidth }));
    expect(size.content).toBeLessThanOrEqual(size.width + 1);
    await page.screenshot({ path: testInfo.outputPath(`review-${width}.png`), fullPage: true });
  });

test('legacy idea without attempts offers manual AI and remains publishable with the flag off', async ({
  page,
}) => {
  let requested = 0;
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: originalIdea });
      return true;
    }
    if (path.endsWith('/ai-enhancement')) {
      requested++;
      await route.fulfill({
        status: 202,
        json: { id: AI_ID, attempt: 1, status: IdeaAiStatus.PENDING },
      });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-reprocess')).toHaveText('Melhorar ideia com IA');
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
  await page.getByTestId('idea-ai-reprocess').click();
  await expect.poll(() => requested).toBe(1);
});

test('shows attempt limit without disabling publication of the available result', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.attemptHistory = [3, 2, 1].map((attempt) => ({
    ...idea.aiEnhancement!.currentResult!,
    id: `attempt-${attempt}`,
    attempt,
  }));
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
  await expect(page.getByText('Limite de tentativas atingido.', { exact: false })).toBeVisible();
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
});
