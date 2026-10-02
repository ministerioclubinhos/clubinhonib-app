import { expect, test } from '@playwright/test';
import { buildAiProviderSettingsPayload } from '@/features/ai-providers/utils';
import { DEFAULT_AI_PROVIDER_SETTINGS } from '@/features/ai-providers/constants';
import { LlmProviderType } from '@/features/ai-providers/types';

test('envia o provedor ativo e números reais, sem metadados locais', () => {
  const settings = {
    ...DEFAULT_AI_PROVIDER_SETTINGS,
    llmProvider: LlmProviderType.GEMINI,
    updatedAt: 'local-only',
    updatedBy: 'local-only',
    gemini: {
      ...DEFAULT_AI_PROVIDER_SETTINGS.gemini,
      maxRetries: '0' as unknown as number,
      retryBaseDelayMs: '1000' as unknown as number,
    },
  };
  expect(buildAiProviderSettingsPayload(settings)).toEqual({
    llmProvider: LlmProviderType.GEMINI,
    openai: DEFAULT_AI_PROVIDER_SETTINGS.openai,
    gemini: { ...DEFAULT_AI_PROVIDER_SETTINGS.gemini, maxRetries: 0, retryBaseDelayMs: 1000 },
  });
  expect(DEFAULT_AI_PROVIDER_SETTINGS.openai.apiKey).toBe('');
  expect(DEFAULT_AI_PROVIDER_SETTINGS.gemini.apiKey).toBe('');
});
