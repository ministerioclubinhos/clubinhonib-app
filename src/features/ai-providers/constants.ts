import type { AiProviderSettings } from './types';

export const OPENAI_MODELS_ENDPOINT = '/api/v1/lessons/providers/openai/models';
export const OPENAI_SETTINGS_ENDPOINT = '/api/v1/lessons/providers/openai/settings';

export const GEMINI_MODELS_ENDPOINT = '/api/v1/lessons/providers/gemini/models';
export const GEMINI_SETTINGS_ENDPOINT = '/api/v1/lessons/providers/gemini/settings';

export const LOCAL_STORAGE_AI_PROVIDERS_KEY = 'clubinho_ai_provider_settings_v2';

export const DEFAULT_AI_PROVIDER_SETTINGS: AiProviderSettings = {
  llmProvider: 'openai',
  openai: {
    generalModel: 'gpt-6-luna',
    imageModel: 'gpt-image-2',
    imageQuality: 'high',
    reasoningEffort: 'none',
    apiKey: 'REMOVED_OPENAI_API_KEY',
  },
  gemini: {
    generalModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.0-flash',
    imageModel: 'gemini-3.1-flash-image',
    imageSize: '2K',
    maxRetries: 3,
    retryBaseDelayMs: 1000,
    apiKey: 'REMOVED_GEMINI_API_KEY',
  },
};
