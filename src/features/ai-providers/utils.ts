import {
  ApiKeyAction,
  AiProviderFeedbackSeverity,
  type AiProviderSettings,
  type SaveAiProviderSettingsRequest,
  type AiProviderForm,
  type OpenAiSettingsResponse,
  type GeminiSettingsResponse,
  type OpenAiModelsResponse,
  type AiProviderFeedback,
} from './types';

// Pick the public contract explicitly: even a legacy server response cannot put a saved key into query cache.
export function publicOpenAiSettings(value: OpenAiSettingsResponse): OpenAiSettingsResponse {
  return {
    generalModel: value.generalModel,
    imageModel: value.imageModel,
    imageQuality: value.imageQuality,
    reasoningEffort: value.reasoningEffort,
    hasApiKey: Boolean(value.hasApiKey),
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
  data: OpenAiModelsResponse | undefined,
  provider: string
): AiProviderFeedback {
  if (isError || !data)
    return {
      severity: AiProviderFeedbackSeverity.ERROR,
      message: `Não foi possível consultar os modelos de ${provider}. Tente novamente.`,
    };
  return {
    severity: AiProviderFeedbackSeverity.SUCCESS,
    message: `Modelos de ${provider} disponíveis: ${data.models.general.length} de texto, ${data.models.image.length} de imagem.`,
  };
}
