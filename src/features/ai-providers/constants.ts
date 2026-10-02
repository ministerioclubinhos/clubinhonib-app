import { LlmProviderType } from './types';
import type { AiProviderSettings } from './types';

export const OPENAI_MODELS_ENDPOINT = '/api/v1/lessons/providers/openai/models';
export const OPENAI_SETTINGS_ENDPOINT = '/api/v1/lessons/providers/openai/settings';

export const GEMINI_MODELS_ENDPOINT = '/api/v1/lessons/providers/gemini/models';
export const GEMINI_SETTINGS_ENDPOINT = '/api/v1/lessons/providers/gemini/settings';

export const AI_PROVIDER_SETTINGS_ENDPOINT = '/api/v1/lessons/providers/settings';

export const DEFAULT_AI_PROVIDER_SETTINGS: AiProviderSettings = {
  llmProvider: LlmProviderType.OPENAI,
  openai: {
    generalModel: 'gpt-6-luna',
    imageModel: 'gpt-image-2',
    imageQuality: 'high',
    reasoningEffort: 'none',
    apiKey: '',
  },
  gemini: {
    generalModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.0-flash',
    imageModel: 'gemini-3.1-flash-image',
    imageSize: '2K',
    maxRetries: 3,
    retryBaseDelayMs: 1000,
    apiKey: '',
  },
};
