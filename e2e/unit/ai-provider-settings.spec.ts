import { expect, test } from '@playwright/test';
import {
  buildAiProviderSettingsPayload,
  providerSettingsForm,
  publicAiProviderSettings,
  liveModelsFeedback,
  activeProviderKeyIssue,
  modelCatalogBadge,
  modelOptions,
  applyAiProviderProfile,
  matchingAiProviderProfile,
  modelsMissingFromLiveCatalog,
  hasUnsavedAiProviderChanges,
  openAiReasoningNote,
  supportsOpenAiReasoning,
  parseIntegerInput,
  validateGeminiRetrySettings,
} from '@/features/ai-providers/utils';
import {
  AI_PROVIDER_PROFILES,
  AI_PROVIDER_TEXT,
  DEFAULT_AI_PROVIDER_SETTINGS,
  GEMINI_MAX_RETRIES,
  MODEL_CATALOG_UNCHECKED_BADGE,
} from '@/features/ai-providers/constants';
import {
  ApiKeyAction,
  AiModelCatalogSource,
  AiProviderProfile,
  GeminiImageSize,
  OpenAIImageQuality,
  LlmProviderType,
  OpenAIReasoningEffort,
  AiProviderFeedbackSeverity,
} from '@/features/ai-providers/types';

test('preservar omite chave; substituir envia nova chave; remover envia vazio sem metadados', () => {
  const form = providerSettingsForm(DEFAULT_AI_PROVIDER_SETTINGS);
  form.llmProvider = LlmProviderType.GEMINI;
  form.gemini.maxRetries = 0;
  expect(buildAiProviderSettingsPayload(form).gemini.maxRetries).toBe(0);
  expect(buildAiProviderSettingsPayload(form).openai).not.toHaveProperty('apiKey');
  expect(buildAiProviderSettingsPayload(form).openai).not.toHaveProperty('hasApiKey');
  form.openai.keyAction = ApiKeyAction.REPLACE;
  form.openai.apiKey = ' synthetic-new-key ';
  expect(buildAiProviderSettingsPayload(form).openai.apiKey).toBe('synthetic-new-key');
  form.openai.keyAction = ApiKeyAction.REMOVE;
  expect(buildAiProviderSettingsPayload(form).openai.apiKey).toBe('');
});

test('segredo de resposta legada não entra no cache nem no formulário', () => {
  const legacy = {
    ...DEFAULT_AI_PROVIDER_SETTINGS,
    openai: {
      ...DEFAULT_AI_PROVIDER_SETTINGS.openai,
      hasApiKey: true,
      apiKey: 'synthetic-persisted-secret',
    },
    gemini: { ...DEFAULT_AI_PROVIDER_SETTINGS.gemini, apiKey: 'synthetic-other-secret' },
  };
  expect(JSON.stringify(publicAiProviderSettings(legacy))).not.toContain('secret');
  expect(providerSettingsForm(legacy).openai.apiKey).toBe('');
  expect(providerSettingsForm(legacy).gemini.keyAction).toBe(ApiKeyAction.PRESERVE);
});

test('refetch com erro, fallback ou catálogo estático não anuncia consulta em tempo real bem-sucedida', () => {
  for (const data of [undefined, { models: { general: ['cached'], image: [] } }]) {
    expect(liveModelsFeedback(true, data, 'OpenAI').severity).toBe(
      AiProviderFeedbackSeverity.ERROR
    );
  }
  expect(
    liveModelsFeedback(
      false,
      {
        models: { general: ['gpt-6-luna'], image: ['gpt-image-2'] },
        source: AiModelCatalogSource.FALLBACK,
        isLive: false,
        warning: 'Catálogo de contingência em uso.',
      },
      'OpenAI'
    )
  ).toEqual({
    severity: AiProviderFeedbackSeverity.INFO,
    message: 'Catálogo de contingência em uso.',
  });
  expect(
    liveModelsFeedback(
      false,
      {
        models: { general: ['gemini-3.1-pro'], image: ['imagen-3'] },
        source: AiModelCatalogSource.STATIC,
        isLive: false,
      },
      'Gemini'
    ).severity
  ).toBe(AiProviderFeedbackSeverity.INFO);
  expect(liveModelsFeedback(false, { models: { general: [], image: [] } }, 'Gemini').severity).toBe(
    AiProviderFeedbackSeverity.SUCCESS
  );
});

test('campos de retry do Gemini validam inteiro e faixa aceitos pela API', () => {
  expect(validateGeminiRetrySettings({ maxRetries: 0, retryBaseDelayMs: 0 })).toEqual({
    maxRetries: null,
    retryBaseDelayMs: null,
  });
  expect(
    validateGeminiRetrySettings({ maxRetries: GEMINI_MAX_RETRIES, retryBaseDelayMs: 10_000 })
  ).toEqual({ maxRetries: null, retryBaseDelayMs: null });
  const invalid = validateGeminiRetrySettings({
    maxRetries: GEMINI_MAX_RETRIES + 1,
    retryBaseDelayMs: 1.5,
  });
  expect(invalid.maxRetries).toContain(`0 e ${GEMINI_MAX_RETRIES}`);
  expect(invalid.retryBaseDelayMs).toContain('inteiro');
  // An emptied field is invalid instead of silently becoming zero.
  expect(parseIntegerInput('')).toBeNaN();
  expect(
    validateGeminiRetrySettings({ maxRetries: parseIntegerInput(''), retryBaseDelayMs: 0 })
      .maxRetries
  ).not.toBeNull();
});

test('modelo salvo continua selecionável e a origem do catálogo é declarada', () => {
  expect(modelOptions(['a', 'b'], 'salvo', '', 'a')).toEqual(['salvo', 'a', 'b']);
  expect(modelCatalogBadge(undefined)).toBe(MODEL_CATALOG_UNCHECKED_BADGE);
  expect(
    modelCatalogBadge({ models: { general: [], image: [] }, source: AiModelCatalogSource.FALLBACK })
      .label
  ).toBe('Lista de contingência');
  expect(
    modelCatalogBadge({ models: { general: [], image: [] }, source: AiModelCatalogSource.LIVE })
      .label
  ).toBe('Consulta ao vivo');
});

test('provedor ativo sem chave utilizável é avisado antes de salvar', () => {
  const form = providerSettingsForm(DEFAULT_AI_PROVIDER_SETTINGS);
  expect(activeProviderKeyIssue(form, DEFAULT_AI_PROVIDER_SETTINGS)).toContain(
    'precisa de uma chave'
  );
  const withKey = {
    ...DEFAULT_AI_PROVIDER_SETTINGS,
    openai: { ...DEFAULT_AI_PROVIDER_SETTINGS.openai, hasApiKey: true },
  };
  expect(activeProviderKeyIssue(form, withKey)).toBeNull();
  form.openai.keyAction = ApiKeyAction.REMOVE;
  expect(activeProviderKeyIssue(form, withKey)).not.toBeNull();
  form.openai.keyAction = ApiKeyAction.REPLACE;
  form.openai.apiKey = 'synthetic-key';
  expect(activeProviderKeyIssue(form, DEFAULT_AI_PROVIDER_SETTINGS)).toBeNull();
  const unreadable = publicAiProviderSettings({
    ...withKey,
    openai: { ...withKey.openai, hasApiKey: false, apiKeyUnreadable: true },
  });
  expect(activeProviderKeyIssue(providerSettingsForm(unreadable), unreadable)).toContain(
    'não pôde ser lida'
  );
});

test('voltar um campo ao valor salvo não deixa alteração pendente; chave digitada deixa', () => {
  const saved = DEFAULT_AI_PROVIDER_SETTINGS;
  const form = providerSettingsForm(saved);
  expect(hasUnsavedAiProviderChanges(form, saved)).toBe(false);
  form.openai.generalModel = 'gpt-4o';
  expect(hasUnsavedAiProviderChanges(form, saved)).toBe(true);
  form.openai.generalModel = saved.openai.generalModel;
  expect(hasUnsavedAiProviderChanges(form, saved)).toBe(false);
  form.gemini.keyAction = ApiKeyAction.REPLACE;
  form.gemini.apiKey = 'synthetic-key';
  expect(hasUnsavedAiProviderChanges(form, saved)).toBe(true);
  form.gemini.keyAction = ApiKeyAction.REMOVE;
  expect(hasUnsavedAiProviderChanges(form, saved)).toBe(true);
});

test('nível de raciocínio informa quando o modelo o ignora, como a API decide', () => {
  for (const model of ['gpt-5', 'gpt-5.6-luna', 'gpt-6-luna', 'o3-mini', 'o1'])
    expect(supportsOpenAiReasoning(model)).toBe(true);
  for (const model of ['gpt-4o', 'gpt-4o-mini', 'gpt-5-chat-latest', 'gpt-50'])
    expect(supportsOpenAiReasoning(model)).toBe(false);
  expect(openAiReasoningNote('gpt-4o', OpenAIReasoningEffort.HIGH)).toBe(
    AI_PROVIDER_TEXT.reasoningUnsupported
  );
  expect(openAiReasoningNote('o3-mini', OpenAIReasoningEffort.NONE)).toBe(
    AI_PROVIDER_TEXT.reasoningNoneOnOSeries
  );
  expect(openAiReasoningNote('o3-mini', OpenAIReasoningEffort.LOW)).toBe(
    AI_PROVIDER_TEXT.reasoningDefault
  );
  expect(openAiReasoningNote('gpt-6-luna', OpenAIReasoningEffort.NONE)).toBe(
    AI_PROVIDER_TEXT.reasoningDefault
  );
});

test('perfis de custo preenchem os dois provedores sem tocar em chave nem provedor ativo', () => {
  const form = providerSettingsForm(DEFAULT_AI_PROVIDER_SETTINGS);
  form.llmProvider = LlmProviderType.GEMINI;
  form.openai.keyAction = ApiKeyAction.REPLACE;
  form.openai.apiKey = 'synthetic-key';
  expect(matchingAiProviderProfile(form)).toBe(AiProviderProfile.PRODUCTION);
  const test = applyAiProviderProfile(form, AiProviderProfile.TEST);
  expect(test.llmProvider).toBe(LlmProviderType.GEMINI);
  expect(test.openai.apiKey).toBe('synthetic-key');
  expect(test.openai.keyAction).toBe(ApiKeyAction.REPLACE);
  expect(test.openai.imageQuality).toBe(OpenAIImageQuality.LOW);
  expect(test.gemini.imageSize).toBe(GeminiImageSize.ONE_K);
  expect(test.gemini.maxRetries).toBe(0);
  expect(matchingAiProviderProfile(test)).toBe(AiProviderProfile.TEST);
  expect(hasUnsavedAiProviderChanges(test, DEFAULT_AI_PROVIDER_SETTINGS)).toBe(true);
  // Any manual change turns the profile into a custom one.
  test.gemini.maxRetries = 1;
  expect(matchingAiProviderProfile(test)).toBe(AiProviderProfile.CUSTOM);
  const production = applyAiProviderProfile(test, AiProviderProfile.PRODUCTION);
  expect(matchingAiProviderProfile(production)).toBe(AiProviderProfile.PRODUCTION);
  expect(production.openai).toMatchObject(
    AI_PROVIDER_PROFILES[AiProviderProfile.PRODUCTION].openai
  );
});

test('só o catálogo ao vivo acusa modelo ausente para a chave', () => {
  const models = { general: ['a'], image: ['img'] };
  expect(
    modelsMissingFromLiveCatalog({ models, source: AiModelCatalogSource.LIVE }, ['a', 'b'], ['x'])
  ).toEqual(['b', 'x']);
  expect(
    modelsMissingFromLiveCatalog({ models, source: AiModelCatalogSource.FALLBACK }, ['b'], ['x'])
  ).toEqual([]);
  expect(modelsMissingFromLiveCatalog(undefined, ['b'], ['x'])).toEqual([]);
});
