import { expect, type Page, test } from '@playwright/test';

import {
  IdeaAiErrorCode,
  IdeaAiMediaStatus,
  IdeaAiStatus,
  type IdeasSectionResponse,
} from '@/features/ideas-sections/types';

import { aiFakeRequestsContaining } from '../support/aiFakeJournal';
import { TEACHER_EMAIL } from '../support/env';
import { waitForIdeaAi } from '../support/ideaAi';
import { IdeaAiScenarioFixture } from '../support/ideaAiScenario';
import { expectNoHorizontalOverflow } from '../support/responsive';
import { selectMuiOption } from '../support/ui';

/**
 * Melhoria de ideias por IA de ponta a ponta: o professor envia, a fila e o
 * worker chamam a IA simulada (`AI_PROVIDER_MODE=fake`), as guardas julgam, o
 * administrador revisa pela tela e o banco guarda o escolhido. Só a LLM é
 * substituída; as falhas são encenadas pelo marcador `[[ai-fake:...]]`.
 */
test.describe('Ideias compartilhadas com IA', () => {
  // A fila processa uma chamada por vez e o worker consulta a cada 5 s.
  test.describe.configure({ timeout: 120_000 });
  const scenario = new IdeaAiScenarioFixture();

  test.beforeAll(() => scenario.setUp());
  test.afterAll(() => scenario.tearDown());

  const submitIdea = (kind: string) => scenario.submit(kind);
  const openReview = (page: Page, ideaId: string) => scenario.openReview(page, ideaId);
  const publish = (page: Page) => scenario.publish(page);
  const stored = (ideaId: string) => scenario.stored(ideaId);

  test('a revisão fiel é destacada e publicada só depois de confirmar as escolhas', async ({ page }) => {
    const idea = await submitIdea('polish');
    const ready = await waitForIdeaAi(scenario.admin, idea.id);
    const result = ready.aiEnhancement!.currentResult!;
    // O vídeo por link não é melhorado pela IA e isso não torna o resultado parcial.
    expect(result.status).toBe(IdeaAiStatus.COMPLETED);
    expect(result.medias.map((media) => media.status)).toEqual([IdeaAiMediaStatus.SKIPPED]);
    expect(result.textGuard?.approved).toBe(true);
    expect(result.enhancedDescription).toMatch(/^Separe 3 bolas e forme 2 equipes/);

    await openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible();
    await expect(page.getByTestId('idea-ai-diff-added').first()).toBeVisible();

    await selectMuiOption(page, page.getByRole('combobox', { name: 'Página de destino' }), scenario.pageTitle);
    await selectMuiOption(page, page.getByRole('combobox', { name: 'Visibilidade' }), 'Pública');
    await page.getByRole('button', { name: 'Publicar ideia' }).click();
    // Sem confirmar, nada é publicado.
    await expect(page.getByText('Confirme as escolhas acima antes de publicar.')).toBeVisible();
    expect((await stored(idea.id)).pageId).toBeNull();

    await page.getByRole('checkbox', { name: 'Confirmo as escolhas' }).check();
    await page.getByRole('button', { name: 'Publicar ideia' }).click();
    await expect.poll(async () => (await stored(idea.id)).pageId).toBe(scenario.pageId);
    const published = await stored(idea.id);
    expect(published.public).toBe(true);
    expect(published.description).toBe(result.enhancedDescription);
    // O envio original do professor continua preservado.
    expect(published.aiEnhancement?.snapshot?.description).toBe(idea.description);
  });

  test('o pedido enviado à IA leva só os dados do professor, com saída estruturada', async () => {
    const idea = await submitIdea('');
    await waitForIdeaAi(scenario.admin, idea.id);

    const requests = aiFakeRequestsContaining(idea.title).filter((entry) => entry.feature === 'shared_ideas');
    expect(requests.length, 'texto + guarda de essência').toBeGreaterThanOrEqual(2);
    const [first] = requests;
    expect(first.path).toBe('/v1/responses');
    const body = first.body as {
      store: boolean;
      input: { role: string; content: string | { type: string; text: string }[] }[];
      text: { format: { type: string; strict: boolean; schema: { required: string[] } } };
    };
    expect(body.store, 'o provedor não guarda a ideia').toBe(false);
    expect(body.text.format).toMatchObject({ type: 'json_schema', strict: true });
    expect(body.text.format.schema.required).toEqual(expect.arrayContaining(['title', 'description']));
    const system = String(body.input[0].content);
    expect(body.input[0].role).toBe('system');
    expect(system.length).toBeGreaterThan(100);
    expect(system, 'dado do usuário não entra na instrução de sistema').not.toContain(idea.title);
    const user = (body.input[1].content as { text: string }[])[0].text;
    expect(user.startsWith('SOURCE_DATA\n')).toBe(true);
    const source = JSON.parse(user.slice('SOURCE_DATA\n'.length, user.lastIndexOf('\nEND_SOURCE_DATA')));
    expect(source).toMatchObject({ title: idea.title, description: idea.description });
    expect(JSON.stringify(requests)).not.toContain(TEACHER_EMAIL);
  });

  test('uma reescrita é reprovada pela guarda e o original do professor fica', async ({ page }) => {
    const idea = await submitIdea('rewrite');
    const ready = await waitForIdeaAi(scenario.admin, idea.id);
    const result = ready.aiEnhancement!.currentResult ?? ready.aiEnhancement!.attemptHistory[0];
    expect(result.textGuard?.approved).toBe(false);
    expect(result.enhancedDescription).toBeNull();

    await openReview(page, idea.id);
    await expect(page.getByRole('textbox', { name: 'Descrição da ideia' })).toHaveValue(idea.description);
    await expect(page.getByTestId('ideas-sections-ideas-section-review-page')).not.toContainText(
      'Texto completamente diferente'
    );
  });

  for (const failure of [
    { scenario: 'rate-limit', code: IdeaAiErrorCode.PROVIDER_REQUEST_FAILED, calls: 4, label: 'rate limit persistente: 4 chamadas' },
    { scenario: 'auth', code: IdeaAiErrorCode.PROVIDER_REQUEST_FAILED, calls: 1, label: 'chave inválida: sem repetir' },
    { scenario: 'timeout', code: IdeaAiErrorCode.PROVIDER_REQUEST_FAILED, calls: 1, label: 'timeout: sem repetir' },
    { scenario: 'invalid-json', code: IdeaAiErrorCode.INVALID_PROVIDER_RESPONSE, calls: 1, label: 'JSON inválido' },
    { scenario: 'truncated', code: IdeaAiErrorCode.INVALID_PROVIDER_RESPONSE, calls: 1, label: 'limite de tokens' },
  ]) {
    test(`falha da IA (${failure.label}) é registrada e a ideia original continua publicável`, async ({ page }) => {
      const idea = await submitIdea(failure.scenario);
      const ready = await waitForIdeaAi(scenario.admin, idea.id);
      const attempt = ready.aiEnhancement!.attemptHistory[0];
      expect({ status: attempt.status, errorCode: attempt.errorCode }).toEqual({
        status: IdeaAiStatus.FAILED,
        errorCode: failure.code,
      });
      expect(aiFakeRequestsContaining(idea.marker)).toHaveLength(failure.calls);

      await openReview(page, idea.id);
      await expect(page.getByTestId('idea-ai-failed')).toBeVisible();
      await publish(page);
      await expect.poll(async () => (await stored(idea.id)).pageId).toBe(scenario.pageId);
      expect((await stored(idea.id)).description).toBe(idea.description);
    });
  }

  test('falha passageira do provedor é superada pelo retry', async () => {
    const idea = await submitIdea('server-error:2');
    const ready = await waitForIdeaAi(scenario.admin, idea.id);
    expect(ready.aiEnhancement!.attemptHistory[0].status).toBe(IdeaAiStatus.COMPLETED);
    const calls = aiFakeRequestsContaining(idea.marker);
    expect(calls.slice(0, 3).map((call) => call.scenario)).toEqual(['server-error', 'server-error', null]);
  });

  for (const width of [390, 1440]) {
    test(`reprocessar pela tela recupera uma tentativa que falhou, em ${width}px`, async ({ page }) => {
      // As 4 chamadas da primeira tentativa falham; a segunda tentativa responde.
      const idea = await submitIdea('rate-limit:4');
      await waitForIdeaAi(scenario.admin, idea.id);
      await page.setViewportSize({ width, height: 900 });
      await openReview(page, idea.id);
      await expect(page.getByTestId('idea-ai-failed')).toBeVisible();

      await page.getByTestId('idea-ai-reprocess').click();
      const dialog = page.getByTestId('idea-ai-regenerate-dialog');
      if (await dialog.isVisible()) await page.getByTestId('idea-ai-regenerate-confirm').click();
      await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible({ timeout: 60_000 });
      const latest = await stored(idea.id);
      expect(latest.aiEnhancement?.attemptHistory.map((item) => item.status).sort()).toEqual(
        [IdeaAiStatus.COMPLETED, IdeaAiStatus.FAILED].sort()
      );
      await expectNoHorizontalOverflow(page, page.getByTestId('ideas-sections-ideas-section-review-page'));
    });
  }

  test('durante a geração a tela mostra o andamento e permite cancelar', async ({ page }) => {
    const idea = await submitIdea('slow');
    await openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-progress')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('idea-ai-cancel').click();
    await expect
      .poll(async () => (await stored(idea.id)).aiEnhancement?.activeAttempt ?? null, { timeout: 60_000 })
      .toBeNull();
    expect((await stored(idea.id)).aiEnhancement?.attemptHistory[0].errorCode).toBe(IdeaAiErrorCode.CANCELLED);
    await expect(page.getByTestId('idea-ai-progress')).toHaveCount(0);
  });

  test('publicar durante a geração pede confirmação, cancela a IA e publica o original', async ({ page }) => {
    const idea = await submitIdea('slow');
    await openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-progress')).toBeVisible({ timeout: 30_000 });
    // A edição do administrador precisa sobreviver ao "publicar sem a IA".
    const editedTitle = `${idea.title} (coordenação)`;
    await page.getByRole('textbox', { name: 'Título da ideia' }).fill(editedTitle);
    await publish(page);

    const dialog = page.getByTestId('idea-ai-publish-original-dialog');
    await expect(dialog).toContainText('A IA ainda está trabalhando');
    await dialog.getByTestId('idea-ai-wait').click();
    expect((await stored(idea.id)).pageId).toBeNull();

    await page.getByRole('button', { name: 'Publicar ideia' }).click();
    await dialog.getByTestId('idea-ai-confirm-publish-original').click();
    await expect.poll(async () => (await stored(idea.id)).pageId).toBe(scenario.pageId);
    expect(await stored(idea.id)).toMatchObject({ title: editedTitle, description: idea.description });
  });

  test('com a flag da IA desligada o envio não vai para a LLM e a ideia continua publicável', async ({ page }) => {
    await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: false });
    try {
      const idea = await submitIdea('');
      await openReview(page, idea.id);
      await expect(page.getByTestId('idea-ai-status-panel')).toHaveCount(0);
      await publish(page);
      await expect.poll(async () => (await stored(idea.id)).pageId).toBe(scenario.pageId);
      expect(aiFakeRequestsContaining(idea.title)).toEqual([]);
      const refused = await scenario.admin.send('POST', `/ideas-sections/${idea.id}/ai-enhancement`, {});
      expect({ status: refused.status, code: refused.code }).toMatchObject({ status: 403 });
    } finally {
      await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: true });
    }
  });
});
