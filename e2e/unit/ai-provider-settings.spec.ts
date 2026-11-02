import { expect, test } from '@playwright/test';
import {
  buildAiProviderSettingsPayload,
  providerSettingsForm,
  publicAiProviderSettings,
  liveModelsFeedback,
} from '@/features/ai-providers/utils';
import { DEFAULT_AI_PROVIDER_SETTINGS } from '@/features/ai-providers/constants';
import {
  ApiKeyAction,
  AiModelCatalogSource,
  LlmProviderType,
  AiProviderFeedbackSeverity,
} from '@/features/ai-providers/types';

test('preservar omite chave; substituir envia nova chave; remover envia vazio sem metadados', () => {
  const form = providerSettingsForm(DEFAULT_AI_PROVIDER_SETTINGS);
  form.llmProvider = LlmProviderType.GEMINI;
  form.gemini.maxRetries = 0;
  expect(buildAiProviderSettingsPayload(form).gemini.maxRetries).toBe(0);
  expect(buildAiProviderSettingsPayload(form).openai).not.toHaveProperty('apiKey');
  expect(buildAiProviderSettingsPayload(form).openai).not.toHaveProperty('hasApiKey');
  form.openai.keyAction = ApiKeyAction.REPLACE;
  form.openai.apiKey = ' synthetic-new-key ';
  expect(buildAiProviderSettingsPayload(form).openai.apiKey).toBe('synthetic-new-key');
  form.openai.keyAction = ApiKeyAction.REMOVE;
  expect(buildAiProviderSettingsPayload(form).openai.apiKey).toBe('');
});

test('segredo de resposta legada não entra no cache nem no formulário', () => {
  const legacy = {
    ...DEFAULT_AI_PROVIDER_SETTINGS,
    openai: {
      ...DEFAULT_AI_PROVIDER_SETTINGS.openai,
      hasApiKey: true,
      apiKey: 'synthetic-persisted-secret',
    },
    gemini: { ...DEFAULT_AI_PROVIDER_SETTINGS.gemini, apiKey: 'synthetic-other-secret' },
  };
  expect(JSON.stringify(publicAiProviderSettings(legacy))).not.toContain('secret');
  expect(providerSettingsForm(legacy).openai.apiKey).toBe('');
  expect(providerSettingsForm(legacy).gemini.keyAction).toBe(ApiKeyAction.PRESERVE);
});

test('refetch com erro, fallback ou catálogo estático não anuncia consulta em tempo real bem-sucedida', () => {
  for (const data of [undefined, { models: { general: ['cached'], image: [] } }]) {
    expect(liveModelsFeedback(true, data, 'OpenAI').severity).toBe(
      AiProviderFeedbackSeverity.ERROR
    );
  }
  expect(
    liveModelsFeedback(
      false,
      {
        models: { general: ['gpt-6-luna'], image: ['gpt-image-2'] },
        source: AiModelCatalogSource.FALLBACK,
        isLive: false,
        warning: 'Catálogo de contingência em uso.',
      },
      'OpenAI'
    )
  ).toEqual({
    severity: AiProviderFeedbackSeverity.INFO,
    message: 'Catálogo de contingência em uso.',
  });
  expect(
    liveModelsFeedback(
      false,
      {
        models: { general: ['gemini-3.1-pro'], image: ['imagen-3'] },
        source: AiModelCatalogSource.STATIC,
        isLive: false,
      },
      'Gemini'
    ).severity
  ).toBe(AiProviderFeedbackSeverity.INFO);
  expect(liveModelsFeedback(false, { models: { general: [], image: [] } }, 'Gemini').severity).toBe(
    AiProviderFeedbackSeverity.SUCCESS
  );
});
