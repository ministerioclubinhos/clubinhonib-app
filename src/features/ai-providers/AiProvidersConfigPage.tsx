import React, { useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid2,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  KeyOutlined,
  Psychology,
  Refresh,
  Restore,
  Save,
  Security,
  SettingsInputComposite,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useAiProviderSettings,
  useGeminiModels,
  useOpenAiModels,
  useSaveAiProviderSettings,
} from './hooks';
import {
  DEFAULT_AI_PROVIDER_SETTINGS,
  FALLBACK_GEMINI_GENERAL_MODELS,
  FALLBACK_GEMINI_IMAGE_MODELS,
  FALLBACK_OPEN_AI_GENERAL_MODELS,
  FALLBACK_OPEN_AI_IMAGE_MODELS,
  GEMINI_IMAGE_SIZE_OPTIONS,
  GEMINI_MAX_RETRIES,
  GEMINI_MAX_RETRY_DELAY_MS,
  GEMINI_RETRY_DELAY_STEP_MS,
  MODEL_IN_USE_SUFFIX,
  OPENAI_IMAGE_QUALITY_OPTIONS,
  OPENAI_REASONING_EFFORT_OPTIONS,
} from './constants';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { STUDIO_ROUTES } from '@/features/ai-lessons/presentation.constants';
import {
  LlmProviderType,
  ApiKeyAction,
  AiProviderFeedbackSeverity,
  OpenAIImageQuality,
  OpenAIReasoningEffort,
} from './types';
import {
  activeProviderKeyIssue,
  buildAiProviderSettingsPayload,
  liveModelsFeedback,
  modelCatalogBadge,
  modelOptions,
  parseIntegerInput,
  providerSettingsForm,
  validateGeminiRetrySettings,
} from './utils';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { getErrorMessage } from '@/utils/apiError';
import type {
  AiProviderForm,
  GeminiSettingsForm,
  AiProviderFeedback,
  OpenAiSettingsForm,
} from './types';

export const AiProvidersConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: settings, isLoading, isError, refetch } = useAiProviderSettings();
  const saveMutation = useSaveAiProviderSettings();

  const [draft, setDraft] = useState<AiProviderForm | null>(null);
  const form = draft ?? providerSettingsForm(settings ?? DEFAULT_AI_PROVIDER_SETTINGS);
  const isDirty = draft !== null;
  const leave = useStudioUnsavedChanges(isDirty);
  const setForm = (change: (previous: AiProviderForm) => AiProviderForm) =>
    setDraft((current) =>
      change(current ?? providerSettingsForm(settings ?? DEFAULT_AI_PROVIDER_SETTINGS))
    );
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const {
    data: openaiModelsData,
    isFetching: loadingOpenAiModels,
    refetch: refetchOpenAiModels,
  } = useOpenAiModels(form.llmProvider === LlmProviderType.OPENAI);

  const {
    data: geminiModelsData,
    isFetching: loadingGeminiModels,
    refetch: refetchGeminiModels,
  } = useGeminiModels(form.llmProvider === LlmProviderType.GEMINI);

  const [feedback, setFeedback] = useState<AiProviderFeedback | null>(null);

  const handleProviderChange = (provider: LlmProviderType) => {
    setForm((prev) => ({ ...prev, llmProvider: provider }));
    setFeedback(null);
  };

  const handleOpenAiChange = <K extends keyof OpenAiSettingsForm>(
    key: K,
    value: OpenAiSettingsForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      openai: {
        ...prev.openai,
        [key]: value,
        ...(key === 'apiKey'
          ? { keyAction: value ? ApiKeyAction.REPLACE : ApiKeyAction.PRESERVE }
          : {}),
      },
    }));
    setFeedback(null);
  };

  const handleGeminiChange = <K extends keyof GeminiSettingsForm>(
    key: K,
    value: GeminiSettingsForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      gemini: {
        ...prev.gemini,
        [key]: value,
        ...(key === 'apiKey'
          ? { keyAction: value ? ApiKeyAction.REPLACE : ApiKeyAction.PRESERVE }
          : {}),
      },
    }));
    setFeedback(null);
  };

  const handleFetchLiveModels = async () => {
    setFeedback(null);
    const provider = form.llmProvider;
    const result = await (provider === LlmProviderType.OPENAI
      ? refetchOpenAiModels()
      : refetchGeminiModels());
    setFeedback(liveModelsFeedback(result.isError, result.data, provider));
  };

  const handleSave = async () => {
    setFeedback(null);
    try {
      await saveMutation.mutateAsync(buildAiProviderSettingsPayload(form));
      setDraft(null);
      setFeedback({
        severity: AiProviderFeedbackSeverity.SUCCESS,
        message: 'Configurações salvas com sucesso.',
      });
    } catch (err) {
      setFeedback({ severity: AiProviderFeedbackSeverity.ERROR, message: getErrorMessage(err) });
    } finally {
      // Release mutation variables containing a newly entered credential.
      saveMutation.reset();
    }
  };

  const handleResetToDefault = () => {
    setDraft(providerSettingsForm(DEFAULT_AI_PROVIDER_SETTINGS));
    setFeedback({
      severity: AiProviderFeedbackSeverity.INFO,
      message:
        'Padrões preparados. As chaves salvas serão preservadas. Clique em salvar para confirmar.',
    });
  };

  // The saved and the selected model stay in the list even if the catalog dropped them.
  const openAiGeneralModels = modelOptions(
    openaiModelsData?.models.general ?? FALLBACK_OPEN_AI_GENERAL_MODELS,
    settings?.openai.generalModel ?? '',
    form.openai.generalModel
  );
  const openAiImageModels = modelOptions(
    openaiModelsData?.models.image ?? FALLBACK_OPEN_AI_IMAGE_MODELS,
    settings?.openai.imageModel ?? '',
    form.openai.imageModel
  );
  const geminiGeneralModels = modelOptions(
    geminiModelsData?.models.general ?? FALLBACK_GEMINI_GENERAL_MODELS,
    settings?.gemini.generalModel ?? '',
    settings?.gemini.fallbackModel ?? '',
    form.gemini.generalModel,
    form.gemini.fallbackModel
  );
  const geminiImageModels = modelOptions(
    geminiModelsData?.models.image ?? FALLBACK_GEMINI_IMAGE_MODELS,
    settings?.gemini.imageModel ?? '',
    form.gemini.imageModel
  );
  const openAiCatalog = modelCatalogBadge(openaiModelsData);
  const geminiCatalog = modelCatalogBadge(geminiModelsData);
  const retryErrors = validateGeminiRetrySettings(form.gemini);
  const hasRetryErrors = Boolean(retryErrors.maxRetries || retryErrors.retryBaseDelayMs);
  const keyIssue = activeProviderKeyIssue(form, settings);
  const inUse = (model: string, saved: string | undefined) =>
    model === saved ? MODEL_IN_USE_SUFFIX : '';

  if (isLoading) {
    return (
      <Box
        data-testid="ai-providers-config-loading"
        sx={{ display: 'grid', placeItems: 'center', py: 12 }}
      >
        <CircularProgress size={44} thickness={4} />
        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          Carregando configurações de IA...
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert
        data-testid="ai-providers-config-error"
        severity="error"
        action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
      >
        Não foi possível carregar as configurações de IA.
      </Alert>
    );
  }

  return (
    <Box
      data-testid="ai-providers-config-page"
      component="fieldset"
      disabled={saveMutation.isPending}
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        pb: { xs: 12, sm: 6 },
        boxSizing: 'border-box',
        border: 0,
        minInlineSize: 0,
        overflowX: 'hidden',
      }}
    >
      {/* Botão de Voltar */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => leave.requestLeave(() => navigate(STUDIO_ROUTES.hub))}
        sx={{
          mb: 2,
          fontWeight: 700,
          borderRadius: 2.5,
          textTransform: 'none',
          minHeight: 44,
          alignSelf: 'flex-start',
        }}
      >
        Voltar para o Estúdio
      </Button>

      {/* Cabeçalho Hero - Mobile-First */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          mb: 2.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <SettingsInputComposite sx={{ fontSize: { xs: 22, sm: 26 } }} />
              </Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.6rem', md: '2rem' },
                  letterSpacing: '-0.3px',
                  overflowWrap: 'anywhere',
                }}
              >
                Provedores & Modelos IA
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.5 }}
            >
              Configure o provedor, os modelos e as chaves usados na produção das lições.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isDirty && (
              <Chip
                color="warning"
                size="small"
                label="Alterações pendentes"
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, minHeight: 38 }}
            >
              Recarregar
            </Button>
          </Stack>
        </Stack>

        <Alert
          severity="info"
          icon={<Security />}
          sx={{
            mt: 2,
            borderRadius: 2.5,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            '& .MuiAlert-message': { width: '100%', overflowWrap: 'anywhere' },
          }}
        >
          As configurações salvas nesta página são usadas nas próximas gerações, sem precisar
          reiniciar o servidor.
        </Alert>
      </Paper>

      {feedback && (
        <Alert
          data-testid="ai-providers-config-feedback"
          severity={feedback.severity}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2.5, borderRadius: 2.5, '& .MuiAlert-message': { overflowWrap: 'anywhere' } }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Card de Seleção do Provedor Ativo (Mobile-First Vertical Stack) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor:
            form.llmProvider === LlmProviderType.OPENAI ? 'primary.main' : 'secondary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
          gutterBottom
        >
          Provedor ativo
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontSize: { xs: '0.825rem', sm: '0.875rem' } }}
        >
          Escolha o provedor usado nas próximas gerações de texto e imagem. Clique em Salvar
          Alterações para aplicar.
        </Typography>

        <RadioGroup
          value={form.llmProvider}
          onChange={(e) => handleProviderChange(e.target.value as LlmProviderType)}
        >
          <Grid2 container spacing={1.5} sx={{ width: '100%' }}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                data-testid="ai-provider-radio-openai"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor:
                    form.llmProvider === LlmProviderType.OPENAI ? 'primary.main' : 'divider',
                  bgcolor:
                    form.llmProvider === LlmProviderType.OPENAI
                      ? alpha(theme.palette.primary.main, 0.05)
                      : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: 48,
                }}
                onClick={() => handleProviderChange(LlmProviderType.OPENAI)}
              >
                <FormControlLabel
                  value="openai"
                  control={<Radio />}
                  label={
                    <Box sx={{ ml: 0.5, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AutoAwesome color="primary" fontSize="small" />
                        <Typography
                          fontWeight={800}
                          variant="subtitle1"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                        >
                          OpenAI (GPT-4o / GPT-6 Luna)
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.25, lineHeight: 1.3 }}
                      >
                        Precisão teológica com suporte a raciocínio avançado e artes `gpt-image-2`.
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                />
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                data-testid="ai-provider-radio-gemini"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor:
                    form.llmProvider === LlmProviderType.GEMINI ? 'secondary.main' : 'divider',
                  bgcolor:
                    form.llmProvider === LlmProviderType.GEMINI
                      ? alpha(theme.palette.secondary.main, 0.05)
                      : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: 48,
                }}
                onClick={() => handleProviderChange(LlmProviderType.GEMINI)}
              >
                <FormControlLabel
                  value="gemini"
                  control={<Radio color="secondary" />}
                  label={
                    <Box sx={{ ml: 0.5, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Psychology color="secondary" fontSize="small" />
                        <Typography
                          fontWeight={800}
                          variant="subtitle1"
                          sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
                        >
                          Google Gemini (Gemini 2.5 / 3.1)
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.25, lineHeight: 1.3 }}
                      >
                        Modelos rápidos com fallback automático e alta velocidade multimodal.
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                />
              </Paper>
            </Grid2>
          </Grid2>
        </RadioGroup>
      </Paper>

      {/* Botão de Consulta de Catálogo de Modelos (Full Width on Mobile) */}
      {keyIssue && (
        <Alert data-testid="ai-providers-key-issue" severity="warning" sx={{ mb: 2.5 }}>
          {keyIssue}
        </Alert>
      )}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="flex-end"
        sx={{ mb: 2.5 }}
      >
        <Chip
          data-testid="ai-providers-catalog-source"
          data-catalog-source={
            (form.llmProvider === LlmProviderType.OPENAI ? openaiModelsData : geminiModelsData)
              ?.source ?? 'UNCHECKED'
          }
          label={`Catálogo de modelos: ${
            (form.llmProvider === LlmProviderType.OPENAI ? openAiCatalog : geminiCatalog).label
          }`}
          color={(form.llmProvider === LlmProviderType.OPENAI ? openAiCatalog : geminiCatalog).color}
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
        <Button
          data-testid="ai-providers-fetch-models-button"
          fullWidth
          variant="contained"
          color="info"
          startIcon={
            loadingOpenAiModels || loadingGeminiModels ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Refresh />
            )
          }
          disabled={loadingOpenAiModels || loadingGeminiModels}
          onClick={handleFetchLiveModels}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            borderRadius: 2.5,
            px: 3,
            py: 1.2,
            fontWeight: 700,
            textTransform: 'none',
            minHeight: 48,
          }}
        >
          {loadingOpenAiModels || loadingGeminiModels
            ? 'Consultando modelos...'
            : form.llmProvider === LlmProviderType.OPENAI
              ? 'Atualizar modelos disponíveis (OpenAI)'
              : 'Consultar catálogo de modelos (Gemini)'}
        </Button>
      </Stack>

      {/* Painéis dos Provedores (1 coluna no mobile, 2 colunas no desktop) */}
      <Grid2 container spacing={2.5}>
        {/* Painel da OpenAI */}
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: form.llmProvider === LlmProviderType.OPENAI ? 'primary.main' : 'divider',
              bgcolor: 'background.paper',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <AutoAwesome color="primary" />
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
                  >
                    OpenAI Settings
                  </Typography>
                </Stack>
                {form.llmProvider === LlmProviderType.OPENAI && (
                  <Chip
                    size="small"
                    label="Ativo"
                    color="primary"
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {/* OPENAI_API_KEY */}
                <TextField
                  fullWidth
                  label="Chave de API da OpenAI"
                  type={showOpenAiKey ? 'text' : 'password'}
                  autoComplete="new-password"
                  slotProps={{
                    htmlInput: { 'data-testid': 'ai-provider-openai-key-input', spellCheck: false },
                  }}
                  value={form.openai.apiKey ?? ''}
                  onChange={(e) => handleOpenAiChange('apiKey', e.target.value)}
                  placeholder="sk-proj-..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          sx={{ minWidth: 44, minHeight: 44 }}
                          size="small"
                          aria-label="Alternar visibilidade da chave OpenAI"
                          onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                        >
                          {showOpenAiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5, minHeight: 48 },
                  }}
                  helperText={
                    settings?.openai.hasApiKey
                      ? 'Chave salva no servidor. Digite para substituir; deixe vazio para preservar.'
                      : 'Nenhuma chave salva. Digite uma chave para configurar.'
                  }
                />

                {settings?.openai.hasApiKey && (
                  <Button
                    data-testid="ai-provider-openai-remove-key"
                    color="warning"
                    sx={{ minHeight: 44 }}
                    onClick={() =>
                      handleOpenAiChange(
                        'keyAction',
                        form.openai.keyAction === ApiKeyAction.REMOVE
                          ? ApiKeyAction.PRESERVE
                          : ApiKeyAction.REMOVE
                      )
                    }
                  >
                    {form.openai.keyAction === ApiKeyAction.REMOVE
                      ? 'Cancelar remoção da chave'
                      : 'Remover chave salva'}
                  </Button>
                )}
                {form.openai.keyAction === ApiKeyAction.REMOVE && (
                  <Alert data-testid="ai-provider-openai-key-removal-notice" severity="warning">
                    A chave será removida ao salvar.
                  </Alert>
                )}

                {/* generalModel */}
                <FormControl fullWidth>
                  <InputLabel id="openai-general-model-label">
                    Modelo padrão (generalModel)
                  </InputLabel>
                  <Select
                    labelId="openai-general-model-label"
                    label="Modelo padrão (generalModel)"
                    value={form.openai.generalModel}
                    onChange={(e) => handleOpenAiChange('generalModel', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {openAiGeneralModels.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                        {inUse(m, settings?.openai.generalModel)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText data-testid="ai-provider-openai-catalog-note">
                    {openAiCatalog.description}
                  </FormHelperText>
                </FormControl>

                {/* imageModel */}
                <FormControl fullWidth>
                  <InputLabel id="openai-image-model-label">
                    Modelo de imagem (imageModel)
                  </InputLabel>
                  <Select
                    labelId="openai-image-model-label"
                    label="Modelo de imagem (imageModel)"
                    value={form.openai.imageModel}
                    onChange={(e) => handleOpenAiChange('imageModel', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {openAiImageModels.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                        {inUse(m, settings?.openai.imageModel)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Apenas modelos de imagem que o Estúdio consegue acionar são listados.
                  </FormHelperText>
                </FormControl>

                {/* reasoningEffort */}
                <FormControl fullWidth>
                  <InputLabel id="openai-reasoning-effort-label">
                    Nível de Raciocínio (reasoningEffort)
                  </InputLabel>
                  <Select
                    labelId="openai-reasoning-effort-label"
                    label="Nível de Raciocínio (reasoningEffort)"
                    value={form.openai.reasoningEffort}
                    onChange={(e) =>
                      handleOpenAiChange('reasoningEffort', e.target.value as OpenAIReasoningEffort)
                    }
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {OPENAI_REASONING_EFFORT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* imageQuality */}
                <FormControl fullWidth>
                  <InputLabel id="openai-image-quality-label">
                    Qualidade de Imagem (imageQuality)
                  </InputLabel>
                  <Select
                    labelId="openai-image-quality-label"
                    label="Qualidade de Imagem (imageQuality)"
                    value={form.openai.imageQuality}
                    onChange={(e) =>
                      handleOpenAiChange('imageQuality', e.target.value as OpenAIImageQuality)
                    }
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {OPENAI_IMAGE_QUALITY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>

        {/* Painel do Google Gemini */}
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor:
                form.llmProvider === LlmProviderType.GEMINI ? 'secondary.main' : 'divider',
              bgcolor: 'background.paper',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Psychology color="secondary" />
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}
                  >
                    Google Gemini Settings
                  </Typography>
                </Stack>
                {form.llmProvider === LlmProviderType.GEMINI && (
                  <Chip
                    size="small"
                    label="Ativo"
                    color="secondary"
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                )}
              </Stack>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {/* GEMINI_API_KEY */}
                <TextField
                  fullWidth
                  helperText={
                    settings?.gemini.hasApiKey
                      ? 'Chave salva no servidor. Digite para substituir; deixe vazio para preservar.'
                      : 'Nenhuma chave salva. Digite uma chave para configurar.'
                  }
                  label="Chave de API do Gemini"
                  type={showGeminiKey ? 'text' : 'password'}
                  autoComplete="new-password"
                  slotProps={{
                    htmlInput: { 'data-testid': 'ai-provider-gemini-key-input', spellCheck: false },
                  }}
                  value={form.gemini.apiKey ?? ''}
                  onChange={(e) => handleGeminiChange('apiKey', e.target.value)}
                  placeholder="Informe sua chave Gemini"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          sx={{ minWidth: 44, minHeight: 44 }}
                          size="small"
                          aria-label="Alternar visibilidade da chave Gemini"
                          onClick={() => setShowGeminiKey(!showGeminiKey)}
                        >
                          {showGeminiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5, minHeight: 48 },
                  }}
                />

                {settings?.gemini.hasApiKey && (
                  <Button
                    data-testid="ai-provider-gemini-remove-key"
                    color="warning"
                    sx={{ minHeight: 44 }}
                    onClick={() =>
                      handleGeminiChange(
                        'keyAction',
                        form.gemini.keyAction === ApiKeyAction.REMOVE
                          ? ApiKeyAction.PRESERVE
                          : ApiKeyAction.REMOVE
                      )
                    }
                  >
                    {form.gemini.keyAction === ApiKeyAction.REMOVE
                      ? 'Cancelar remoção da chave'
                      : 'Remover chave salva'}
                  </Button>
                )}
                {form.gemini.keyAction === ApiKeyAction.REMOVE && (
                  <Alert data-testid="ai-provider-gemini-key-removal-notice" severity="warning">
                    A chave será removida ao salvar.
                  </Alert>
                )}

                {/* generalModel */}
                <FormControl fullWidth>
                  <InputLabel id="gemini-general-model-label">
                    Modelo padrão (generalModel)
                  </InputLabel>
                  <Select
                    labelId="gemini-general-model-label"
                    label="Modelo padrão (generalModel)"
                    value={form.gemini.generalModel}
                    onChange={(e) => handleGeminiChange('generalModel', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {geminiGeneralModels.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* fallbackModel */}
                <FormControl fullWidth>
                  <InputLabel id="gemini-fallback-model-label">
                    Modelo de Fallback (fallbackModel)
                  </InputLabel>
                  <Select
                    labelId="gemini-fallback-model-label"
                    label="Modelo de Fallback (fallbackModel)"
                    value={form.gemini.fallbackModel}
                    onChange={(e) => handleGeminiChange('fallbackModel', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {geminiGeneralModels.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* imageModel */}
                <FormControl fullWidth>
                  <InputLabel id="gemini-image-model-label">
                    Modelo de Imagem (imageModel)
                  </InputLabel>
                  <Select
                    labelId="gemini-image-model-label"
                    label="Modelo de Imagem (imageModel)"
                    value={form.gemini.imageModel}
                    onChange={(e) => handleGeminiChange('imageModel', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {geminiImageModels.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* imageSize */}
                <FormControl fullWidth>
                  <InputLabel id="gemini-image-size-label">
                    Tamanho de Imagem (imageSize)
                  </InputLabel>
                  <Select
                    labelId="gemini-image-size-label"
                    label="Tamanho de Imagem (imageSize)"
                    value={form.gemini.imageSize}
                    onChange={(e) => handleGeminiChange('imageSize', e.target.value)}
                    sx={{ borderRadius: 2.5, minHeight: 48 }}
                  >
                    {modelOptions(
                      GEMINI_IMAGE_SIZE_OPTIONS.map((option) => option.value),
                      form.gemini.imageSize
                    ).map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                        {GEMINI_IMAGE_SIZE_OPTIONS.some((option) => option.value === size)
                          ? ''
                          : ' (valor antigo, não aceito ao salvar)'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    label="Tentativas extras em falhas temporárias"
                    type="number"
                    value={Number.isNaN(form.gemini.maxRetries) ? '' : form.gemini.maxRetries}
                    onChange={(e) =>
                      handleGeminiChange('maxRetries', parseIntegerInput(e.target.value))
                    }
                    error={Boolean(retryErrors.maxRetries)}
                    helperText={
                      retryErrors.maxRetries ??
                      `0 a ${GEMINI_MAX_RETRIES}. Cada tentativa extra pode gerar nova cobrança.`
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: GEMINI_MAX_RETRIES,
                        step: 1,
                        inputMode: 'numeric',
                        'data-testid': 'ai-provider-gemini-max-retries',
                      },
                    }}
                    InputProps={{ sx: { borderRadius: 2.5, minHeight: 48 } }}
                  />

                  <TextField
                    fullWidth
                    label="Intervalo base entre tentativas (ms)"
                    type="number"
                    value={
                      Number.isNaN(form.gemini.retryBaseDelayMs) ? '' : form.gemini.retryBaseDelayMs
                    }
                    onChange={(e) =>
                      handleGeminiChange('retryBaseDelayMs', parseIntegerInput(e.target.value))
                    }
                    error={Boolean(retryErrors.retryBaseDelayMs)}
                    helperText={
                      retryErrors.retryBaseDelayMs ?? `0 a ${GEMINI_MAX_RETRY_DELAY_MS} ms.`
                    }
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: GEMINI_MAX_RETRY_DELAY_MS,
                        step: GEMINI_RETRY_DELAY_STEP_MS,
                        inputMode: 'numeric',
                        'data-testid': 'ai-provider-gemini-retry-delay',
                      },
                    }}
                    InputProps={{ sx: { borderRadius: 2.5, minHeight: 48 } }}
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>

      {/* Floating Action Bar (Mobile-First Sticky Bottom Bar) */}
      <Paper
        elevation={6}
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          bottom: { xs: 0, sm: 16 },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          mt: 4,
          p: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          borderRadius: { xs: '16px 16px 0 0', sm: 4 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          zIndex: 1100,
          boxShadow: { xs: '0 -4px 20px rgba(0,0,0,0.12)', sm: '0 4px 20px rgba(0,0,0,0.06)' },
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.775rem', sm: '0.875rem' },
            textAlign: { xs: 'center', sm: 'left' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          {isDirty ? (
            <span style={{ color: theme.palette.warning.main, fontWeight: 700 }}>
              ⚠️ Alterações pendentes de gravação
            </span>
          ) : (
            'Configurações sincronizadas no banco de dados.'
          )}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}
        >
          <Button
            data-testid="ai-providers-reset-button"
            fullWidth={false}
            variant="outlined"
            color="warning"
            startIcon={<Restore />}
            disabled={saveMutation.isPending}
            onClick={handleResetToDefault}
            sx={{
              flex: { xs: 1, sm: 'initial' },
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 44,
            }}
          >
            Restaurar
          </Button>

          <Button
            data-testid="ai-providers-save-button"
            variant="contained"
            color="primary"
            startIcon={
              saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Save />
            }
            disabled={
              !isDirty ||
              hasRetryErrors ||
              Boolean(keyIssue) ||
              saveMutation.isPending ||
              (form.openai.keyAction === ApiKeyAction.REPLACE && !form.openai.apiKey.trim()) ||
              (form.gemini.keyAction === ApiKeyAction.REPLACE && !form.gemini.apiKey.trim())
            }
            onClick={handleSave}
            sx={{
              flex: { xs: 1.5, sm: 'initial' },
              borderRadius: 2.5,
              px: { xs: 2, sm: 3 },
              fontWeight: 700,
              textTransform: 'none',
              minHeight: 44,
            }}
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Stack>
      </Paper>
      <UnsavedChangesDialog {...leave.dialog} />
    </Box>
  );
};
