import { ORDER, STAGE_CONFIG, PROMPT_PRESETS } from '@/features/ai-lessons/promptConstants';
import { PROMPT_STALE_TIME_MS, PROMPT_COPY_FEEDBACK_MS } from '@/features/ai-lessons/constants';
import { aiLessonsKeys } from '@/features/ai-lessons/queryKeys';
import { acknowledgePromptDraft, editPromptDraft } from '@/features/ai-lessons/drafts';
import {
  StudioFeedbackSeverity,
  type PromptLocalDrafts,
  type SavePromptVariables,
  type StudioFeedback,
} from '@/features/ai-lessons/types';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { getHttpStatus } from '@/utils/apiError';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack,
  AutoAwesome,
  CheckCircle,
  ContentCopy,
  ExpandMore,
  InfoOutlined,
  LightbulbOutlined,
  RestartAlt,
  Save,
  Tune,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  AdminPromptPreference,
  aiLessonsService,
  LessonStageType,
} from '@/services/aiLessonsService';

export const AdminPromptSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const client = useQueryClient();

  const [stage, setStage] = useState<LessonStageType>(LessonStageType.LESSON);
  const [drafts, setDrafts] = useState<PromptLocalDrafts>({});
  const [resetOpen, setResetOpen] = useState(false);
  const [basePromptExpanded, setBasePromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<StudioFeedback | null>(null);

  const query = useQuery({
    queryKey: aiLessonsKeys.preferences,
    queryFn: aiLessonsService.getPromptPreferences,
    staleTime: PROMPT_STALE_TIME_MS,
  });

  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  const preference = query.data?.find((item) => item.stage === stage);
  const value = drafts[stage]?.value ?? preference?.effectivePrompt ?? '';
  const dirty = Boolean(drafts[stage]);
  const dirtyCount = Object.keys(drafts).length;
  const confirmLeave = useStudioUnsavedChanges(dirtyCount > 0);
  const changePrompt = (text: string) => {
    if (!preference) return;
    setDrafts((current) => ({
      ...current,
      [stage]: editPromptDraft(current[stage], preference, text),
    }));
    setFeedback(null);
  };
  const save = useMutation({
    mutationFn: ({ item, draft }: SavePromptVariables) =>
      aiLessonsService.savePromptPreference(item.stage, draft.value.trim(), draft.base.lockVersion),
    onSuccess: (saved, sent) => {
      client.setQueryData<AdminPromptPreference[]>(aiLessonsKeys.preferences, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      setDrafts((current) => acknowledgePromptDraft(current, sent.draft, saved));
      setFeedback({
        severity: StudioFeedbackSeverity.SUCCESS,
        text: 'Prompt salvo com sucesso! Suas orientações serão aplicadas nas próximas gerações.',
      });
    },
    onError: (error) =>
      setFeedback({
        severity: StudioFeedbackSeverity.ERROR,
        text:
          getHttpStatus(error) === 409
            ? 'As orientações foram alteradas em outra sessão. Sua edição foi preservada. Copie o texto antes de recarregar.'
            : 'Não foi possível salvar. Suas orientações locais foram preservadas.',
      }),
  });

  const reset = useMutation({
    mutationFn: ({ item }: SavePromptVariables) =>
      aiLessonsService.resetPromptPreference(item.stage),
    onSuccess: (saved, sent) => {
      client.setQueryData<AdminPromptPreference[]>(aiLessonsKeys.preferences, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      setDrafts((current) => acknowledgePromptDraft(current, sent.draft, saved));
      setResetOpen(false);
      setFeedback({
        severity: StudioFeedbackSeverity.SUCCESS,
        text: 'Prompt oficial restaurado com sucesso.',
      });
    },
    onError: () =>
      setFeedback({
        severity: StudioFeedbackSeverity.ERROR,
        text: 'Não foi possível restaurar o prompt oficial.',
      }),
  });

  const leave = () => {
    if (!confirmLeave()) return;
    navigate('/adm/estudio');
  };

  const handleCopyBasePrompt = () => {
    if (preference?.basePrompt) {
      navigator.clipboard.writeText(preference.basePrompt);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), PROMPT_COPY_FEEDBACK_MS);
    }
  };

  const handleInsertPreset = (presetText: string) => changePrompt(value + presetText);
  const saveCurrentPrompt = () => {
    const draft = drafts[stage];
    if (preference && draft) save.mutate({ item: preference, draft });
  };
  const currentStageInfo = STAGE_CONFIG[stage];

  return (
    <Box
      data-testid="admin-prompt-settings-page"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        pb: { xs: 10, sm: 4 },
      }}
    >
      {/* Botão de Voltar */}
      <Button
        startIcon={<ArrowBack />}
        onClick={leave}
        sx={{ mb: 2, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
      >
        Voltar para o Estúdio Clubinho
      </Button>

      {/* Hero Paper Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 3.5 },
          mb: 3,
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
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Tune fontSize="medium" />
              </Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' } }}
              >
                Orientações de Criação
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Personalize, por etapa da lição, as instruções editoriais para a inteligência
              artificial.
            </Typography>
          </Box>

          {dirtyCount > 0 && (
            <Chip
              color="warning"
              variant="filled"
              label={`${dirtyCount} ${dirtyCount === 1 ? 'etapa alterada' : 'etapas alteradas'}`}
              sx={{ fontWeight: 800, borderRadius: 2, px: 0.5 }}
            />
          )}
        </Stack>

        <Alert severity="info" icon={<InfoOutlined />} sx={{ mt: 2.5, borderRadius: 2.5 }}>
          As suas orientações complementam o contrato oficial. Estrutura de schema, regras de
          segurança, NVI e campos obrigatórios continuam validados e protegidos pelo servidor.
        </Alert>
      </Paper>

      {/* Main Content Layout */}
      {query.isLoading ? (
        <Box
          data-testid="admin-prompts-loading"
          sx={{ display: 'grid', placeItems: 'center', py: 12 }}
        >
          <CircularProgress size={44} thickness={4} />
          <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
            Carregando orientações...
          </Typography>
        </Box>
      ) : query.isError ? (
        <Alert
          data-testid="admin-prompts-error"
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar as orientações de criação.
        </Alert>
      ) : (
        <Grid2 container spacing={3}>
          {/* Navegação por Etapas (Tabs responsivos) */}
          <Grid2 size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Tabs
                data-testid="admin-prompts-stage-tabs"
                value={stage}
                onChange={(_, next: LessonStageType) => {
                  setStage(next);
                  setFeedback(null);
                  setBasePromptExpanded(false);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  px: 1,
                  py: 0.5,
                  '& .MuiTab-root': {
                    minHeight: 48,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    my: 0.5,
                    mx: 0.25,
                  },
                }}
              >
                {ORDER.map((item) => {
                  const pref = query.data?.find((p) => p.stage === item);
                  const isDirty = Boolean(drafts[item]);
                  const isCustom = Boolean(pref?.customPrompt);

                  return (
                    <Tab
                      key={item}
                      data-testid={`admin-prompts-tab-${item.toLowerCase().replaceAll('_', '-')}`}
                      value={item}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{STAGE_CONFIG[item].shortLabel}</span>
                          {isDirty ? (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'warning.main',
                              }}
                            />
                          ) : isCustom ? (
                            <Chip
                              size="small"
                              label="Personalizado"
                              color="primary"
                              sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                            />
                          ) : null}
                        </Stack>
                      }
                    />
                  );
                })}
              </Tabs>
            </Paper>
          </Grid2>

          {/* Painel Principal de Edição */}
          {preference && (
            <Grid2 size={{ xs: 12 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  {/* Etapa Cabeçalho */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                        >
                          {currentStageInfo.icon} {currentStageInfo.label}
                        </Typography>
                        <Chip
                          color={preference.customPrompt ? 'primary' : 'default'}
                          variant={preference.customPrompt ? 'filled' : 'outlined'}
                          label={preference.customPrompt ? 'Personalizado' : 'Padrão oficial'}
                          sx={{ fontWeight: 800, borderRadius: 1.5 }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {currentStageInfo.description}
                      </Typography>
                    </Box>

                    {dirty && (
                      <Chip
                        color="warning"
                        label="Alterações pendentes"
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    )}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Accordion do Prompt-base oficial (Imutável) */}
                  <Accordion
                    expanded={basePromptExpanded}
                    onChange={(_, expanded) => setBasePromptExpanded(expanded)}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px !important',
                      mb: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AutoAwesome color="primary" fontSize="small" />
                        <Typography fontWeight={700} variant="subtitle2" color="primary.main">
                          Ver Prompt-Base Oficial do Sistema (Imutável)
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ position: 'relative' }}>
                        <Tooltip title={copied ? 'Copiado!' : 'Copiar prompt-base'}>
                          <IconButton
                            data-testid="admin-prompts-copy-base"
                            aria-label="Copiar prompt-base"
                            size="small"
                            onClick={handleCopyBasePrompt}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                              minWidth: 44,
                              minHeight: 44,
                            }}
                          >
                            {copied ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <ContentCopy fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <TextField
                          value={preference.basePrompt}
                          multiline
                          minRows={4}
                          maxRows={10}
                          fullWidth
                          InputProps={{
                            readOnly: true,
                            sx: {
                              fontFamily: 'monospace',
                              fontSize: '0.825rem',
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                            },
                          }}
                          helperText="Instrução contratual base da plataforma. Suas personalizações abaixo serão combinadas a este prompt."
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Sugestões de Presets Rápidos */}
                  <Box sx={{ mb: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <LightbulbOutlined fontSize="small" color="primary" />
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        Sugestões rápidas de diretrizes (clique para adicionar ao seu prompt):
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                      {PROMPT_PRESETS.map((preset) => (
                        <Chip
                          key={preset.label}
                          icon={<AddIcon fontSize="small" />}
                          label={preset.label}
                          onClick={() => handleInsertPreset(preset.text)}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Editor Principal do Prompt Efetivo */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      data-testid={`admin-prompt-page-input-${stage}`}
                      label="Suas orientações personalizadas"
                      placeholder="Escreva aqui as diretrizes pedagógicas, estilo de linguagem ou instruções adicionais..."
                      disabled={reset.isPending}
                      value={value}
                      onChange={(event) => {
                        changePrompt(event.target.value);
                      }}
                      multiline
                      minRows={10}
                      fullWidth
                      error={value.trim().length > 0 && value.trim().length < 10}
                      slotProps={{ htmlInput: { maxLength: 12000 } }}
                      InputProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          borderRadius: 3,
                          lineHeight: 1.5,
                        },
                      }}
                      helperText={`${value.length}/12000 caracteres · mínimo de 10`}
                    />
                  </Box>

                  {/* Alerta de Feedback */}
                  {feedback && (
                    <Alert
                      data-testid="admin-prompts-feedback"
                      severity={feedback.severity}
                      sx={{ mb: 2, borderRadius: 2.5 }}
                    >
                      {feedback.text}
                    </Alert>
                  )}

                  {/* Ações (Desktop / Tablet) */}
                  <Stack
                    direction={{ xs: 'column-reverse', sm: 'row' }}
                    justifyContent="flex-end"
                    spacing={1.5}
                    sx={{ mt: 3 }}
                  >
                    <Button
                      color="warning"
                      variant="outlined"
                      startIcon={<RestartAlt />}
                      disabled={
                        !preference.customPrompt ||
                        reset.isPending ||
                        save.isPending ||
                        reset.isPending
                      }
                      onClick={() => setResetOpen(true)}
                      sx={{
                        borderRadius: 2.5,
                        minHeight: 44,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Restaurar padrão
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      disabled={
                        !dirty || value.trim().length < 10 || save.isPending || reset.isPending
                      }
                      onClick={saveCurrentPrompt}
                      sx={{
                        borderRadius: 2.5,
                        minHeight: 44,
                        px: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      {save.isPending ? 'Salvando…' : 'Salvar personalização'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid2>
          )}
        </Grid2>
      )}

      {/* Floating Action Bar em Dispositivos Móveis (Mobile-First Sticky Bar) */}
      {preference && dirty && (
        <Paper
          elevation={4}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            position: 'fixed',
            bottom: 0,
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            left: 0,
            right: 0,
            p: 1.5,
            px: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1100,
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 1,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="warning.main" textAlign="center">
            Alterações pendentes
          </Typography>
          <Button
            variant="contained"
            size="medium"
            startIcon={<Save />}
            disabled={value.trim().length < 10 || save.isPending || reset.isPending}
            onClick={saveCurrentPrompt}
            fullWidth
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            {save.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </Paper>
      )}

      {/* Modal de Confirmação para Restaurar Prompt Oficial */}
      <Dialog
        data-testid="admin-prompt-page-reset-dialog"
        aria-labelledby="admin-prompts-reset-title"
        open={resetOpen}
        onClose={() => {
          if (!reset.isPending) setResetOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              p: { xs: 0, sm: 1 },
              m: { xs: 1.5, sm: 4 },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        <DialogTitle id="admin-prompts-reset-title" sx={{ fontWeight: 800 }}>
          Restaurar prompt oficial?
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            A sua personalização para a etapa <strong>{currentStageInfo.label}</strong> será
            removida. O sistema voltará a utilizar o prompt-base padrão.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            disabled={reset.isPending}
            onClick={() => setResetOpen(false)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => {
              if (preference)
                reset.mutate({
                  item: preference,
                  draft: drafts[stage] ?? { base: preference, value },
                });
            }}
            disabled={reset.isPending}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            {reset.isPending ? 'Restaurando...' : 'Restaurar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
