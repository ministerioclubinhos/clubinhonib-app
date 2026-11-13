import { expect, test } from '@playwright/test';
import {
  AI_ID,
  IDEA_ID,
  PAGE_ID,
  ideaWithAi,
  mockIdeasApp,
  originalIdea,
} from '../support/ideasMocks';
import { IdeaAiMediaStatus, IdeaAiStatus } from '../../src/features/ideas-sections/types';
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
  await expect(page.locator('[data-testid^="idea-ai-text-compare-"]')).toHaveCount(2);
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
  // "Manter tudo original" também devolve o texto final ao original.
  expect(published).toContain(`"description":"${originalIdea.description}"`);
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
  await expect(page.getByTestId('idea-ai-regenerate-dialog')).toBeVisible();
  await page.getByTestId('idea-ai-scope-full').check();
  await page.getByTestId('idea-ai-regenerate-confirm').click();
  // A primeira atualização falha (503): o acompanhamento espera e tenta de novo.
  await expect(page.getByTestId('idea-ai-progress')).toBeVisible({ timeout: 20000 });
  expect(requested).toBe(true);
  await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
  await expect(page.getByTestId('idea-ai-cancel')).toBeVisible();
  await expect(page.getByTestId('idea-ai-text-diff-description')).toContainText(
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
  // A edição do admin precisa sobreviver ao "publicar sem a IA".
  await page.getByTestId('idea-ai-final-title').fill('Gincana revisada pela coordenação');
  await page.getByRole('combobox', { name: 'Página de destino' }).click();
  await page.getByRole('option', { name: 'Atividades do Clubinho' }).click();
  await page.getByTestId('idea-review-publish').click();
  await expect(page.getByTestId('idea-ai-publish-original-dialog')).toBeVisible();
  await page.getByTestId('idea-ai-confirm-publish-original').click();
  await expect.poll(() => published).toContain('"ignoreAiEnhancement":true');
  expect(published).not.toContain('"aiDecisions"');
  expect(published).toContain('"title":"Gincana revisada pela coordenação"');
  expect(published).toContain('Roteiro da atividade.pdf');
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
  await expect(page.getByTestId('idea-ai-reprocess')).toHaveText('Melhorar ideia com IA…');
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
  await page.getByTestId('idea-ai-reprocess').click();
  // Sem resultado, só "Tudo de novo" faz sentido.
  await expect(page.getByTestId('idea-ai-scope-text')).toBeDisabled();
  await page.getByTestId('idea-ai-regenerate-confirm').click();
  await expect.poll(() => requested).toBe(1);
});

test('shows attempt limit without disabling publication of the available result', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.attemptHistory = [5, 4, 3, 2, 1].map((attempt) => ({
    ...idea.aiEnhancement!.currentResult!,
    id: `attempt-${attempt}`,
    attempt,
  }));
  idea.aiEnhancement!.attemptsUsed = 5;
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
  await expect(page.getByTestId('idea-ai-limit')).toBeVisible();
  await expect(page.getByTestId('idea-ai-block-reason')).toHaveText(
    'Limite de tentativas atingido.'
  );
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
});

test('targeted regeneration sends scope and instructions; cancel and restore call the API', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.currentResult!.medias[1] = {
    ...idea.aiEnhancement!.currentResult!.medias[1],
    status: IdeaAiMediaStatus.REJECTED_BY_GUARD,
    enhancedMedia: null,
    guard: { approved: false, violations: ['Um objeto da foto foi removido.'] },
  };
  const previous = {
    ...idea.aiEnhancement!.currentResult!,
    id: 'f9beee3f-e7ca-49ba-8095-24538a2d20a1',
    attempt: 1,
  };
  idea.aiEnhancement!.currentResult!.attempt = 2;
  idea.aiEnhancement!.attemptHistory = [idea.aiEnhancement!.currentResult!, previous];
  const requests: string[] = [];
  await mockIdeasApp(page, async (route, path) => {
    const method = route.request().method();
    if (path.endsWith('/ai-enhancement') && method === 'POST') {
      requests.push(`POST ${route.request().postData() ?? ''}`);
      await route.fulfill({ status: 202, json: { id: 'next', attempt: 3, status: 'PENDING' } });
      return true;
    }
    if (path.endsWith('/ai-enhancement/active') && method === 'DELETE') {
      requests.push('DELETE');
      await route.fulfill({ status: 204, body: '' });
      return true;
    }
    if (path.endsWith('/current') && method === 'PATCH') {
      requests.push(`PATCH ${path}`);
      await route.fulfill({ status: 204, body: '' });
      return true;
    }
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-guard-warning')).toContainText(
    'Um objeto da foto foi removido.'
  );
  await page.getByTestId('idea-ai-reprocess').click();
  // Há item reprovado: a opção sugerida é refazer só o que falhou.
  await expect(page.getByTestId('idea-ai-scope-failed')).toBeChecked();
  await page.getByTestId('idea-ai-scope-media').check();
  await expect(page.getByTestId('idea-ai-regenerate-confirm')).toBeDisabled();
  await page.getByTestId(`idea-ai-scope-media-${originalIdea.medias[1].id}`).check();
  await page.getByTestId('idea-ai-instructions').fill('Preserve todos os objetos da foto.');
  await expect(page.getByTestId('idea-ai-regenerate-cost')).toContainText('4 tentativa(s)');
  await page.getByTestId('idea-ai-regenerate-confirm').click();
  await expect.poll(() => requests[0]).toContain('"scope":"MEDIA"');
  expect(requests[0]).toContain(`"mediaIds":["${originalIdea.medias[1].id}"]`);
  expect(requests[0]).toContain('"instructions":"Preserve todos os objetos da foto."');
  await expect(page.getByTestId('idea-ai-regenerate-dialog')).toBeHidden();

  await page.getByTestId('idea-ai-history').click();
  await page.getByTestId('idea-ai-restore-1').click();
  await expect.poll(() => requests[1]).toBe(`PATCH /ideas-sections/${IDEA_ID}/ai-enhancement/${previous.id}/current`);

  idea.aiEnhancement!.activeAttempt = {
    ...previous,
    id: 'active',
    attempt: 3,
    status: IdeaAiStatus.PROCESSING,
    progressDone: 1,
    progressTotal: 2,
  };
  await page.reload();
  await expect(page.getByTestId('idea-ai-progress')).toContainText('1 de 2 itens prontos');
  await page.getByTestId('idea-ai-cancel').click();
  await expect.poll(() => requests[2]).toBe('DELETE');
});

test('publishes the admin-edited AI text with the choices', async ({ page }) => {
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
  const description = page.getByTestId('idea-ai-final-description');
  await expect(description).toHaveValue(
    'Forme 2 equipes e separe 3 bolas. Antes da atividade, leia João 3:16.'
  );
  // Texto reorganizado pela IA: sem marcação palavra a palavra, com aviso.
  await expect(page.getByTestId('idea-ai-text-diff-description')).toContainText(
    'A IA reorganizou o texto'
  );
  await expect(page.getByTestId('idea-ai-text-diff-description').locator('ins')).toHaveCount(0);
  await description.fill('Forme 2 equipes e separe 3 bolas. Leia João 3:16 juntos.');
  await page.getByRole('combobox', { name: 'Página de destino' }).click();
  await page.getByRole('option', { name: 'Atividades do Clubinho' }).click();
  await page.getByTestId('idea-ai-confirm-choices').getByRole('checkbox').check();
  await page.getByTestId('idea-review-publish').click();
  await expect.poll(() => published).toContain('"description":"ENHANCED"');
  expect(published).toContain('"description":"Forme 2 equipes e separe 3 bolas. Leia João 3:16 juntos."');
});

test('without a configured provider the review explains it and stays publishable', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.providerReady = false;
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-provider-missing')).toBeVisible();
  await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
});

test('a published idea is read-only and offers no AI actions', async ({ page }) => {
  const idea = { ...ideaWithAi(), pageId: PAGE_ID };
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-review-published')).toBeVisible();
  await expect(page.getByTestId('idea-ai-reprocess')).toHaveCount(0);
  await expect(page.getByTestId('idea-ai-final-title')).toBeDisabled();
  await expect(page.getByTestId('idea-ai-use-all')).toBeDisabled();
  await expect(page.getByTestId('idea-review-publish')).toBeDisabled();
});

test('the queue filters by AI status through the API', async ({ page }) => {
  const queries: string[] = [];
  await mockIdeasApp(page, async (route, path) => {
    if (path === '/ideas-sections') {
      queries.push(new URL(route.request().url()).search);
      return false;
    }
    return false;
  });
  await page.goto('/adm/ideias-compartilhadas');
  await expect(page.getByTestId('idea-ai-status-chip').first()).toBeVisible();
  await page.getByRole('combobox', { name: 'Melhoria por IA' }).click();
  await page.getByRole('option', { name: 'Melhoria pronta para revisar' }).click();
  await expect.poll(() => queries.at(-1)).toContain('aiStatus=READY');
});

test('small changes are highlighted with ins/del, not only by color', async ({ page }) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.currentResult!.enhancedTitle = 'Gincana alegre do Bom Pastor';
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-text-diff-title').locator('ins')).toHaveText('alegre ');
  await expect(page.getByTestId('idea-ai-text-original-title').locator('del')).toHaveCount(0);
  await expect(page.getByTestId('idea-ai-final-title')).toHaveValue('Gincana alegre do Bom Pastor');
});

test('with the AI flag off there are no AI actions but results stay publishable', async ({
  page,
}) => {
  const idea = ideaWithAi();
  idea.aiEnhancement!.enabled = false;
  await mockIdeasApp(page, async (route, path) => {
    if (path === `/ideas-sections/${IDEA_ID}`) {
      await route.fulfill({ json: idea });
      return true;
    }
    return false;
  });
  await page.goto(`/adm/editar-ideias-compartilhadas/${IDEA_ID}`);
  await expect(page.getByTestId('idea-ai-disabled')).toBeVisible();
  await expect(page.getByTestId('idea-ai-reprocess')).toHaveCount(0);
  await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible();
  await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
});
