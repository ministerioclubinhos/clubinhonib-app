import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGetAiProviderSettings,
  apiGetGeminiModels,
  apiGetOpenAiModels,
  apiSaveAiProviderSettings,
  apiSaveGeminiSettings,
  apiSaveOpenAiSettings,
} from './api';
import type {
  SaveAiProviderSettingsRequest,
  SaveGeminiSettingsRequest,
  SaveOpenAiSettingsRequest,
} from './types';

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
    staleTime: 60000,
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

export function useSaveOpenAiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: (settings: SaveOpenAiSettingsRequest) => apiSaveOpenAiSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all }),
  });
}

export function useSaveGeminiSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    gcTime: 0,
    mutationFn: (settings: SaveGeminiSettingsRequest) => apiSaveGeminiSettings(settings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: useAiProvidersKeys.all }),
  });
}

export function useOpenAiModels(enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.openaiModels(),
    queryFn: ({ signal }) => apiGetOpenAiModels(signal),
    enabled,
    staleTime: 300000,
  });
}

export function useGeminiModels(enabled = true) {
  return useQuery({
    queryKey: useAiProvidersKeys.geminiModels(),
    queryFn: ({ signal }) => apiGetGeminiModels(signal),
    enabled,
    staleTime: 300000,
  });
}
