import { LlmProviderType, OpenAIImageQuality, OpenAIReasoningEffort } from './types';
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
    imageQuality: OpenAIImageQuality.HIGH,
    reasoningEffort: OpenAIReasoningEffort.NONE,
    hasApiKey: false,
  },
  gemini: {
    generalModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.0-flash',
    imageModel: 'gemini-3.1-flash-image',
    imageSize: '2K',
    maxRetries: 3,
    retryBaseDelayMs: 1000,
    hasApiKey: false,
  },
};

export const FALLBACK_OPEN_AI_GENERAL_MODELS = [
  'gpt-6-luna',
  'gpt-5.6-luna',
  'gpt-5.6',
  'gpt-4o',
  'gpt-4o-mini',
  'o3-mini',
  'o1',
];

export const FALLBACK_OPEN_AI_IMAGE_MODELS = [
  'gpt-image-2',
  'gpt-image-2.5-flare',
  'gpt-image-2.5-sunburst',
  'gpt-image-1-mini',
  'dall-e-3',
];

export const FALLBACK_GEMINI_GENERAL_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export const FALLBACK_GEMINI_IMAGE_MODELS = ['gemini-3.1-flash-image', 'imagen-3.0-generate-002'];
