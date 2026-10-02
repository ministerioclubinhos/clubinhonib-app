import type { AiProviderSettings, SaveAiProviderSettingsRequest } from './types';

export function buildAiProviderSettingsPayload(
  settings: AiProviderSettings
): SaveAiProviderSettingsRequest {
  return {
    llmProvider: settings.llmProvider,
    openai: { ...settings.openai },
    gemini: {
      ...settings.gemini,
      maxRetries: Number(settings.gemini.maxRetries),
      retryBaseDelayMs: Number(settings.gemini.retryBaseDelayMs),
    },
  };
}
