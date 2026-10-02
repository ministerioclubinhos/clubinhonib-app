import { expect, test } from '@playwright/test';
import { DEFAULT_AI_PROVIDER_SETTINGS } from '@/features/ai-providers/constants';
import { AiProviderSettings, LlmProviderType } from '@/features/ai-providers/types';

test('salva Gemini no servidor, recarrega a escolha e não anuncia sucesso em erro', async ({
  page,
}) => {
  let saved: AiProviderSettings = structuredClone(DEFAULT_AI_PROVIDER_SETTINGS);
  let rejectSave = false;
  await page.route('**/api/v1/lessons/providers/**', async (route) => {
    const request = route.request();
    if (new URL(request.url()).pathname.endsWith('/models')) {
      const isGemini = request.url().includes('/gemini/');
      await route.fulfill({
        json: {
          models: {
            general: [isGemini ? saved.gemini.generalModel : saved.openai.generalModel],
            image: [isGemini ? saved.gemini.imageModel : saved.openai.imageModel],
          },
        },
      });
      return;
    }
    if (request.method() === 'PUT') {
      if (rejectSave) {
        await route.fulfill({
          status: 400,
          json: {
            success: false,
            error: { code: 'VAL_4001', message: 'Parâmetros inválidos.', details: null },
          },
        });
        return;
      }
      saved = request.postDataJSON() as AiProviderSettings;
    }
    await route.fulfill({ json: saved });
  });
  await page.goto('/adm/config-provedores-ia');
  await page.getByTestId('ai-provider-radio-gemini').click();
  await page.getByLabel('maxRetries', { exact: true }).fill('0');
  await page.getByTestId('ai-providers-save-button').click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText('sucesso');
  expect(saved.llmProvider).toBe(LlmProviderType.GEMINI);
  expect(saved.gemini.maxRetries).toBe(0);
  expect(typeof saved.gemini.retryBaseDelayMs).toBe('number');
  await page.reload();
  await expect(page.getByTestId('ai-provider-radio-gemini').getByRole('radio')).toBeChecked();
  rejectSave = true;
  await page.getByLabel('maxRetries', { exact: true }).fill('1');
  await page.getByTestId('ai-providers-save-button').click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText(
    'Parâmetros inválidos'
  );
  expect(saved.gemini.maxRetries).toBe(0);
});
