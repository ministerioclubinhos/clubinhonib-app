import { expect, test } from '@playwright/test';
import { DEFAULT_AI_PROVIDER_SETTINGS } from '@/features/ai-providers/constants';
import {
  AiProviderSettings,
  LlmProviderType,
  type SaveAiProviderSettingsRequest,
} from '@/features/ai-providers/types';

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
      const payload = request.postDataJSON() as SaveAiProviderSettingsRequest;
      saved = {
        llmProvider: payload.llmProvider,
        openai: { ...payload.openai, hasApiKey: false },
        gemini: { ...payload.gemini, hasApiKey: false },
      };
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

test('refetch preserva edição local; modelos com erro não anunciam sucesso; chave salva fica ausente', async ({
  page,
}) => {
  const settings = structuredClone(DEFAULT_AI_PROVIDER_SETTINGS);
  settings.openai.hasApiKey = true;
  let failModels = false;
  await page.route('**/api/v1/lessons/providers/**', (route) => {
    if (route.request().url().endsWith('/models')) {
      return route.fulfill(
        failModels
          ? { status: 503, json: { message: 'Temporariamente indisponível' } }
          : {
              json: {
                models: {
                  general: [settings.openai.generalModel],
                  image: [settings.openai.imageModel],
                },
              },
            }
      );
    }
    return route.fulfill({
      json: { ...settings, openai: { ...settings.openai, apiKey: 'synthetic-persisted-secret' } },
    });
  });
  await page.goto('/adm/config-provedores-ia');
  await expect(page.getByLabel('OPENAI_API_KEY', { exact: true })).toHaveValue('');
  await page.getByLabel('maxRetries', { exact: true }).fill('7');
  settings.gemini.maxRetries = 2;
  await page.getByRole('button', { name: /Recarregar|Atualizar configurações/ }).click();
  await expect(page.getByLabel('maxRetries', { exact: true })).toHaveValue('7');
  expect(await page.content()).not.toContain('synthetic-persisted-secret');
  failModels = true;
  await page.getByRole('button', { name: /Consultar Modelos|Buscar modelos/ }).click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText(
    'Não foi possível consultar'
  );
  await expect(page.getByTestId('ai-providers-config-feedback')).not.toContainText('disponíveis:');
});
