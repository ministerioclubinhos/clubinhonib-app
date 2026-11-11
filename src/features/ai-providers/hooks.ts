import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGetAiProviderSettings,
  apiGetGeminiModels,
  apiGetOpenAiModels,
  apiSaveAiProviderSettings,
} from './api';
import {
  AI_PROVIDER_MODELS_STALE_TIME_MS,
  AI_PROVIDER_SETTINGS_STALE_TIME_MS,
} from './constants';
import type { SaveAiProviderSettingsRequest } from './types';

export const useAiProvidersKeys = {
  all: ['ai-providers'] as const,
  settings: () => ['ai-providers', 'settings'] as const,
  openaiModels: () => ['ai-providers', 'openai-models'] as const,
  geminiModels: () => ['ai-providers', 'gemini-models'] as const,
};

export function useAiProviderSettings() {
  return useQuery({
    queryKey: useAiProvidersKeys.settings(),
    queryFn: ({ signal }) => apiGetAiProviderSettings(signal),
    staleTime: AI_PROVIDER_SETTINGS_STALE_TIME_MS,
  });
}

export function useSaveAiProviderSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: (settings: SaveAiProviderSettingsRequest) => apiSaveAiProviderSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(useAiProvidersKeys.settings(), data);
      queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all });
    },
  });
}

export function useOpenAiModels(enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.openaiModels(),
    queryFn: ({ signal }) => apiGetOpenAiModels(signal),
    enabled,
    staleTime: AI_PROVIDER_MODELS_STALE_TIME_MS,
  });
}

export function useGeminiModels(enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.geminiModels(),
    queryFn: ({ signal }) => apiGetGeminiModels(signal),
    enabled,
    staleTime: AI_PROVIDER_MODELS_STALE_TIME_MS,
  });
}
