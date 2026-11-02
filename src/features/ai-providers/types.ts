export enum LlmProviderType {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}
export enum OpenAIReasoningEffort {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
export enum OpenAIImageQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
export enum ApiKeyAction {
  PRESERVE = 'preserve',
  REPLACE = 'replace',
  REMOVE = 'remove',
}
export enum AiProviderFeedbackSeverity {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}
export enum AiModelCatalogSource {
  LIVE = 'LIVE',
  FALLBACK = 'FALLBACK',
  STATIC = 'STATIC',
}
export interface OpenAiModelsResponse {
  models: { general: string[]; image: string[] };
  source?: AiModelCatalogSource;
  isLive?: boolean;
  warning?: string | null;
}
export interface GeminiModelsResponse {
  models: { general: string[]; image: string[] };
  source?: AiModelCatalogSource;
  isLive?: boolean;
  warning?: string | null;
}
export interface OpenAiSettings {
  generalModel: string;
  imageModel: string;
  imageQuality: OpenAIImageQuality;
  reasoningEffort: OpenAIReasoningEffort;
}
export interface GeminiSettings {
  generalModel: string;
  fallbackModel: string;
  imageModel: string;
  imageSize: string;
  maxRetries: number;
  retryBaseDelayMs: number;
}
export interface OpenAiSettingsResponse extends OpenAiSettings {
  hasApiKey: boolean;
}
export interface GeminiSettingsResponse extends GeminiSettings {
  hasApiKey: boolean;
}
export interface AiProviderSettings {
  llmProvider: LlmProviderType;
  openai: OpenAiSettingsResponse;
  gemini: GeminiSettingsResponse;
}
export interface ApiKeyDraft {
  apiKey: string;
  keyAction: ApiKeyAction;
}
export interface OpenAiSettingsForm extends OpenAiSettings, ApiKeyDraft {}
export interface GeminiSettingsForm extends GeminiSettings, ApiKeyDraft {}
export interface AiProviderForm {
  llmProvider: LlmProviderType;
  openai: OpenAiSettingsForm;
  gemini: GeminiSettingsForm;
}
export interface SaveOpenAiSettingsRequest extends OpenAiSettings {
  apiKey?: string;
}
export interface SaveGeminiSettingsRequest extends GeminiSettings {
  apiKey?: string;
}
export interface SaveAiProviderSettingsRequest {
  llmProvider: LlmProviderType;
  openai: SaveOpenAiSettingsRequest;
  gemini: SaveGeminiSettingsRequest;
}
export interface AiProviderFeedback {
  severity: AiProviderFeedbackSeverity;
  message: string;
}
