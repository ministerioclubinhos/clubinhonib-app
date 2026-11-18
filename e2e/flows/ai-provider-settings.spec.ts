import { expect, test } from '@playwright/test';
import { DEFAULT_AI_PROVIDER_SETTINGS } from '@/features/ai-providers/constants';
import { AI_PROVIDER_PROFILES } from '@/features/ai-providers/constants';
import {
  AiModelCatalogSource,
  AiProviderProfile,
  AiProviderSettings,
  LlmProviderType,
  type SaveAiProviderSettingsRequest,
} from '@/features/ai-providers/types';

test('salva Gemini no servidor, recarrega a escolha e não anuncia sucesso em erro', async ({
  page,
}) => {
  let saved: AiProviderSettings = structuredClone(DEFAULT_AI_PROVIDER_SETTINGS);
  // The API refuses to activate a provider without a key; the page mirrors that rule.
  saved.openai.hasApiKey = true;
  saved.gemini.hasApiKey = true;
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
        openai: { ...payload.openai, hasApiKey: true },
        gemini: { ...payload.gemini, hasApiKey: true },
      };
    }
    await route.fulfill({ json: saved });
  });
  await page.goto('/adm/config-provedores-ia');
  await page.getByTestId('ai-provider-radio-gemini').click();
  await page.getByTestId('ai-provider-gemini-max-retries').fill('0');
  await page.getByTestId('ai-providers-save-button').click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText('sucesso');
  expect(saved.llmProvider).toBe(LlmProviderType.GEMINI);
  expect(saved.gemini.maxRetries).toBe(0);
  expect(typeof saved.gemini.retryBaseDelayMs).toBe('number');
  await page.reload();
  await expect(page.getByTestId('ai-provider-radio-gemini').getByRole('radio')).toBeChecked();
  rejectSave = true;
  await page.getByTestId('ai-provider-gemini-max-retries').fill('1');
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
  await expect(page.getByTestId('ai-provider-openai-key-input')).toHaveValue('');
  await page.getByTestId('ai-provider-gemini-max-retries').fill('4');
  settings.gemini.maxRetries = 2;
  await page.getByRole('button', { name: /Recarregar|Atualizar configurações/ }).click();
  await expect(page.getByTestId('ai-provider-gemini-max-retries')).toHaveValue('4');
  expect(await page.content()).not.toContain('synthetic-persisted-secret');
  failModels = true;
  await page.getByTestId('ai-providers-fetch-models-button').click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText(
    'Não foi possível consultar'
  );
  await expect(page.getByTestId('ai-providers-config-feedback')).not.toContainText('disponíveis:');
});

test('perfil de testes preenche os dois provedores, salva e pode voltar para produção ou manual', async ({
  page,
}) => {
  let saved: AiProviderSettings = structuredClone(DEFAULT_AI_PROVIDER_SETTINGS);
  saved.openai.hasApiKey = true;
  let lastPayload: SaveAiProviderSettingsRequest | undefined;
  await page.route('**/api/v1/lessons/providers/**', async (route) => {
    const request = route.request();
    if (new URL(request.url()).pathname.endsWith('/models')) {
      await route.fulfill({
        json: {
          models: { general: [saved.openai.generalModel], image: [saved.openai.imageModel] },
          source: AiModelCatalogSource.LIVE,
        },
      });
      return;
    }
    if (request.method() === 'PUT') {
      lastPayload = request.postDataJSON() as SaveAiProviderSettingsRequest;
      saved = {
        llmProvider: lastPayload.llmProvider,
        openai: { ...lastPayload.openai, hasApiKey: true },
        gemini: { ...lastPayload.gemini, hasApiKey: false },
      };
    }
    await route.fulfill({ json: saved });
  });
  await page.goto('/adm/config-provedores-ia');
  await expect(page.getByTestId('ai-providers-saved-profile')).toHaveAttribute(
    'data-profile',
    AiProviderProfile.PRODUCTION
  );
  await expect(page.getByTestId('ai-providers-save-button')).toBeDisabled();
  await page.getByTestId('ai-providers-profile-test').click();
  await expect(page.getByTestId('ai-providers-profile-test')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  // The live catalog of this key does not list the cheaper models: the page says so.
  await expect(page.getByTestId('ai-providers-missing-models')).toContainText(
    AI_PROVIDER_PROFILES[AiProviderProfile.TEST].openai.imageModel
  );
  await page.getByTestId('ai-providers-save-button').click();
  await expect(page.getByTestId('ai-providers-config-feedback')).toContainText('sucesso');
  expect(lastPayload?.openai).toEqual(AI_PROVIDER_PROFILES[AiProviderProfile.TEST].openai);
  expect(lastPayload?.gemini).toEqual(AI_PROVIDER_PROFILES[AiProviderProfile.TEST].gemini);
  expect(lastPayload?.llmProvider).toBe(LlmProviderType.OPENAI);
  await expect(page.getByTestId('ai-providers-saved-profile')).toHaveAttribute(
    'data-profile',
    AiProviderProfile.TEST
  );
  // A manual change is still possible and turns the profile into a custom one.
  await page.getByTestId('ai-provider-gemini-max-retries').fill('2');
  await expect(page.getByTestId('ai-providers-custom-profile')).toBeVisible();
  // Discarding goes back to the saved profile with nothing left to save.
  await page.getByTestId('ai-providers-discard-button').click();
  await expect(page.getByTestId('ai-providers-save-button')).toBeDisabled();
  await page.getByTestId('ai-providers-profile-production').click();
  await page.getByTestId('ai-providers-save-button').click();
  await expect(page.getByTestId('ai-providers-saved-profile')).toHaveAttribute(
    'data-profile',
    AiProviderProfile.PRODUCTION
  );
});
