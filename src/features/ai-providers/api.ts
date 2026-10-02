import apiAxios from '@/config/axiosConfig';
import {
  AI_PROVIDER_SETTINGS_ENDPOINT,
  GEMINI_MODELS_ENDPOINT,
  GEMINI_SETTINGS_ENDPOINT,
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
import { buildAiProviderSettingsPayload } from './utils';

export async function apiGetOpenAiModels(): Promise<OpenAiModelsResponse> {
  return (await apiAxios.get<OpenAiModelsResponse>(OPENAI_MODELS_ENDPOINT)).data;
}

export async function apiGetOpenAiSettings(): Promise<OpenAiSettings> {
  return (await apiAxios.get<OpenAiSettings>(OPENAI_SETTINGS_ENDPOINT)).data;
}

export async function apiSaveOpenAiSettings(payload: OpenAiSettings): Promise<OpenAiSettings> {
  return (
    await apiAxios.put<OpenAiSettings>(OPENAI_SETTINGS_ENDPOINT, payload, { skipGlobalError: true })
  ).data;
}

export async function apiGetGeminiModels(): Promise<GeminiModelsResponse> {
  return (await apiAxios.get<GeminiModelsResponse>(GEMINI_MODELS_ENDPOINT)).data;
}

export async function apiGetGeminiSettings(): Promise<GeminiSettings> {
  return (await apiAxios.get<GeminiSettings>(GEMINI_SETTINGS_ENDPOINT)).data;
}

export async function apiSaveGeminiSettings(payload: GeminiSettings): Promise<GeminiSettings> {
  return (
    await apiAxios.put<GeminiSettings>(GEMINI_SETTINGS_ENDPOINT, payload, { skipGlobalError: true })
  ).data;
}

export async function apiGetAiProviderSettings(): Promise<AiProviderSettings> {
  return (
    await apiAxios.get<AiProviderSettings>(AI_PROVIDER_SETTINGS_ENDPOINT, { skipGlobalError: true })
  ).data;
}

export async function apiSaveAiProviderSettings(
  settings: AiProviderSettings
): Promise<AiProviderSettings> {
  return (
    await apiAxios.put<AiProviderSettings>(
      AI_PROVIDER_SETTINGS_ENDPOINT,
      buildAiProviderSettingsPayload(settings),
      { skipGlobalError: true }
    )
  ).data;
}
