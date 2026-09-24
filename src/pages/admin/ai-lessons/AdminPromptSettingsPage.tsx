import React, { useEffect, useMemo, useState } from 'react';
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

const ORDER = Object.values(LessonStageType);

const STAGE_CONFIG: Record<
  LessonStageType,
  { label: string; shortLabel: string; description: string; icon: string }
> = {
  LESSON: {
    label: '1. Lição Completa',
    shortLabel: '1. Lição',
    description: 'Orientação geral para a narrativa da lição, teologia e escolha do versículo NVI.',
    icon: '📖',
  },
  LESSON_VISUALS: {
    label: '2. Visuais da História',
    shortLabel: '2. Visuais',
    description: 'Diretrizes para ilustrações e cenas cronológicas da história bíblica.',
    icon: '🎨',
  },
  STANDARD_GAME: {
    label: '3. Brincadeira Prática',
    shortLabel: '3. Brincadeira',
    description: 'Instruções para a dinâmica prática e brincadeira em grupo.',
    icon: '🏃',
  },
  VERSE_VISUALS: {
    label: '4. Visuais do Versículo',
    shortLabel: '4. Vis. Versículo',
    description: 'Regras para a sequência de imagens mnemônicas de memorização.',
    icon: '🧩',
  },
  VERSE_FIXATION: {
    label: '5. Fixação Divertida',
    shortLabel: '5. Fixação',
    description: 'Orientações para o jogo ou atividade interativa de memorização.',
    icon: '🎯',
  },
  MEDITATION_YOUNGER: {
    label: '6. Meditação dos Menores',
    shortLabel: '6. Med. Menores',
    description: 'Diretrizes pedagógicas para crianças de 5 a 7 anos (2 atividades).',
    icon: '✏️',
  },
  MEDITATION_OLDER: {
    label: '7. Meditação dos Maiores',
    shortLabel: '7. Med. Maiores',
    description: 'Diretrizes de reflexão e gabarito para crianças de 8 a 11 anos (3 atividades).',
    icon: '🧠',
  },
  MANUAL_WORK: {
    label: '8. Trabalho Manual',
    shortLabel: '8. Trab. Manual',
    description: 'Instruções para o desenho em preto e branco para recortar e colorir.',
    icon: '✂️',
  },
};

const PROMPT_PRESETS = [
  {
    label: 'Linguagem Simples',
    text: '\n• Use vocabulário simples, direto e adaptado para a compreensão infantil.',
  },
  {
    label: 'Aplicação Prática',
    text: '\n• Conecte cada ensinamento com situações reais da rotina das crianças em casa e na escola.',
  },
  {
    label: 'Foco em Oração',
    text: '\n• Enfatize atitudes de gratidão e momentos curtos de oração espontânea.',
  },
  {
    label: 'Perguntas Interativas',
    text: '\n• Inclua perguntas abertas que estimulem a reflexão e resposta ativa das crianças.',
  },
];

const queryKey = ['ai-lessons', 'prompt-preferences'] as const;

export const AdminPromptSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const client = useQueryClient();

  const [stage, setStage] = useState<LessonStageType>(LessonStageType.LESSON);
  const [drafts, setDrafts] = useState<Partial<Record<LessonStageType, string>>>({});
  const [resetOpen, setResetOpen] = useState(false);
  const [basePromptExpanded, setBasePromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; text: string } | null>(
    null
  );

  const query = useQuery({
    queryKey,
    queryFn: aiLessonsService.getPromptPreferences,
    staleTime: 30000,
  });

  useEffect(() => {
    if (query.data) {
      setDrafts(Object.fromEntries(query.data.map((item) => [item.stage, item.effectivePrompt])));
    }
  }, [query.data]);

  const preference = query.data?.find((item) => item.stage === stage);
  const value = drafts[stage] ?? preference?.effectivePrompt ?? '';
  const dirty = Boolean(preference && value.trim() !== preference.effectivePrompt);

  const dirtyCount = useMemo(
    () =>
      query.data?.filter(
        (item) => (drafts[item.stage] ?? item.effectivePrompt).trim() !== item.effectivePrompt
      ).length ?? 0,
    [drafts, query.data]
  );

  const save = useMutation({
    mutationFn: ({ item, prompt }: { item: AdminPromptPreference; prompt: string }) =>
      aiLessonsService.savePromptPreference(item.stage, prompt, item.lockVersion),
    onSuccess: (saved) => {
      client.setQueryData<AdminPromptPreference[]>(queryKey, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      setFeedback({
        severity: 'success',
        text: 'Prompt salvo com sucesso! Suas orientações serão aplicadas nas próximas gerações.',
      });
    },
    onError: () =>
      setFeedback({
        severity: 'error',
        text: 'Conflito ao salvar as orientações. Recarregue a página antes de tentar novamente.',
      }),
  });

  const reset = useMutation({
    mutationFn: aiLessonsService.resetPromptPreference,
    onSuccess: (saved) => {
      client.setQueryData<AdminPromptPreference[]>(queryKey, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      setDrafts((current) => ({ ...current, [saved.stage]: saved.basePrompt }));
      setResetOpen(false);
      setFeedback({
        severity: 'success',
        text: 'Prompt oficial restaurado com sucesso.',
      });
    },
    onError: () =>
      setFeedback({
        severity: 'error',
        text: 'Não foi possível restaurar o prompt oficial.',
      }),
  });

  const leave = () => {
    if (dirtyCount && !window.confirm('Existem alterações não salvas. Deseja realmente sair?')) return;
    navigate('/adm/estudio');
  };

  const handleCopyBasePrompt = () => {
    if (preference?.basePrompt) {
      navigator.clipboard.writeText(preference.basePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsertPreset = (presetText: string) => {
    setDrafts((current) => {
      const existing = current[stage] ?? preference?.effectivePrompt ?? '';
      return { ...current, [stage]: existing + presetText };
    });
    setFeedback(null);
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
          p: { xs: 2.5, sm: 3, md: 3.5 },
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
              Personalize, por etapa da lição, as instruções editoriais para a inteligência artificial.
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
          As suas orientações complementam o contrato oficial. Estrutura de schema, regras de segurança,
          NVI e campos obrigatórios continuam validados e protegidos pelo servidor.
        </Alert>
      </Paper>

      {/* Main Content Layout */}
      {query.isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 12 }}>
          <CircularProgress size={44} thickness={4} />
          <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
            Carregando orientações...
          </Typography>
        </Box>
      ) : query.isError ? (
        <Alert
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
                  const isDirty = (drafts[item] ?? pref?.effectivePrompt ?? '').trim() !== pref?.effectivePrompt;
                  const isCustom = Boolean(pref?.customPrompt);

                  return (
                    <Tab
                      key={item}
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
                        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
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
                            size="small"
                            onClick={handleCopyBasePrompt}
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                          >
                            {copied ? <CheckCircle color="success" fontSize="small" /> : <ContentCopy fontSize="small" />}
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
                      value={value}
                      onChange={(event) => {
                        setDrafts((current) => ({ ...current, [stage]: event.target.value }));
                        setFeedback(null);
                      }}
                      multiline
                      minRows={10}
                      fullWidth
                      error={value.trim().length > 0 && value.trim().length < 10}
                      inputProps={{ maxLength: 12000 }}
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
                    <Alert severity={feedback.severity} sx={{ mb: 2, borderRadius: 2.5 }}>
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
                      disabled={!preference.customPrompt || reset.isPending}
                      onClick={() => setResetOpen(true)}
                      sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600, textTransform: 'none' }}
                    >
                      Restaurar padrão
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      disabled={!dirty || value.trim().length < 10 || save.isPending}
                      onClick={() => save.mutate({ item: preference, prompt: value.trim() })}
                      sx={{ borderRadius: 2.5, minHeight: 44, px: 3, fontWeight: 700, textTransform: 'none' }}
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
            left: 0,
            right: 0,
            p: 1.5,
            px: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1100,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="warning.main">
            Alterações pendentes
          </Typography>
          <Button
            variant="contained"
            size="medium"
            startIcon={<Save />}
            disabled={value.trim().length < 10 || save.isPending}
            onClick={() => save.mutate({ item: preference, prompt: value.trim() })}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            {save.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </Paper>
      )}

      {/* Modal de Confirmação para Restaurar Prompt Oficial */}
      <Dialog
        data-testid="admin-prompt-page-reset-dialog"
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Restaurar prompt oficial?</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            A sua personalização para a etapa <strong>{currentStageInfo.label}</strong> será removida. O sistema voltará a utilizar o prompt-base padrão.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setResetOpen(false)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="contained"
            onClick={() => reset.mutate(stage)}
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
