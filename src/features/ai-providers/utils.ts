import {
  ApiKeyAction,
  AiProviderProfile,
  type AiProviderPresetProfile,
  OpenAIReasoningEffort,
  AiModelCatalogSource,
  AiProviderFeedbackSeverity,
  type AiProviderSettings,
  type SaveAiProviderSettingsRequest,
  type AiProviderForm,
  type OpenAiSettingsResponse,
  type GeminiSettingsResponse,
  type OpenAiModelsResponse,
  type GeminiModelsResponse,
  type AiProviderFeedback,
  type AiModelCatalogBadge,
  type GeminiRetryErrors,
  type GeminiSettings,
} from './types';
import {
  AI_PROVIDER_PROFILE_ORDER,
  AI_PROVIDER_PROFILES,
  AI_PROVIDER_TEXT,
  OPENAI_NON_REASONING_FRAGMENT,
  OPENAI_O_SERIES_MODEL_PATTERN,
  OPENAI_REASONING_MODEL_PATTERN,
  GEMINI_MAX_RETRIES,
  GEMINI_MAX_RETRY_DELAY_MS,
  MODEL_CATALOG_BADGES,
  MODEL_CATALOG_UNCHECKED_BADGE,
} from './constants';

// Pick the public contract explicitly: even a legacy server response cannot put a saved key into query cache.
export function publicOpenAiSettings(value: OpenAiSettingsResponse): OpenAiSettingsResponse {
  return {
    generalModel: value.generalModel,
    imageModel: value.imageModel,
    imageQuality: value.imageQuality,
    reasoningEffort: value.reasoningEffort,
    hasApiKey: Boolean(value.hasApiKey),
    ...(value.apiKeyUnreadable ? { apiKeyUnreadable: true } : {}),
  };
}
export function publicGeminiSettings(value: GeminiSettingsResponse): GeminiSettingsResponse {
  return {
    generalModel: value.generalModel,
    fallbackModel: value.fallbackModel,
    imageModel: value.imageModel,
    imageSize: value.imageSize,
    maxRetries: value.maxRetries,
    retryBaseDelayMs: value.retryBaseDelayMs,
    hasApiKey: Boolean(value.hasApiKey),
    ...(value.apiKeyUnreadable ? { apiKeyUnreadable: true } : {}),
  };
}
export function publicAiProviderSettings(value: AiProviderSettings): AiProviderSettings {
  return {
    llmProvider: value.llmProvider,
    openai: publicOpenAiSettings(value.openai),
    gemini: publicGeminiSettings(value.gemini),
  };
}
export function providerSettingsForm(value: AiProviderSettings): AiProviderForm {
  const openai = publicOpenAiSettings(value.openai);
  const gemini = publicGeminiSettings(value.gemini);
  return {
    llmProvider: value.llmProvider,
    openai: {
      generalModel: openai.generalModel,
      imageModel: openai.imageModel,
      imageQuality: openai.imageQuality,
      reasoningEffort: openai.reasoningEffort,
      apiKey: '',
      keyAction: ApiKeyAction.PRESERVE,
    },
    gemini: {
      generalModel: gemini.generalModel,
      fallbackModel: gemini.fallbackModel,
      imageModel: gemini.imageModel,
      imageSize: gemini.imageSize,
      maxRetries: gemini.maxRetries,
      retryBaseDelayMs: gemini.retryBaseDelayMs,
      apiKey: '',
      keyAction: ApiKeyAction.PRESERVE,
    },
  };
}
function keyPayload(action: ApiKeyAction, key: string): { apiKey?: string } {
  if (action === ApiKeyAction.PRESERVE) return {};
  return { apiKey: action === ApiKeyAction.REMOVE ? '' : key.trim() };
}
export function buildAiProviderSettingsPayload(
  settings: AiProviderForm
): SaveAiProviderSettingsRequest {
  const { openai, gemini } = settings;
  return {
    llmProvider: settings.llmProvider,
    openai: {
      generalModel: openai.generalModel,
      imageModel: openai.imageModel,
      imageQuality: openai.imageQuality,
      reasoningEffort: openai.reasoningEffort,
      ...keyPayload(openai.keyAction, openai.apiKey),
    },
    gemini: {
      generalModel: gemini.generalModel,
      fallbackModel: gemini.fallbackModel,
      imageModel: gemini.imageModel,
      imageSize: gemini.imageSize,
      maxRetries: Number(gemini.maxRetries),
      retryBaseDelayMs: Number(gemini.retryBaseDelayMs),
      ...keyPayload(gemini.keyAction, gemini.apiKey),
    },
  };
}
export function liveModelsFeedback(
  isError: boolean,
  data: OpenAiModelsResponse | GeminiModelsResponse | undefined,
  provider: string
): AiProviderFeedback {
  if (isError || !data)
    return {
      severity: AiProviderFeedbackSeverity.ERROR,
      message: `Não foi possível consultar os modelos de ${provider}. Tente novamente.`,
    };
  if (data.source === AiModelCatalogSource.FALLBACK) {
    return {
      severity: AiProviderFeedbackSeverity.INFO,
      message:
        data.warning ||
        `Catálogo local de contingência de ${provider} exibido (${data.models.general.length} de texto, ${data.models.image.length} de imagem).`,
    };
  }
  if (data.source === AiModelCatalogSource.STATIC) {
    return {
      severity: AiProviderFeedbackSeverity.INFO,
      message:
        data.warning ||
        `Catálogo estático oficial de ${provider} carregado (${data.models.general.length} de texto, ${data.models.image.length} de imagem).`,
    };
  }
  return {
    severity: AiProviderFeedbackSeverity.SUCCESS,
    message: `Modelos de ${provider} disponíveis: ${data.models.general.length} de texto, ${data.models.image.length} de imagem.`,
  };
}

/** Keeps the saved and the selected model selectable even when the catalog no longer lists them. */
export function modelOptions(catalog: readonly string[], ...required: string[]): string[] {
  return Array.from(new Set([...required.filter(Boolean), ...catalog]));
}

export function modelCatalogBadge(
  data: OpenAiModelsResponse | GeminiModelsResponse | undefined
): AiModelCatalogBadge {
  return data?.source ? MODEL_CATALOG_BADGES[data.source] : MODEL_CATALOG_UNCHECKED_BADGE;
}

function integerError(value: unknown, max: number, unit: string): string | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return 'Informe um número inteiro.';
  if (value < 0 || value > max) return `Informe um valor entre 0 e ${max}${unit}.`;
  return null;
}

export function validateGeminiRetrySettings(
  settings: Pick<GeminiSettings, 'maxRetries' | 'retryBaseDelayMs'>
): GeminiRetryErrors {
  return {
    maxRetries: integerError(settings.maxRetries, GEMINI_MAX_RETRIES, ''),
    retryBaseDelayMs: integerError(settings.retryBaseDelayMs, GEMINI_MAX_RETRY_DELAY_MS, ' ms'),
  };
}

/** An empty field stays invalid (NaN) instead of silently becoming zero. */
export function parseIntegerInput(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value);
}

/** The API rejects activating a provider that has no usable key; say so before the save. */
export function activeProviderKeyIssue(
  form: AiProviderForm,
  saved: AiProviderSettings | undefined
): string | null {
  const active = form[form.llmProvider];
  const stored = saved?.[form.llmProvider];
  if (active.keyAction === ApiKeyAction.REPLACE && active.apiKey.trim()) return null;
  if (stored?.apiKeyUnreadable)
    return 'A chave salva deste provedor não pôde ser lida pelo servidor. Digite a chave novamente e salve.';
  if (active.keyAction === ApiKeyAction.REMOVE || !stored?.hasApiKey)
    return 'O provedor ativo precisa de uma chave de API. Digite a chave para poder salvar.';
  return null;
}

/** Unsaved only when the request it would send differs from what is saved. */
export function hasUnsavedAiProviderChanges(
  form: AiProviderForm,
  saved: AiProviderSettings
): boolean {
  return (
    JSON.stringify(buildAiProviderSettingsPayload(form)) !==
    JSON.stringify(buildAiProviderSettingsPayload(providerSettingsForm(saved)))
  );
}

export function supportsOpenAiReasoning(model: string): boolean {
  return (
    OPENAI_REASONING_MODEL_PATTERN.test(model) && !model.includes(OPENAI_NON_REASONING_FRAGMENT)
  );
}

/** Tells the administrator what the API will really send for this model. */
export function openAiReasoningNote(model: string, effort: OpenAIReasoningEffort): string {
  if (!supportsOpenAiReasoning(model)) return AI_PROVIDER_TEXT.reasoningUnsupported;
  if (effort === OpenAIReasoningEffort.NONE && OPENAI_O_SERIES_MODEL_PATTERN.test(model))
    return AI_PROVIDER_TEXT.reasoningNoneOnOSeries;
  return AI_PROVIDER_TEXT.reasoningDefault;
}

/** Fills models and parameters of both providers; keys and the active provider stay. */
export function applyAiProviderProfile(
  form: AiProviderForm,
  profile: AiProviderPresetProfile
): AiProviderForm {
  const preset = AI_PROVIDER_PROFILES[profile];
  return {
    ...form,
    openai: { ...form.openai, ...preset.openai },
    gemini: { ...form.gemini, ...preset.gemini },
  };
}

/** The profile whose values the form currently holds, or `CUSTOM` after any manual change. */
export function matchingAiProviderProfile(
  value: Pick<AiProviderForm, 'openai' | 'gemini'> | Pick<AiProviderSettings, 'openai' | 'gemini'>
): AiProviderProfile {
  const same = <T extends object>(preset: T, current: T): boolean =>
    (Object.keys(preset) as Array<keyof T>).every((key) => preset[key] === current[key]);
  return (
    AI_PROVIDER_PROFILE_ORDER.find(
      (profile) =>
        same(AI_PROVIDER_PROFILES[profile].openai, value.openai) &&
        same(AI_PROVIDER_PROFILES[profile].gemini, value.gemini)
    ) ?? AiProviderProfile.CUSTOM
  );
}

/** Selected models a live catalog did not return for the saved key. */
export function modelsMissingFromLiveCatalog(
  data: OpenAiModelsResponse | GeminiModelsResponse | undefined,
  general: string[],
  image: string[]
): string[] {
  if (data?.source !== AiModelCatalogSource.LIVE) return [];
  return Array.from(
    new Set([
      ...general.filter((model) => model && !data.models.general.includes(model)),
      ...image.filter((model) => model && !data.models.image.includes(model)),
    ])
  );
}
