import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGetAiProviderSettings,
  apiGetGeminiModels,
  apiGetOpenAiModels,
  apiSaveAiProviderSettings,
  apiSaveGeminiSettings,
  apiSaveOpenAiSettings,
} from './api';
import type { AiProviderSettings, GeminiSettings, OpenAiSettings } from './types';

export const useAiProvidersKeys = {
  all: ['ai-providers'] as const,
  settings: () => ['ai-providers', 'settings'] as const,
  openaiModels: (apiKey?: string) => ['ai-providers', 'openai-models', apiKey] as const,
  geminiModels: () => ['ai-providers', 'gemini-models'] as const,
};

export function useAiProviderSettings() {
  return useQuery({
    queryKey: useAiProvidersKeys.settings(),
    queryFn: apiGetAiProviderSettings,
    staleTime: 60000,
  });
}

export function useSaveAiProviderSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: AiProviderSettings) => apiSaveAiProviderSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(useAiProvidersKeys.settings(), data);
      queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all });
    },
  });
}

export function useSaveOpenAiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: OpenAiSettings) => apiSaveOpenAiSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all }),
  });
}

export function useSaveGeminiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: GeminiSettings) => apiSaveGeminiSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all }),
  });
}

export function useOpenAiModels(apiKey?: string, enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.openaiModels(apiKey),
    queryFn: () => apiGetOpenAiModels(apiKey),
    enabled,
    staleTime: 300000,
  });
}

export function useGeminiModels(enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.geminiModels(),
    queryFn: apiGetGeminiModels,
    enabled,
    staleTime: 300000,
  });
}
