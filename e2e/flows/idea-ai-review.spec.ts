import { expect, test } from '@playwright/test';

import {
  IdeaAiMediaStatus,
  IdeaAiScope,
  IdeaAiStatus,
} from '@/features/ideas-sections/types';

import { aiFakeRequestsContaining } from '../support/aiFakeJournal';
import { waitForIdeaAi } from '../support/ideaAi';
import { IdeaAiScenarioFixture, photoUpload, scannedPdfUpload } from '../support/ideaAiScenario';
import { expectNoHorizontalOverflow } from '../support/responsive';
import { selectMuiOption } from '../support/ui';

/**
 * Revisão das ideias melhoradas por IA, de ponta a ponta: mídias comparadas,
 * regeneração dirigida, histórico, limite, texto editado pelo administrador,
 * fila e estados somente leitura. Só a LLM é simulada.
 */
test.describe('Revisão de ideias com IA', () => {
  test.describe.configure({ timeout: 180_000 });
  const scenario = new IdeaAiScenarioFixture();

  test.beforeAll(() => scenario.setUp());
  test.afterAll(() => scenario.tearDown());

  for (const { width, keepOriginal } of [
    { width: 390, keepOriginal: true },
    { width: 1440, keepOriginal: false },
  ]) {
    const choice = keepOriginal ? 'mantém os originais' : 'publica as melhorias';
    test(`compara foto e PDF digitalizado e ${choice}, em ${width}px`, async ({ page }, testInfo) => {
      const uploads = [await photoUpload(page), await scannedPdfUpload(page)];
      const idea = await scenario.submit('polish', uploads);
      const ready = await waitForIdeaAi(scenario.admin, idea.id);
      const result = ready.aiEnhancement!.currentResult!;
      // A mensagem leva o motivo de cada mídia, para a falha se explicar.
      expect(
        result.medias.map((media) => media.status),
        JSON.stringify(result.medias.map(({ skipReason, errorCode, guard }) => ({ skipReason, errorCode, guard })))
      ).toEqual([
        IdeaAiMediaStatus.ENHANCED,
        IdeaAiMediaStatus.ENHANCED,
      ]);
      const originals = ready.medias.map((media) => media.url);

      await page.setViewportSize({ width, height: 900 });
      await scenario.openReview(page, idea.id);
      await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible();
      const slider = page.getByTestId('idea-ai-image-slider').getByRole('slider');
      const compare = page.getByTestId('idea-ai-image-slider').locator('xpath=..');
      await compare.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
      await compare.screenshot({ path: testInfo.outputPath(`comparacao-foto-${width}.png`) });
      const before = await slider.getAttribute('aria-valuenow');
      await slider.press('ArrowRight');
      await expect(slider).not.toHaveAttribute('aria-valuenow', before as string);
      await page.getByTestId('idea-ai-document-preview').first().click();
      await expect(page.getByTestId('ideas-media-preview-dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Fechar', exact: true }).click();
      await expectNoHorizontalOverflow(page, page.getByTestId('ideas-sections-ideas-section-review-page'));
      await page.screenshot({ path: testInfo.outputPath(`revisao-midias-${width}.png`), fullPage: true });

      if (keepOriginal) await page.getByTestId('idea-ai-use-original').click();
      await scenario.chooseDestination(page);
      await page.getByRole('checkbox', { name: 'Confirmo as escolhas' }).check();
      await page.getByRole('button', { name: 'Publicar ideia' }).click();
      const published = await scenario.waitPublished(idea.id);
      const urls = published.medias.map((media) => media.url);
      expect(urls).toHaveLength(2);
      if (keepOriginal) {
        expect(urls.sort()).toEqual([...originals].sort());
        expect(published.description).toBe(idea.description);
      } else {
        for (const url of urls) expect(originals).not.toContain(url);
        expect(published.description).toBe(result.enhancedDescription);
      }
    });
  }

  test('o texto da IA ajustado pelo administrador é o que fica publicado', async ({ page }) => {
    const idea = await scenario.submit('polish');
    const ready = await waitForIdeaAi(scenario.admin, idea.id);
    await scenario.openReview(page, idea.id);
    const description = page.getByTestId('idea-ai-final-description');
    await expect(description).toHaveValue(ready.aiEnhancement!.currentResult!.enhancedDescription!);
    const edited = `${idea.description} Revisado pela coordenação.`;
    await description.fill(edited);
    await scenario.chooseDestination(page);
    await page.getByRole('checkbox', { name: 'Confirmo as escolhas' }).check();
    await page.getByRole('button', { name: 'Publicar ideia' }).click();
    const published = await scenario.waitPublished(idea.id);
    expect(published.description).toBe(edited);
    expect(published.aiEnhancement?.snapshot?.description).toBe(idea.description);

    // Publicada: somente leitura e sem ações de IA.
    await scenario.openReview(page, idea.id);
    await expect(page.getByTestId('idea-review-published')).toBeVisible();
    await expect(page.getByTestId('idea-ai-reprocess')).toHaveCount(0);
    await expect(page.getByTestId('idea-review-publish')).toBeDisabled();
    const refused = await scenario.admin.send('POST', `/ideas-sections/${idea.id}/ai-enhancement`, {});
    expect(refused.status).toBeGreaterThanOrEqual(400);
    expect(refused.status).toBeLessThan(500);
  });

  test('regenera só o texto com orientação e restaura a tentativa anterior', async ({ page }) => {
    const idea = await scenario.submit('polish');
    await waitForIdeaAi(scenario.admin, idea.id);
    await scenario.openReview(page, idea.id);
    const instructions = `Frases curtas, referência ${idea.id.slice(0, 8)}.`;

    await page.getByTestId('idea-ai-reprocess').click();
    await page.getByTestId('idea-ai-scope-text').check();
    await page.getByTestId('idea-ai-instructions').fill(instructions);
    await page.getByTestId('idea-ai-regenerate-confirm').click();
    await expect(page.getByTestId('idea-ai-regenerate-dialog')).toBeHidden();
    await expect
      .poll(
        async () => {
          const ai = (await scenario.stored(idea.id)).aiEnhancement!;
          return ai.activeAttempt ? 0 : ai.currentResult?.attempt;
        },
        { timeout: 90_000 }
      )
      .toBe(2);
    const second = (await scenario.stored(idea.id)).aiEnhancement!.currentResult!;
    expect({ scope: second.scope, instructions: second.instructions }).toEqual({
      scope: IdeaAiScope.TEXT,
      instructions,
    });
    // A orientação chegou de fato ao pedido enviado à IA.
    expect(aiFakeRequestsContaining(instructions).length).toBeGreaterThan(0);

    await page.reload();
    await page.getByTestId('idea-ai-history').click();
    await expect(page.getByTestId('idea-ai-history-2')).toContainText(instructions);
    await page.getByTestId('idea-ai-restore-1').click();
    await expect
      .poll(async () => (await scenario.stored(idea.id)).aiEnhancement!.currentResult?.attempt)
      .toBe(1);
    await expect(page.getByTestId('idea-ai-history-1')).toContainText('Em comparação');
  });

  test('no limite de tentativas a tela e a API param, e a publicação continua', async ({ page }) => {
    test.setTimeout(240_000);
    const idea = await scenario.submit('polish');
    let ai = (await waitForIdeaAi(scenario.admin, idea.id)).aiEnhancement!;
    while (ai.attemptsUsed < ai.maxAttempts) {
      const used = ai.attemptsUsed;
      await scenario.admin.post(`/ideas-sections/${idea.id}/ai-enhancement`, { scope: IdeaAiScope.TEXT });
      await expect
        .poll(
          async () => {
            ai = (await scenario.stored(idea.id)).aiEnhancement!;
            return !ai.activeAttempt && ai.attemptsUsed > used;
          },
          { timeout: 90_000 }
        )
        .toBe(true);
    }
    const refused = await scenario.admin.send('POST', `/ideas-sections/${idea.id}/ai-enhancement`, {
      scope: IdeaAiScope.TEXT,
    });
    expect(refused.status).toBeGreaterThanOrEqual(400);
    expect(refused.status).toBeLessThan(500);

    await scenario.openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
    await expect(page.getByTestId('idea-ai-limit')).toBeVisible();
    await expect(page.getByTestId('idea-ai-block-reason')).toHaveText('Limite de tentativas atingido.');
    await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
  });

  test('ideia enviada sem IA pode ser melhorada manualmente depois', async ({ page }) => {
    await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: false });
    let idea;
    try {
      idea = await scenario.submit('polish');
    } finally {
      await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: true });
    }
    await scenario.openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-reprocess')).toHaveText('Melhorar ideia com IA…');
    await page.getByTestId('idea-ai-reprocess').click();
    // Sem resultado anterior, só "Tudo de novo" faz sentido.
    await expect(page.getByTestId('idea-ai-scope-text')).toBeDisabled();
    await page.getByTestId('idea-ai-regenerate-confirm').click();
    await expect(page.getByTestId('idea-ai-compare-panel')).toBeVisible({ timeout: 90_000 });
    expect((await scenario.stored(idea.id)).aiEnhancement?.currentResult?.status).toBe(
      IdeaAiStatus.COMPLETED
    );
  });

  test('com a flag desligada depois do resultado, a revisão publica o original sem IA', async ({ page }) => {
    const idea = await scenario.submit('polish');
    await waitForIdeaAi(scenario.admin, idea.id);
    await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: false });
    try {
      await scenario.openReview(page, idea.id);
      await expect(page.getByTestId('idea-ai-status-panel')).toHaveCount(0);
      await expect(page.getByTestId('idea-ai-compare-panel')).toHaveCount(0);
      await scenario.publish(page);
      expect((await scenario.waitPublished(idea.id)).description).toBe(idea.description);
    } finally {
      await scenario.admin.patch('/feature-flags/idea_ai_enhancement', { enabled: true });
    }
  });

  test('a fila filtra pelo estado da IA', async ({ page }) => {
    const ready = await scenario.submit('polish');
    const failed = await scenario.submit('auth');
    await waitForIdeaAi(scenario.admin, ready.id);
    await waitForIdeaAi(scenario.admin, failed.id);
    await page.goto('/adm/ideias-compartilhadas');
    await expect(page.getByText(failed.title)).toBeVisible();
    await selectMuiOption(
      page,
      page.getByRole('combobox', { name: 'Melhoria por IA' }),
      'Melhoria pronta para revisar'
    );
    await expect(page.getByText(ready.title)).toBeVisible();
    await expect(page.getByText(failed.title)).toHaveCount(0);
  });

  test('sem provedor configurado a tela explica e a publicação continua', async ({ page }) => {
    const idea = await scenario.submit('polish');
    await waitForIdeaAi(scenario.admin, idea.id);
    // Remover a chave real do ambiente destruiria a configuração: só este campo
    // da resposta verdadeira é alterado.
    await page.route(`**/ideas-sections/${idea.id}`, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.aiEnhancement.providerReady = false;
      await route.fulfill({ response, json: body });
    });
    await scenario.openReview(page, idea.id);
    await expect(page.getByTestId('idea-ai-provider-missing')).toBeVisible();
    await expect(page.getByTestId('idea-ai-reprocess')).toBeDisabled();
    await expect(page.getByTestId('idea-review-publish')).toBeEnabled();
  });
});
