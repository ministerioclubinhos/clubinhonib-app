import apiAxios from '@/config/axiosConfig';
import {
  DEFAULT_AI_PROVIDER_SETTINGS,
  GEMINI_MODELS_ENDPOINT,
  GEMINI_SETTINGS_ENDPOINT,
  LOCAL_STORAGE_AI_PROVIDERS_KEY,
  OPENAI_MODELS_ENDPOINT,
  OPENAI_SETTINGS_ENDPOINT,
} from './constants';
import type {
  AiProviderSettings,
  GeminiModelsResponse,
  GeminiSettings,
  OpenAiModelsResponse,
  OpenAiSettings,
} from './types';

export function maskApiKey(key?: string): string {
  if (!key) return '';
  if (key.startsWith('sk-') || key.startsWith('AQ.')) {
    const prefix = key.slice(0, 7);
    const suffix = key.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }
  if (key.length <= 10) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/** Classificação dinâmica de modelos da OpenAI por ID */
export function categorizeOpenAiModels(modelList: Array<{ id: string; created?: number }>): OpenAiModelsResponse['models'] {
  const isImageModel = (id: string) => id.startsWith('gpt-image-') || id.includes('dall-e');
  const isGeneralModel = (id: string) =>
    (id.startsWith('gpt-') || id.startsWith('o1') || id.startsWith('o3')) &&
    !isImageModel(id) &&
    !id.includes('realtime') &&
    !id.includes('transcribe') &&
    !id.includes('tts') &&
    !id.includes('whisper') &&
    !id.includes('embedding');

  const sorted = [...modelList].sort((a, b) => (b.created ?? 0) - (a.created ?? 0));

  const image = sorted.filter((m) => isImageModel(m.id)).map((m) => m.id);
  const general = sorted.filter((m) => isGeneralModel(m.id)).map((m) => m.id);

  const defaultGeneral = ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.6', 'gpt-4o', 'gpt-4o-mini', 'o3-mini', 'o1'];
  const defaultImage = ['gpt-image-2', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst', 'gpt-image-1-mini', 'dall-e-3'];

  return {
    general: Array.from(new Set([...general, ...defaultGeneral])),
    image: Array.from(new Set([...image, ...defaultImage])),
  };
}

/** Classificação dinâmica para Google Gemini */
export function categorizeGeminiModels(modelList: Array<{ id: string }>): GeminiModelsResponse['models'] {
  const isImageModel = (id: string) => id.includes('image') || id.includes('imagen');
  const image = modelList.filter((m) => isImageModel(m.id)).map((m) => m.id);
  const general = modelList.filter((m) => !isImageModel(m.id)).map((m) => m.id);

  const defaultGeneral = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  const defaultImage = ['gemini-3.1-flash-image', 'imagen-3.0-generate-002'];

  return {
    general: Array.from(new Set([...general, ...defaultGeneral])),
    image: Array.from(new Set([...image, ...defaultImage])),
  };
}

/** 1. GET /api/v1/lessons/providers/openai/models - Consulta modelos em tempo real com fallback silencioso */
export async function apiGetOpenAiModels(apiKey?: string): Promise<OpenAiModelsResponse> {
  try {
    const { data } = await apiAxios.get<any>(OPENAI_MODELS_ENDPOINT, {
      params: apiKey ? { apiKey } : undefined,
      skipGlobalError: true,
    });

    if (data?.models?.general && data?.models?.image) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return { models: categorizeOpenAiModels(data.data) };
    }
  } catch {
    // Trata o fallback silenciosamente sem sujar o console
  }

  return { models: categorizeOpenAiModels([]) };
}

/** 2. GET /api/v1/lessons/providers/openai/settings - Busca configurações salvas */
export async function apiGetOpenAiSettings(): Promise<OpenAiSettings> {
  try {
    const { data } = await apiAxios.get<OpenAiSettings>(OPENAI_SETTINGS_ENDPOINT, {
      skipGlobalError: true,
    });
    if (data && typeof data === 'object') {
      return { ...DEFAULT_AI_PROVIDER_SETTINGS.openai, ...data };
    }
  } catch {
    // fallback local
  }
  return DEFAULT_AI_PROVIDER_SETTINGS.openai;
}

/** 3. PUT /api/v1/lessons/providers/openai/settings - Salva configurações */
export async function apiSaveOpenAiSettings(payload: OpenAiSettings): Promise<OpenAiSettings> {
  try {
    const { data } = await apiAxios.put<OpenAiSettings>(OPENAI_SETTINGS_ENDPOINT, payload, {
      skipGlobalError: true,
    });
    return data;
  } catch {
    return payload;
  }
}

/** Gemini Endpoints */
export async function apiGetGeminiModels(): Promise<GeminiModelsResponse> {
  try {
    const { data } = await apiAxios.get<any>(GEMINI_MODELS_ENDPOINT, { skipGlobalError: true });
    if (data?.models?.general) return data;
    if (Array.isArray(data?.data)) return { models: categorizeGeminiModels(data.data) };
  } catch {
    // fallback
  }
  return { models: categorizeGeminiModels([]) };
}

export async function apiGetGeminiSettings(): Promise<GeminiSettings> {
  try {
    const { data } = await apiAxios.get<GeminiSettings>(GEMINI_SETTINGS_ENDPOINT, { skipGlobalError: true });
    if (data && typeof data === 'object') {
      return { ...DEFAULT_AI_PROVIDER_SETTINGS.gemini, ...data };
    }
  } catch {
    // fallback
  }
  return DEFAULT_AI_PROVIDER_SETTINGS.gemini;
}

export async function apiSaveGeminiSettings(payload: GeminiSettings): Promise<GeminiSettings> {
  try {
    const { data } = await apiAxios.put<GeminiSettings>(GEMINI_SETTINGS_ENDPOINT, payload, { skipGlobalError: true });
    return data;
  } catch {
    return payload;
  }
}

/** Agregador de Configurações para a UI */
export async function apiGetAiProviderSettings(): Promise<AiProviderSettings> {
  const saved = localStorage.getItem(LOCAL_STORAGE_AI_PROVIDERS_KEY);
  let localSettings = DEFAULT_AI_PROVIDER_SETTINGS;
  if (saved) {
    try {
      localSettings = { ...DEFAULT_AI_PROVIDER_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
  }

  const [openai, gemini] = await Promise.all([
    apiGetOpenAiSettings(),
    apiGetGeminiSettings(),
  ]);

  return {
    ...localSettings,
    openai: { ...localSettings.openai, ...openai },
    gemini: { ...localSettings.gemini, ...gemini },
  };
}

export async function apiSaveAiProviderSettings(settings: AiProviderSettings): Promise<AiProviderSettings> {
  const updated = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(LOCAL_STORAGE_AI_PROVIDERS_KEY, JSON.stringify(updated));

  await Promise.all([
    apiSaveOpenAiSettings(updated.openai),
    apiSaveGeminiSettings(updated.gemini),
  ]);

  return updated;
}
