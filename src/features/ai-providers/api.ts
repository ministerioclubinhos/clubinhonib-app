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
  GeminiSettingsResponse,
  SaveGeminiSettingsRequest,
  SaveAiProviderSettingsRequest,
  OpenAiModelsResponse,
  OpenAiSettingsResponse,
  SaveOpenAiSettingsRequest,
} from './types';
import { publicAiProviderSettings, publicOpenAiSettings, publicGeminiSettings } from './utils';

export async function apiGetOpenAiModels(): Promise<OpenAiModelsResponse> {
  return (await apiAxios.get<OpenAiModelsResponse>(OPENAI_MODELS_ENDPOINT)).data;
}

export async function apiGetOpenAiSettings(): Promise<OpenAiSettingsResponse> {
  return publicOpenAiSettings(
    (await apiAxios.get<OpenAiSettingsResponse>(OPENAI_SETTINGS_ENDPOINT)).data
  );
}

export async function apiSaveOpenAiSettings(
  payload: SaveOpenAiSettingsRequest
): Promise<OpenAiSettingsResponse> {
  return publicOpenAiSettings(
    (
      await apiAxios.put<OpenAiSettingsResponse>(OPENAI_SETTINGS_ENDPOINT, payload, {
        skipGlobalError: true,
      })
    ).data
  );
}

export async function apiGetGeminiModels(): Promise<GeminiModelsResponse> {
  return (await apiAxios.get<GeminiModelsResponse>(GEMINI_MODELS_ENDPOINT)).data;
}

export async function apiGetGeminiSettings(): Promise<GeminiSettingsResponse> {
  return publicGeminiSettings(
    (await apiAxios.get<GeminiSettingsResponse>(GEMINI_SETTINGS_ENDPOINT)).data
  );
}

export async function apiSaveGeminiSettings(
  payload: SaveGeminiSettingsRequest
): Promise<GeminiSettingsResponse> {
  return publicGeminiSettings(
    (
      await apiAxios.put<GeminiSettingsResponse>(GEMINI_SETTINGS_ENDPOINT, payload, {
        skipGlobalError: true,
      })
    ).data
  );
}

export async function apiGetAiProviderSettings(): Promise<AiProviderSettings> {
  return publicAiProviderSettings(
    (
      await apiAxios.get<AiProviderSettings>(AI_PROVIDER_SETTINGS_ENDPOINT, {
        skipGlobalError: true,
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
