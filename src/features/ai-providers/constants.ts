import {
  AiModelCatalogSource,
  GeminiImageSize,
  LlmProviderType,
  OpenAIImageQuality,
  OpenAIReasoningEffort,
} from './types';
import type { AiModelCatalogBadge, AiProviderOption, AiProviderSettings } from './types';

export const OPENAI_MODELS_ENDPOINT = '/api/v1/lessons/providers/openai/models';

export const GEMINI_MODELS_ENDPOINT = '/api/v1/lessons/providers/gemini/models';

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
    imageSize: GeminiImageSize.TWO_K,
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
];

export const FALLBACK_GEMINI_GENERAL_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export const FALLBACK_GEMINI_IMAGE_MODELS = ['gemini-3.1-flash-image', 'imagen-3.0-generate-002'];

/** Mirror the bounds enforced by the API settings DTO. */
export const GEMINI_MAX_RETRIES = 5;
export const GEMINI_MAX_RETRY_DELAY_MS = 10_000;
export const GEMINI_RETRY_DELAY_STEP_MS = 100;

export const OPENAI_REASONING_EFFORT_OPTIONS: AiProviderOption<OpenAIReasoningEffort>[] = [
  { value: OpenAIReasoningEffort.NONE, label: 'Nenhum (resposta direta)' },
  { value: OpenAIReasoningEffort.MINIMAL, label: 'Mínimo' },
  { value: OpenAIReasoningEffort.LOW, label: 'Leve' },
  { value: OpenAIReasoningEffort.MEDIUM, label: 'Moderado' },
  { value: OpenAIReasoningEffort.HIGH, label: 'Profundo' },
  { value: OpenAIReasoningEffort.XHIGH, label: 'Máximo' },
];
export const OPENAI_IMAGE_QUALITY_OPTIONS: AiProviderOption<OpenAIImageQuality>[] = [
  { value: OpenAIImageQuality.LOW, label: 'Baixa (mais rápida e barata)' },
  { value: OpenAIImageQuality.MEDIUM, label: 'Média (equilibrada)' },
  { value: OpenAIImageQuality.HIGH, label: 'Alta (melhor acabamento)' },
  { value: OpenAIImageQuality.AUTO, label: 'Automática (definida pelo provedor)' },
];
export const GEMINI_IMAGE_SIZE_OPTIONS: AiProviderOption<GeminiImageSize>[] = [
  { value: GeminiImageSize.ONE_K, label: '1K' },
  { value: GeminiImageSize.TWO_K, label: '2K' },
  { value: GeminiImageSize.FOUR_K, label: '4K' },
];

export const MODEL_CATALOG_BADGES: Record<AiModelCatalogSource, AiModelCatalogBadge> = {
  [AiModelCatalogSource.LIVE]: {
    label: 'Consulta ao vivo',
    color: 'success',
    description: 'Lista obtida agora do provedor com a chave salva.',
  },
  [AiModelCatalogSource.FALLBACK]: {
    label: 'Lista de contingência',
    color: 'warning',
    description:
      'O provedor não respondeu à consulta. Esta é uma lista padrão: um modelo exibido aqui pode não estar disponível para a sua chave.',
  },
  [AiModelCatalogSource.STATIC]: {
    label: 'Lista estática',
    color: 'info',
    description:
      'Lista fixa mantida pelo sistema; a disponibilidade para a sua chave não é verificada.',
  },
};
export const MODEL_CATALOG_UNCHECKED_BADGE: AiModelCatalogBadge = {
  label: 'Lista padrão (não consultada)',
  color: 'default',
  description:
    'A consulta ao provedor ainda não foi feita. Esta é uma lista padrão: um modelo exibido aqui pode não estar disponível para a sua chave.',
};
export const MODEL_IN_USE_SUFFIX = ' (em uso)';
export const AI_PROVIDER_SETTINGS_STALE_TIME_MS = 60_000;
export const AI_PROVIDER_MODELS_STALE_TIME_MS = 300_000;
