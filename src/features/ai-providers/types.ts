export enum LlmProviderType {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}
export type OpenAIReasoningEffort = 'none' | 'low' | 'medium' | 'high';
export type OpenAIImageQuality = 'low' | 'medium' | 'high';

export interface OpenAiModelsResponse {
  models: {
    general: string[];
    image: string[];
  };
}

export interface GeminiModelsResponse {
  models: {
    general: string[];
    image: string[];
  };
}

export interface OpenAiSettings {
  generalModel: string;
  imageModel: string;
  imageQuality: OpenAIImageQuality;
  reasoningEffort: OpenAIReasoningEffort;
  apiKey?: string;
}

export interface GeminiSettings {
  generalModel: string;
  fallbackModel: string;
  imageModel: string;
  imageSize: string;
  maxRetries: number;
  retryBaseDelayMs: number;
  apiKey?: string;
}

export interface AiProviderSettings {
  llmProvider: LlmProviderType;
  openai: OpenAiSettings;
  gemini: GeminiSettings;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SaveAiProviderSettingsRequest {
  llmProvider: LlmProviderType;
  openai: OpenAiSettings;
  gemini: GeminiSettings;
}

export interface AiProviderFeedback {
  severity: 'success' | 'error' | 'info';
  message: string;
}
