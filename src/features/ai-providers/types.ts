export enum LlmProviderType {
  OPENAI = 'openai',
  GEMINI = 'gemini',
}
/** Mirrors `OpenAiReasoningEffort` in the API settings DTO. */
export enum OpenAIReasoningEffort {
  NONE = 'none',
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  XHIGH = 'xhigh',
}
/** Mirrors `OpenAiImageQuality` in the API settings DTO. */
export enum OpenAIImageQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  AUTO = 'auto',
}
/** Mirrors `GeminiImageSize` in the API settings DTO. */
export enum GeminiImageSize {
  ONE_K = '1K',
  TWO_K = '2K',
  FOUR_K = '4K',
}
export interface AiProviderOption<T extends string> {
  value: T;
  label: string;
}
export interface GeminiRetryErrors {
  maxRetries: string | null;
  retryBaseDelayMs: string | null;
}
export interface AiModelCatalogBadge {
  label: string;
  color: 'success' | 'warning' | 'info' | 'default';
  description: string;
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
  /** Set by the API when a stored key can no longer be decrypted and must be typed again. */
  apiKeyUnreadable?: boolean;
}
export interface GeminiSettingsResponse extends GeminiSettings {
  hasApiKey: boolean;
  /** Set by the API when a stored key can no longer be decrypted and must be typed again. */
  apiKeyUnreadable?: boolean;
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
/** Ready-made cost profiles; `CUSTOM` is any manual combination. */
export enum AiProviderProfile {
  TEST = 'test',
  PRODUCTION = 'production',
  CUSTOM = 'custom',
}
export interface AiProviderProfilePreset {
  label: string;
  description: string;
  openai: OpenAiSettings;
  gemini: GeminiSettings;
}
export type AiProviderPresetProfile = Exclude<AiProviderProfile, AiProviderProfile.CUSTOM>;
