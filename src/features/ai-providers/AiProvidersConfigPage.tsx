import React, { useEffect, useState } from 'react';
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
import { DEFAULT_AI_PROVIDER_SETTINGS } from './constants';
import { LlmProviderType } from './types';
import { getErrorMessage } from '@/utils/apiError';
import type {
  AiProviderSettings,
  GeminiSettings,
  AiProviderFeedback,
  OpenAiSettings,
  OpenAIImageQuality,
  OpenAIReasoningEffort,
} from './types';

export const AiProvidersConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: settings, isLoading, isError, refetch } = useAiProviderSettings();
  const saveMutation = useSaveAiProviderSettings();

  const [form, setForm] = useState<AiProviderSettings>(DEFAULT_AI_PROVIDER_SETTINGS);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  const {
    data: openaiModelsData,
    isLoading: loadingOpenAiModels,
    refetch: refetchOpenAiModels,
  } = useOpenAiModels(form.llmProvider === LlmProviderType.OPENAI);

  const {
    data: geminiModelsData,
    isLoading: loadingGeminiModels,
    refetch: refetchGeminiModels,
  } = useGeminiModels(form.llmProvider === LlmProviderType.GEMINI);

  const [feedback, setFeedback] = useState<AiProviderFeedback | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(settings ?? DEFAULT_AI_PROVIDER_SETTINGS);

  const handleProviderChange = (provider: LlmProviderType) => {
    setForm((prev) => ({ ...prev, llmProvider: provider }));
    setFeedback(null);
  };

  const handleOpenAiChange = <K extends keyof OpenAiSettings>(key: K, value: OpenAiSettings[K]) => {
    setForm((prev) => ({
      ...prev,
      openai: { ...prev.openai, [key]: value },
    }));
    setFeedback(null);
  };

  const handleGeminiChange = <K extends keyof GeminiSettings>(key: K, value: GeminiSettings[K]) => {
    setForm((prev) => ({
      ...prev,
      gemini: { ...prev.gemini, [key]: value },
    }));
    setFeedback(null);
  };

  const handleFetchLiveModels = async () => {
    setFeedback(null);
    if (form.llmProvider === LlmProviderType.OPENAI) {
      const res = await refetchOpenAiModels();
      const countGen = res.data?.models.general.length ?? 0;
      const countImg = res.data?.models.image.length ?? 0;
      setFeedback({
        severity: 'success',
        message: `Modelos da OpenAI disponíveis: ${countGen} de texto, ${countImg} de imagem.`,
      });
    } else {
      const res = await refetchGeminiModels();
      const countGen = res.data?.models.general.length ?? 0;
      const countImg = res.data?.models.image.length ?? 0;
      setFeedback({
        severity: 'success',
        message: `Modelos do Gemini disponíveis: ${countGen} de texto, ${countImg} de imagem.`,
      });
    }
  };

  const handleSave = async () => {
    setFeedback(null);
    try {
      const saved = await saveMutation.mutateAsync(form);
      setForm(saved);
      setFeedback({
        severity: 'success',
        message: 'Configurações salvas e aplicadas com sucesso no banco de dados!',
      });
    } catch (err) {
      setFeedback({
        severity: 'error',
        message: getErrorMessage(err),
      });
    }
  };

  const handleResetToDefault = async () => {
    setFeedback(null);
    setForm(DEFAULT_AI_PROVIDER_SETTINGS);
    try {
      await saveMutation.mutateAsync(DEFAULT_AI_PROVIDER_SETTINGS);
      setFeedback({
        severity: 'success',
        message:
          'Configurações restauradas e salvas com sucesso para os padrões do sistema (OpenAI / Gemini)!',
      });
    } catch {
      setFeedback({
        severity: 'info',
        message:
          'Valores restaurados para os padrões recomendados do sistema. Clique em salvar para confirmar.',
      });
    }
  };

  const openAiGeneralModels = openaiModelsData?.models.general ?? [
    'gpt-6-luna',
    'gpt-5.6-luna',
    'gpt-5.6',
    'gpt-4o',
    'gpt-4o-mini',
    'o3-mini',
    'o1',
  ];
  const openAiImageModels = openaiModelsData?.models.image ?? [
    'gpt-image-2',
    'gpt-image-2.5-flare',
    'gpt-image-2.5-sunburst',
    'gpt-image-1-mini',
    'dall-e-3',
  ];

  const geminiGeneralModels = geminiModelsData?.models.general ?? [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
  const geminiImageModels = geminiModelsData?.models.image ?? [
    'gemini-3.1-flash-image',
    'imagen-3.0-generate-002',
  ];

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
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        pb: { xs: 12, sm: 6 },
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Botão de Voltar */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/adm/estudio')}
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

      {/* Botão de Busca de Modelos em Tempo Real (Full Width on Mobile) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
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
            ? 'Consultando API...'
            : `Consultar Modelos em Tempo Real (GET /api/${form.llmProvider}/models)`}
        </Button>
      </Box>

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
                  label="OPENAI_API_KEY"
                  type={showOpenAiKey ? 'text' : 'password'}
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
                  helperText="Utilizada para autenticar a chamada GET /v1/models."
                />

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
                        {m} {m === 'gpt-6-luna' ? '★ (Ativo no ambiente)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Modelos de texto consultados via GET /api/openai/models.
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
                        {m} {m === 'gpt-image-2' ? '★ (Ativo no ambiente)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Filtrado dinamicamente por prefixo (ex: gpt-image-*).
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
                    <MenuItem value="none">none (Resposta Direta / Sem Delay)</MenuItem>
                    <MenuItem value="low">low (Raciocínio Leve)</MenuItem>
                    <MenuItem value="medium">medium (Raciocínio Moderado)</MenuItem>
                    <MenuItem value="high">high (Raciocínio Profundo / O1)</MenuItem>
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
                    <MenuItem value="low">low (Desempenho)</MenuItem>
                    <MenuItem value="medium">medium (Equilibrado)</MenuItem>
                    <MenuItem value="high">high (Alta Resolução)</MenuItem>
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
                  label="GEMINI_API_KEY"
                  type={showGeminiKey ? 'text' : 'password'}
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
                    <MenuItem value="1K">1K</MenuItem>
                    <MenuItem value="2K">2K</MenuItem>
                    <MenuItem value="4K">4K</MenuItem>
                    <MenuItem value="1024x1024">1024x1024</MenuItem>
                  </Select>
                </FormControl>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    label="maxRetries"
                    type="number"
                    value={form.gemini.maxRetries}
                    onChange={(e) => handleGeminiChange('maxRetries', Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0, max: 10 } }}
                    InputProps={{ sx: { borderRadius: 2.5, minHeight: 48 } }}
                  />

                  <TextField
                    fullWidth
                    label="retryBaseDelayMs"
                    type="number"
                    value={form.gemini.retryBaseDelayMs}
                    onChange={(e) => handleGeminiChange('retryBaseDelayMs', Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 0, max: 10000, step: 100 } }}
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
            disabled={!isDirty || saveMutation.isPending}
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
    </Box>
  );
};
