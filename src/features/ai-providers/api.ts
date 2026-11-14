import apiAxios from '@/config/axiosConfig';
import {
  AI_PROVIDER_SETTINGS_ENDPOINT,
  GEMINI_MODELS_ENDPOINT,
  OPENAI_MODELS_ENDPOINT,
} from './constants';
import type {
  AiProviderSettings,
  GeminiModelsResponse,
  SaveAiProviderSettingsRequest,
  OpenAiModelsResponse,
} from './types';
import { publicAiProviderSettings } from './utils';

export async function apiGetOpenAiModels(signal?: AbortSignal): Promise<OpenAiModelsResponse> {
  return (await apiAxios.get<OpenAiModelsResponse>(OPENAI_MODELS_ENDPOINT, { signal })).data;
}

export async function apiGetGeminiModels(signal?: AbortSignal): Promise<GeminiModelsResponse> {
  return (await apiAxios.get<GeminiModelsResponse>(GEMINI_MODELS_ENDPOINT, { signal })).data;
}

export async function apiGetAiProviderSettings(signal?: AbortSignal): Promise<AiProviderSettings> {
  return publicAiProviderSettings(
    (
      await apiAxios.get<AiProviderSettings>(AI_PROVIDER_SETTINGS_ENDPOINT, {
        skipGlobalError: true,
        signal,
      })
    ).data
  );
}

export async function apiSaveAiProviderSettings(
  settings: SaveAiProviderSettingsRequest
): Promise<AiProviderSettings> {
  return publicAiProviderSettings(
    (
      await apiAxios.put<AiProviderSettings>(AI_PROVIDER_SETTINGS_ENDPOINT, settings, {
        skipGlobalError: true,
      })
    ).data
  );
}
