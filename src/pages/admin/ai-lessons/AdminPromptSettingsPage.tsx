import { PromptReference } from '@/features/ai-lessons/components/prompts/PromptReference';
import { PromptResetDialog } from '@/features/ai-lessons/components/prompts/PromptResetDialog';
import { PromptStageTabs } from '@/features/ai-lessons/components/prompts/PromptStageTabs';
import { lessonStageDescription, lessonStageLabel } from '@/features/ai-lessons/presentation.utils';
import {
  PROMPT_PRESETS,
  PROMPT_STAGE_EXAMPLES,
  PROMPT_TEXTS,
  STAGE_CONFIG,
} from '@/features/ai-lessons/promptConstants';
import {
  firstName,
  isClearingSavedPrompt,
  promptCustomisationSummary,
  promptSavedLabel,
  promptSummaryLabel,
  promptValidationMessage,
} from '@/features/ai-lessons/prompt.utils';
import { PROMPT_MAX_LENGTH, PROMPT_STALE_TIME_MS } from '@/features/ai-lessons/constants';
import { aiLessonsKeys } from '@/features/ai-lessons/queryKeys';
import {
  acknowledgePromptDraft,
  resolveEffectivePromptPreview,
  editPromptDraft,
  hasDuplicatedBasePrompt,
  isValidComplementaryPrompt,
  isPersistedPromptDrafts,
  isPromptDraftOutdated,
  rebasePromptDraft,
  resolvePromptDraftValue,
  restorePromptDrafts,
  stripDuplicatedBasePrompt,
  toPersistedPromptDrafts,
} from '@/features/ai-lessons/drafts';
import {
  readStudioSnapshot,
  resolveStudioStorage,
  studioSnapshotKey,
} from '@/features/ai-lessons/draftStorage';
import {
  LESSON_CATEGORY_LABELS,
  STUDIO_ROUTES,
} from '@/features/ai-lessons/presentation.constants';
import {
  usePersistedStudioState,
  useStudioUserId,
} from '@/features/ai-lessons/usePersistedStudioState';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import {
  LessonCategory,
  StudioFeedbackSeverity,
  StudioSnapshotScope,
  type PersistedPromptDrafts,
  type PromptCategoryDrafts,
  type PromptLocalDrafts,
  type SavePromptVariables,
  type StudioFeedback,
} from '@/features/ai-lessons/types';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { getHttpStatus } from '@/utils/apiError';
import type { RootState } from '@/store/slices';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack,
  LightbulbOutlined,
  PersonOutline,
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

/**
 * Orientações de criação (`/adm/estudio/orientacoes`).
 *
 * Cada administrador escreve, por tipo de material e por etapa, o que quer
 * acrescentar às regras oficiais que a IA recebe. A personalização é de quem
 * está logado — a API a guarda por usuário e a aplica às gerações que esse
 * usuário dispara —, e é isso que a tela deixa claro logo no topo.
 */
export const AdminPromptSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const sessionUserId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  // Sticky: an expired session must not look like "another user" and wipe the drafts.
  const userId = useStudioUserId() || sessionUserId;
  const [category, setCategory] = useState(LessonCategory.REGULAR);
  const preferencesKey = aiLessonsKeys.preferencesByUser(userId, category);

  const [stage, setStage] = useState<LessonStageType>(LessonStageType.LESSON);
  const [categoryDrafts, setCategoryDrafts] = useState<PromptCategoryDrafts>({});
  const drafts = categoryDrafts[category] ?? {};
  const setDrafts = (update: (current: PromptLocalDrafts) => PromptLocalDrafts) => {
    setCategoryDrafts((all) => ({ ...all, [category]: update(all[category] ?? {}) }));
  };
  const [resetOpen, setResetOpen] = useState(false);
  const [feedback, setFeedback] = useState<StudioFeedback | null>(null);

  const storageKey = userId ? studioSnapshotKey(StudioSnapshotScope.PROMPT_DRAFTS, userId) : '';
  const [persisted, setPersisted] = useState<PersistedPromptDrafts | null>(null);
  const [restoredCategories, setRestoredCategories] = useState<LessonCategory[]>([]);
  const [loadedKey, setLoadedKey] = useState('');
  const [recovered, setRecovered] = useState(false);

  useEffect(() => {
    setCategoryDrafts({});
    setFeedback(null);
    setRestoredCategories([]);
    setRecovered(false);
    setPersisted(
      storageKey
        ? readStudioSnapshot(resolveStudioStorage(), storageKey, isPersistedPromptDrafts)
        : null
    );
    setLoadedKey(storageKey);
  }, [storageKey]);

  const query = useQuery({
    queryKey: preferencesKey,
    queryFn: ({ signal }) => aiLessonsService.getPromptPreferences(signal, category),
    staleTime: PROMPT_STALE_TIME_MS,
  });

  // Stored drafts only carry the typed text; they are rebuilt once their preferences load.
  useEffect(() => {
    if (!query.data || loadedKey !== storageKey || restoredCategories.includes(category)) return;
    const restored = restorePromptDrafts(persisted?.[category], query.data);
    if (Object.keys(restored).length) {
      setCategoryDrafts((all) => ({ ...all, [category]: { ...restored, ...all[category] } }));
      setRecovered(true);
    }
    setRestoredCategories((current) => [...current, category]);
  }, [category, loadedKey, persisted, query.data, restoredCategories, storageKey]);
  const persistedDrafts = useMemo(() => {
    const live = toPersistedPromptDrafts(categoryDrafts);
    const result: PersistedPromptDrafts = {};
    for (const item of Object.values(LessonCategory)) {
      // A category already rebuilt on screen is owned by the live drafts, not by the snapshot.
      const source = restoredCategories.includes(item) ? live[item] : persisted?.[item];
      if (source && Object.keys(source).length) result[item] = source;
    }
    return result;
  }, [categoryDrafts, persisted, restoredCategories]);
  usePersistedStudioState(
    loadedKey === storageKey && restoredCategories.includes(category) ? storageKey : '',
    persistedDrafts
  );

  const preference = query.data?.find((item) => item.stage === stage);
  const value = resolvePromptDraftValue(drafts[stage], preference);
  const effectivePreview = preference ? resolveEffectivePromptPreview(preference, value) : '';
  const hasBaseDuplication = preference
    ? hasDuplicatedBasePrompt(value, preference.basePrompt)
    : false;
  const isPromptValid = isValidComplementaryPrompt(value);
  const dirty = Boolean(drafts[stage]);
  const dirtyCount = Object.values(categoryDrafts).reduce((total, items) => total + Object.keys(items).length, 0);
  const leaveGuard = useStudioUnsavedChanges(dirtyCount > 0);
  const draftOutdated = isPromptDraftOutdated(drafts[stage], preference);
  const discardCurrentDraft = () => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[stage];
      return next;
    });
    setFeedback(null);
    save.reset();
  };
  const rebaseCurrentDraft = () => {
    if (!preference) return;
    setDrafts((current) => {
      const existing = current[stage];
      return existing ? { ...current, [stage]: rebasePromptDraft(existing, preference) } : current;
    });
    setFeedback(null);
    save.reset();
  };
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
      aiLessonsService.savePromptPreference(item.stage, draft.value.trim(), draft.base.lockVersion, category),
    onSuccess: (saved, sent) => {
      client.setQueryData<AdminPromptPreference[]>(preferencesKey, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      setDrafts((current) => acknowledgePromptDraft(current, sent.draft, saved));
      setFeedback({
        severity: StudioFeedbackSeverity.SUCCESS,
        text: PROMPT_TEXTS.saved,
      });
    },
    onError: (error) => {
      if (getHttpStatus(error) === 409) {
        void client.invalidateQueries({ queryKey: preferencesKey });
      }
      setFeedback({
        severity: StudioFeedbackSeverity.ERROR,
        text:
          getHttpStatus(error) === 409
            ? 'Você alterou esta orientação em outra aba ou aparelho. O texto daqui foi preservado; escolha abaixo entre aplicá-lo sobre a versão atual ou descartá-lo.'
            : 'Não foi possível salvar. O texto que você digitou foi preservado.',
      });
    },
  });

  const reset = useMutation({
    mutationFn: ({ item, draft }: SavePromptVariables) =>
      aiLessonsService.resetPromptPreference(item.stage, draft.base.lockVersion, category),
    onSuccess: (saved, sent) => {
      client.setQueryData<AdminPromptPreference[]>(preferencesKey, (items = []) =>
        items.map((item) => (item.stage === saved.stage ? saved : item))
      );
      // Restoring the official prompt also drops any text typed and not saved for this stage.
      setDrafts((current) => {
        const next = { ...acknowledgePromptDraft(current, sent.draft, saved) };
        delete next[saved.stage];
        return next;
      });
      setResetOpen(false);
      setFeedback({
        severity: StudioFeedbackSeverity.SUCCESS,
        text: PROMPT_TEXTS.restored,
      });
    },
    onError: (error) => {
      setResetOpen(false);
      if (getHttpStatus(error) === 409) {
        void client.invalidateQueries({ queryKey: preferencesKey });
      }
      setFeedback({
        severity: StudioFeedbackSeverity.ERROR,
        text:
          getHttpStatus(error) === 409
            ? 'Você alterou esta orientação em outra aba ou aparelho antes de voltar ao padrão. O texto daqui foi preservado.'
            : 'Não foi possível voltar ao padrão oficial.',
      });
    },
  });

  const leave = () => leaveGuard.requestLeave(() => navigate(STUDIO_ROUTES.hub));

  const handleInsertPreset = (presetText: string) => {
    const separator = value && !value.endsWith('\n') && !presetText.startsWith('\n') ? '\n' : '';
    changePrompt(`${value}${separator}${presetText}`);
  };
  const saveCurrentPrompt = () => {
    const draft = drafts[stage];
    if (preference && draft && isValidComplementaryPrompt(draft.value)) {
      save.mutate({ item: preference, draft });
    }
  };
  const userName = useSelector((state: RootState) => state.auth.user?.name ?? '');
  const otherCategory =
    category === LessonCategory.REGULAR ? LessonCategory.SPECIAL : LessonCategory.REGULAR;
  // Só para o resumo no seletor: quantas etapas do outro material estão personalizadas.
  const otherQuery = useQuery({
    queryKey: aiLessonsKeys.preferencesByUser(userId, otherCategory),
    queryFn: ({ signal }) => aiLessonsService.getPromptPreferences(signal, otherCategory),
    staleTime: PROMPT_STALE_TIME_MS,
  });
  const summaries: Record<LessonCategory, { customised: number; total: number }> = {
    [category]: promptCustomisationSummary(query.data),
    [otherCategory]: promptCustomisationSummary(otherQuery.data),
  } as Record<LessonCategory, { customised: number; total: number }>;
  const busy = save.isPending || reset.isPending;
  const clearing = isClearingSavedPrompt(value, preference);
  const validationMessage = promptValidationMessage(value);
  const canSave = dirty && isPromptValid && !draftOutdated && !busy;
  const stageIcon = STAGE_CONFIG[stage].icon;
  const stageLabel = lessonStageLabel(stage, category);
  const savedLabel = preference?.customPrompt ? promptSavedLabel(preference.updatedAt) : '';

  // Ctrl+S (ou ⌘S) salva a etapa aberta, como em qualquer editor.
  const saveShortcut = useRef(() => {});
  saveShortcut.current = () => {
    if (canSave) saveCurrentPrompt();
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveShortcut.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const selectCategory = (next: LessonCategory) => {
    setCategory(next);
    setStage(LessonStageType.LESSON);
    setFeedback(null);
    setResetOpen(false);
  };

  return (
    <Box
      data-testid="admin-prompt-settings-page"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5 },
        pb: { xs: 12, sm: 4 },
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={leave}
        sx={{ mb: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none', minHeight: 44 }}
      >
        Voltar para o Estúdio Clubinho
      </Button>

      <Paper
        component="header"
        elevation={0}
        sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
              <Tune color="primary" />
              <Typography
                component="h1"
                fontWeight={800}
                color="text.primary"
                sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem' } }}
              >
                {PROMPT_TEXTS.title}
              </Typography>
            </Stack>
            <Typography color="text.secondary">{PROMPT_TEXTS.subtitle}</Typography>
          </Box>
          {dirtyCount > 0 && (
            <Chip
              data-testid="admin-prompts-pending-count"
              color="warning"
              label={`${dirtyCount} ${dirtyCount === 1 ? 'etapa com texto não salvo' : 'etapas com texto não salvo'}`}
              sx={{ fontWeight: 800, borderRadius: 2, flexShrink: 0 }}
            />
          )}
        </Stack>

        {/* O ponto que mais confunde: a personalização é de quem está logado, não do sistema. */}
        <Alert
          data-testid="admin-prompts-personal-notice"
          severity="info"
          icon={<PersonOutline />}
          sx={{ mt: 2, borderRadius: 2.5 }}
        >
          <AlertTitle sx={{ fontWeight: 800 }}>
            {PROMPT_TEXTS.personalTitle}
            {firstName(userName) ? `, ${firstName(userName)}` : ''}
          </AlertTitle>
          {PROMPT_TEXTS.personalBody}
        </Alert>
      </Paper>

      <ToggleButtonGroup
        data-testid="admin-prompts-category-selector"
        aria-label="Tipo de material das orientações"
        exclusive
        value={category}
        disabled={busy}
        onChange={(_, next: LessonCategory | null) => {
          if (next) selectCategory(next);
        }}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        {Object.values(LessonCategory).map((item) => (
          <ToggleButton
            key={item}
            value={item}
            data-testid={`admin-prompts-category-${item.toLowerCase()}`}
            sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700, gap: 1 }}
          >
            {LESSON_CATEGORY_LABELS[item]}
            {summaries[item]?.customised > 0 && (
              <Chip
                size="small"
                color="primary"
                label={summaries[item].customised}
                aria-label={promptSummaryLabel(summaries[item])}
                sx={{ height: 20, fontWeight: 800 }}
              />
            )}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {query.isLoading ? (
        <Box data-testid="admin-prompts-loading" aria-busy="true" aria-label="Carregando orientações">
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: 3, mb: 2 }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
        </Box>
      ) : query.isError ? (
        <Alert
          data-testid="admin-prompts-error"
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => void query.refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {PROMPT_TEXTS.loadError}
        </Alert>
      ) : (
        <Stack gap={2}>
          <Box>
            <PromptStageTabs
              category={category}
              stage={stage}
              preferences={query.data ?? []}
              drafts={drafts}
              onChange={(next) => {
                setStage(next);
                setFeedback(null);
              }}
            />
            <Typography
              data-testid="admin-prompts-summary"
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75, px: 0.5 }}
            >
              {promptSummaryLabel(summaries[category])}
            </Typography>
          </Box>

          {preference && (
            <Paper
              component="section"
              elevation={0}
              aria-labelledby="admin-prompts-stage-title"
              sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
                sx={{ mb: 2 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    id="admin-prompts-stage-title"
                    component="h2"
                    fontWeight={800}
                    color="text.primary"
                    sx={{ fontSize: { xs: '1.15rem', sm: '1.35rem' } }}
                  >
                    <span aria-hidden>{stageIcon} </span>
                    {stageLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lessonStageDescription(stage, category)}
                  </Typography>
                </Box>
                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75}>
                  <Chip
                    data-testid="admin-prompts-stage-status"
                    color={preference.customPrompt ? 'primary' : 'default'}
                    variant={preference.customPrompt ? 'filled' : 'outlined'}
                    label={preference.customPrompt ? PROMPT_TEXTS.custom : PROMPT_TEXTS.official}
                    sx={{ fontWeight: 800, borderRadius: 1.5 }}
                  />
                  {dirty && (
                    <Chip color="warning" label={PROMPT_TEXTS.pending} sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                  )}
                  {savedLabel && (
                    <Typography data-testid="admin-prompts-saved-at" variant="caption" color="text.secondary">
                      {savedLabel}
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <TextField
                data-testid={`admin-prompt-page-input-${stage}`}
                label={PROMPT_TEXTS.editorLabel}
                placeholder={PROMPT_STAGE_EXAMPLES[stage]}
                disabled={reset.isPending}
                value={value}
                onChange={(event) => changePrompt(event.target.value)}
                multiline
                minRows={8}
                maxRows={24}
                fullWidth
                error={Boolean(validationMessage)}
                helperText={
                  validationMessage ??
                  (clearing
                    ? 'Campo vazio: ao confirmar, esta etapa volta ao padrão oficial.'
                    : `${value.length}/${PROMPT_MAX_LENGTH} caracteres · ${PROMPT_TEXTS.saveShortcut}`)
                }
                slotProps={{
                  htmlInput: { maxLength: PROMPT_MAX_LENGTH },
                  inputLabel: { shrink: true },
                  input: { sx: { fontSize: '0.95rem', borderRadius: 3, lineHeight: 1.55 } },
                }}
              />

              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                  <LightbulbOutlined fontSize="small" color="primary" />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {PROMPT_TEXTS.presetsLabel}
                  </Typography>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {PROMPT_PRESETS.map((preset) => (
                    <Chip
                      key={preset.label}
                      icon={<AddIcon fontSize="small" />}
                      label={preset.label}
                      onClick={() => handleInsertPreset(preset.text)}
                      variant="outlined"
                      disabled={reset.isPending}
                      sx={{ fontWeight: 600, borderRadius: 2, minHeight: 36 }}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack gap={1.5} sx={{ mt: 2 }}>
                {hasBaseDuplication && (
                  <Alert
                    data-testid="admin-prompts-duplication-warning"
                    severity="warning"
                    sx={{ borderRadius: 2.5 }}
                    action={
                      <Button
                        data-testid="admin-prompts-strip-duplicated-base"
                        color="inherit"
                        size="small"
                        onClick={() => changePrompt(stripDuplicatedBasePrompt(value, preference.basePrompt))}
                        sx={{ fontWeight: 700, minHeight: 44 }}
                      >
                        Remover o trecho repetido
                      </Button>
                    }
                  >
                    Há trechos das regras oficiais dentro da sua orientação. Elas já são enviadas à IA:
                    deixe aqui só o que é seu, para não repetir nem estourar o limite.
                  </Alert>
                )}
                {recovered && (
                  <Alert
                    data-testid="admin-prompts-draft-recovered"
                    severity="info"
                    onClose={() => setRecovered(false)}
                    sx={{ borderRadius: 2.5 }}
                  >
                    Rascunho recuperado: o texto que você digitou e não salvou foi restaurado neste
                    navegador.
                  </Alert>
                )}
                {draftOutdated && (
                  <Alert
                    data-testid="admin-prompts-draft-outdated"
                    severity="warning"
                    sx={{ borderRadius: 2.5, '& .MuiAlert-message': { width: '100%' } }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Você alterou esta orientação em outra aba ou aparelho. O texto daqui foi
                      preservado, mas precisa de uma decisão para poder ser salvo.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button
                        data-testid="admin-prompts-draft-rebase"
                        color="inherit"
                        variant="outlined"
                        onClick={rebaseCurrentDraft}
                        sx={{ minHeight: 44, textTransform: 'none' }}
                      >
                        Aplicar meu texto sobre a versão atual
                      </Button>
                      <Button
                        data-testid="admin-prompts-draft-discard-outdated"
                        color="inherit"
                        onClick={discardCurrentDraft}
                        sx={{ minHeight: 44, textTransform: 'none' }}
                      >
                        Descartar meu texto e ver a versão atual
                      </Button>
                    </Stack>
                  </Alert>
                )}
                {feedback && (
                  <Alert data-testid="admin-prompts-feedback" severity={feedback.severity} sx={{ borderRadius: 2.5 }}>
                    {feedback.text}
                  </Alert>
                )}
              </Stack>

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                justifyContent="flex-end"
                gap={1.25}
                sx={{ mt: 2.5, mb: 3 }}
              >
                {dirty && (
                  <Button
                    data-testid="admin-prompts-discard-draft"
                    disabled={busy}
                    onClick={discardCurrentDraft}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600, textTransform: 'none' }}
                  >
                    {PROMPT_TEXTS.discard}
                  </Button>
                )}
                {!clearing && (
                  <Button
                    data-testid="admin-prompts-reset-open"
                    color="warning"
                    variant="outlined"
                    startIcon={<RestartAlt />}
                    disabled={!preference.customPrompt || busy}
                    onClick={() => setResetOpen(true)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600, textTransform: 'none' }}
                  >
                    {PROMPT_TEXTS.restore}
                  </Button>
                )}
                {clearing ? (
                  <Button
                    data-testid="admin-prompts-remove"
                    variant="contained"
                    color="warning"
                    startIcon={<RestartAlt />}
                    disabled={busy}
                    onClick={() => setResetOpen(true)}
                    sx={{ borderRadius: 2.5, minHeight: 44, px: 3, fontWeight: 700, textTransform: 'none' }}
                  >
                    {PROMPT_TEXTS.remove}
                  </Button>
                ) : (
                  <Button
                    data-testid="admin-prompts-save"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={!canSave}
                    onClick={saveCurrentPrompt}
                    sx={{ borderRadius: 2.5, minHeight: 44, px: 3, fontWeight: 700, textTransform: 'none' }}
                  >
                    {save.isPending ? PROMPT_TEXTS.saving : PROMPT_TEXTS.save}
                  </Button>
                )}
              </Stack>

              <Typography
                data-testid="admin-prompts-protected-note"
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                {PROMPT_TEXTS.protectedNote}
              </Typography>
              <PromptReference
                basePrompt={preference.basePrompt}
                effectivePreview={effectivePreview}
                resetKey={`${category}:${stage}`}
              />
            </Paper>
          )}
        </Stack>
      )}

      {/* No celular o botão de salvar acompanha a rolagem enquanto há texto não salvo. */}
      {preference && dirty && !clearing && (
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
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1100,
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Typography variant="caption" fontWeight={700} color="warning.main" textAlign="center">
            {validationMessage ?? PROMPT_TEXTS.pending}
          </Typography>
          <Button
            data-testid="admin-prompts-save-mobile"
            variant="contained"
            startIcon={<Save />}
            disabled={!canSave}
            onClick={saveCurrentPrompt}
            fullWidth
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
          >
            {save.isPending ? PROMPT_TEXTS.saving : PROMPT_TEXTS.save}
          </Button>
        </Paper>
      )}

      <PromptResetDialog
        open={resetOpen}
        stageLabel={stageLabel}
        hasUnsavedText={dirty && !clearing}
        pending={reset.isPending}
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          if (preference) {
            reset.mutate({ item: preference, draft: drafts[stage] ?? { base: preference, value } });
          }
        }}
      />
      <UnsavedChangesDialog {...leaveGuard.dialog} />
    </Box>
  );
};
