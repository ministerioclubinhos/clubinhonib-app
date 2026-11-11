import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  AutoAwesome,
  AutoStories,
  Check,
  DeleteOutline as DeleteIcon,
  EditNote,
  PictureAsPdf,
  RateReview,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '@/components/common/modal/ConfirmDialog';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import {
  useDeleteLessonDraft,
  useGenerateStage,
  useLessonDraft,
  useLessonDraftEvents,
  useResolveLessonComment,
  useStageAction,
  useUpdateDraftContent,
} from '@/hooks/api/useAiLessons';
import { LessonCommentsPanel } from '@/features/ai-lessons/components/LessonCommentsPanel';
import { LessonConnectionAlert } from '@/features/ai-lessons/components/LessonConnectionAlert';
import { LessonStageContentViewer } from '@/features/ai-lessons/components/LessonStageContentViewer';
import { StageImpactList } from '@/features/ai-lessons/components/StageImpactList';
import { StoryVisualConfiguration } from '@/features/ai-lessons/components/StoryVisualConfiguration';
import {
  EMPTY_STRUCTURED_DATA,
  EMPTY_TIPTAP_DOCUMENT,
  FINAL_REVIEW_LESSON_STATUSES,
  HTTP_STATUS_CONFLICT,
  LESSON_ERROR_CODES,
  PRODUCTION_COMPLETED_STATUSES,
  SIGNED_OFF_STAGE_STATUSES,
  STORY_VISUAL_MAX_QUANTITY,
} from '@/features/ai-lessons/constants';
import { isLessonDraftOutdated } from '@/features/ai-lessons/drafts';
import {
  LESSON_INSTRUCTIONS_MAX_LENGTH,
  LESSON_STAGE_STATUS_COLORS as STATUS_COLORS,
  LESSON_STAGE_STATUS_LABELS as STATUS_LABELS,
  LESSON_STATUS_PRESENTATION,
  MANUAL_SAVE_CHANGE_SUMMARY,
  STUDIO_ROUTES,
  VERSE_DEPENDENT_STAGES,
} from '@/features/ai-lessons/presentation.constants';
import {
  lessonStageDescription,
  lessonStageLabel,
  localizeLegacyDocumentLabels,
} from '@/features/ai-lessons/presentation.utils';
import {
  LessonCategory,
  LessonConnectionState,
  LessonStageAction,
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
  StageNavigationMode,
  StudioScreenKind,
  type LessonStage,
  type ProductionConfirmation,
  ProductionConfirmationKind,
} from '@/features/ai-lessons/types';
import { useElapsedSeconds } from '@/features/ai-lessons/useElapsedSeconds';
import { useLessonLocalDrafts } from '@/features/ai-lessons/useLessonLocalDrafts';
import { useLessonPdfPreview } from '@/features/ai-lessons/useLessonPdfPreview';
import { useStageParam } from '@/features/ai-lessons/useStageParam';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import {
  formatElapsedTime,
  formatLessonBadgeLabel,
  objectValue,
} from '@/features/ai-lessons/utils';
import {
  canDeleteLesson,
  lessonProductionActions,
  isReviewCycleActive,
  regenerationLockReason,
  stagesInvalidatedBy,
  staleOriginStage,
} from '@/features/ai-lessons/workflow';
import { getApiErrorCode, getErrorMessage, getHttpStatus } from '@/utils/apiError';
import { LessonDraftDialogs } from './components/LessonDraftDialogs';
import { LessonStageNavigation } from './components/LessonStageNavigation';

export const LessonDraftDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error, refetch } = useLessonDraft(id);
  const connection = useLessonDraftEvents(id);
  const generate = useGenerateStage();
  const save = useUpdateDraftContent();
  const complete = useStageAction(LessonStageAction.COMPLETE);
  const deleteMutation = useDeleteLessonDraft();
  const resolveComment = useResolveLessonComment();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedType, selectStage] = useStageParam();
  const [instructionsByStage, setInstructionsByStage] = useState<
    Partial<Record<LessonStageType, string>>
  >({});
  const [visualType, setVisualType] = useState<LessonVisualType | ''>('');
  const [visualOrientation, setVisualOrientation] = useState<LessonVisualOrientation | ''>('');
  const [visualQuantity, setVisualQuantity] = useState<number | ''>('');
  const [llmErrorOpen, setLlmErrorOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ProductionConfirmation | null>(null);
  const [remoteVersionOpen, setRemoteVersionOpen] = useState(false);
  const [layoutOverflow, setLayoutOverflow] = useState(false);
  // `isPending` only changes on the next render; this closes the same-frame double click.
  const submitting = useRef(false);

  const stage = useMemo(
    () => lesson?.stages.find((item) => item.type === selectedType),
    [lesson, selectedType]
  );
  const preview = useLessonPdfPreview(
    id,
    selectedType,
    stage?.lockVersion,
    stage?.currentVersionId
  );
  const { url: previewUrl, error: previewError, loading: previewLoading } = preview;
  const version = stage?.versions.find((item) => item.id === stage.currentVersionId);
  const local = useLessonLocalDrafts(id, stage, version);
  const edited = local.draft?.document;
  const leave = useStudioUnsavedChanges(local.hasDrafts || save.isPending);
  // Only the server copy needs the legacy relabeling; a local edit already went through it.
  const remoteDocument = useMemo(
    () => localizeLegacyDocumentLabels(version?.tiptapAstJson ?? EMPTY_TIPTAP_DOCUMENT),
    [version?.tiptapAstJson]
  );
  const document = edited ?? remoteDocument;
  const structuredData =
    local.draft?.structuredData ?? version?.structuredDataJson ?? EMPTY_STRUCTURED_DATA;
  const instructions = instructionsByStage[selectedType] ?? '';
  const setInstructions = (value: string) => {
    setInstructionsByStage((prev) => ({ ...prev, [selectedType]: value }));
  };
  const stageComments = useMemo(
    () => (lesson?.comments ?? []).filter((comment) => comment.sectionKey === selectedType),
    [lesson?.comments, selectedType]
  );
  const approvedLessonStage = lesson?.stages.find((item) => item.type === LessonStageType.LESSON);
  const approvedLessonVersion = approvedLessonStage?.versions.find(
    (item) => item.id === approvedLessonStage.currentVersionId
  );
  const mainVerse = objectValue(approvedLessonVersion?.structuredDataJson?.memoryVerse);
  const stageGenerating = generate.isPending || stage?.status === LessonStageStatus.GENERATING;
  const generationLocked =
    generate.isPending ||
    Boolean(lesson?.stages.some((item) => item.status === LessonStageStatus.GENERATING));
  const elapsedSeconds = useElapsedSeconds(generationLocked);

  useEffect(() => {
    setInstructionsByStage({});
  }, [id]);

  useEffect(() => {
    if (stage?.failureMessage) setLlmErrorOpen(true);
  }, [stage?.failureMessage]);

  useEffect(() => {
    setLayoutOverflow(false);
  }, [selectedType, id]);

  useEffect(() => {
    if (selectedType !== LessonStageType.LESSON_VISUALS) return;
    const config = objectValue(version?.structuredDataJson?.visualConfig);
    const isSpecialLesson = lesson?.category === LessonCategory.SPECIAL;
    setVisualType(
      !isSpecialLesson
        ? LessonVisualType.CUTOUT_KIT
        : Object.values(LessonVisualType).includes(config.type as LessonVisualType) &&
            config.type !== LessonVisualType.CUTOUT_KIT
          ? (config.type as LessonVisualType)
          : ''
    );
    setVisualOrientation(
      Object.values(LessonVisualOrientation).includes(config.orientation as LessonVisualOrientation)
        ? (config.orientation as LessonVisualOrientation)
        : ''
    );
    setVisualQuantity(
      typeof config.quantity === 'number' &&
        config.quantity >= 1 &&
        config.quantity <= STORY_VISUAL_MAX_QUANTITY
        ? config.quantity
        : ''
    );
    // The form follows the saved version, not every structured-data identity change.
  }, [selectedType, version?.id, lesson?.category]);

  const backToList = () => leave.requestLeave(() => navigate(STUDIO_ROUTES.production));

  if (isLoading) {
    return (
      <Box
        data-testid="ai-lessons-detail-loading"
        role="status"
        sx={{ display: 'grid', placeItems: 'center', py: 12 }}
      >
        <CircularProgress size={44} thickness={4} />
        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          Carregando detalhes da lição...
        </Typography>
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box
        data-testid="ai-lessons-detail-error"
        sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 3 }}
      >
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Não foi possível carregar os detalhes da lição.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={backToList} sx={{ mt: 2, minHeight: 44 }}>
          Voltar para lições
        </Button>
        <UnsavedChangesDialog {...leave.dialog} />
      </Box>
    );
  }

  const lessonGone = connection.state === LessonConnectionState.NOT_FOUND;
  const actions = lessonProductionActions(
    lesson,
    stage,
    local.hasDrafts,
    lessonGone ||
      save.isPending ||
      complete.isPending ||
      generate.isPending ||
      deleteMutation.isPending
  );
  // Typing may continue during save; later edits keep their own draft revision.
  const editorEditable = lessonProductionActions(
    lesson,
    stage,
    false,
    lessonGone || complete.isPending || generate.isPending || deleteMutation.isPending
  ).canEdit;
  const canGenerate = actions.canGenerate;
  const draftOutdated = isLessonDraftOutdated(local.draft, stage);
  const approvedCount = lesson.stages.filter(
    (item) => item.status === LessonStageStatus.APPROVED
  ).length;
  const packageCompletedCount = lesson.stages.filter((item) =>
    PRODUCTION_COMPLETED_STATUSES.includes(item.status)
  ).length;
  const isFinalReview = FINAL_REVIEW_LESSON_STATUSES.includes(lesson.status);
  const progressCount = isFinalReview ? approvedCount : packageCompletedCount;
  const progress = lesson.stages.length ? (progressCount / lesson.stages.length) * 100 : 0;
  const impactedStages = stage ? stagesInvalidatedBy(lesson, stage.type) : [];
  const reviewCycleActive = isReviewCycleActive(lesson);
  const regenerationLock = actions.regenerationLocked ? regenerationLockReason(stage) : null;
  const staleOrigin =
    stage?.status === LessonStageStatus.STALE ? staleOriginStage(lesson, stage) : null;
  const stageLabel = stage ? lessonStageLabel(stage.type, lesson.category) : '';
  const statusPresentation = LESSON_STATUS_PRESENTATION[lesson.status];

  const guarded = (run: (release: () => void) => void) => {
    if (submitting.current) return;
    submitting.current = true;
    run(() => {
      submitting.current = false;
    });
  };

  const completeStage = (target: LessonStage, acknowledgeStale = false) =>
    guarded((release) =>
      complete.mutate(
        { id, stage: target.type, lockVersion: target.lockVersion, acknowledgeStale },
        {
          onError: (err) => {
            // The API asks for an explicit decision before concluding an outdated item.
            if (getApiErrorCode(err) === LESSON_ERROR_CODES.staleUpstream) {
              complete.reset();
              setConfirmation({ kind: ProductionConfirmationKind.COMPLETE_OUTDATED });
              return;
            }
            if (getHttpStatus(err) === HTTP_STATUS_CONFLICT) void refetch();
          },
          onSettled: release,
        }
      )
    );

  const runGeneration = () => {
    if (!stage || !canGenerate) return;
    guarded((release) =>
      generate.mutate(
        {
          id,
          payload: {
            stage: stage.type,
            revisionInstructions: instructions || undefined,
            ...(stage.type === LessonStageType.LESSON_VISUALS
              ? {
                  visualType: visualType as LessonVisualType,
                  visualOrientation: visualOrientation as LessonVisualOrientation,
                  visualQuantity: Number(visualQuantity),
                }
              : {}),
          },
        },
        { onSettled: release }
      )
    );
  };

  const requestGeneration = () => {
    if (!stage || !canGenerate) return;
    // Replacing existing content is paid and may outdate what depends on it: always confirm.
    if (stage.currentVersionId) setConfirmation({ kind: ProductionConfirmationKind.REGENERATE });
    else runGeneration();
  };

  const openStagePreview = async () => {
    if (!stage || edited) return;
    await preview.open();
  };

  const runSave = () => {
    const sent = local.draft;
    if (!sent || !actions.canSave) return;
    guarded((release) =>
      save.mutate(
        {
          id: sent.lessonId,
          payload: {
            stage: sent.stage,
            lockVersion: sent.lockVersion,
            tiptapAstJson: sent.document,
            structuredDataJson: sent.structuredData ?? undefined,
            changeSummary: MANUAL_SAVE_CHANGE_SUMMARY,
          },
        },
        {
          onSuccess: (saved) => {
            const savedStage = saved.stages.find((item) => item.type === sent.stage);
            if (savedStage) local.acknowledge(sent, savedStage);
          },
          onSettled: release,
        }
      )
    );
  };

  const requestSave = () => {
    if (!local.draft || !actions.canSave) return;
    if (impactedStages.length) setConfirmation({ kind: ProductionConfirmationKind.SAVE });
    else runSave();
  };

  const confirmDelete = () =>
    guarded((release) =>
      deleteMutation.mutate(id, {
        onSuccess: () => navigate(STUDIO_ROUTES.production),
        onSettled: release,
      })
    );

  const confirmCurrent = () => {
    const kind = confirmation?.kind;
    setConfirmation(null);
    if (kind === ProductionConfirmationKind.SAVE) runSave();
    if (kind === ProductionConfirmationKind.REGENERATE) runGeneration();
    if (kind === ProductionConfirmationKind.COMPLETE_OUTDATED && stage) completeStage(stage, true);
    if (kind === ProductionConfirmationKind.DISCARD) {
      local.discard();
      save.reset();
    }
    if (kind === ProductionConfirmationKind.REBASE) {
      local.rebase();
      save.reset();
    }
  };

  const completeBlockedReason = layoutOverflow
    ? 'O conteúdo ultrapassa a folha de impressão. Reduza o texto antes de concluir o item.'
    : local.hasDrafts
      ? 'Salve ou descarte as edições pendentes antes de concluir.'
      : null;

  return (
    <Box
      data-testid="ai-lessons-detail"
      aria-busy={generationLocked}
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
      }}
    >
      <Button
        data-testid="ai-lesson-back-to-production"
        startIcon={<ArrowBack />}
        onClick={backToList}
        sx={{ mb: 2, minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para Produção de Lições
      </Button>

      <LessonConnectionAlert
        state={connection.state}
        screen={StudioScreenKind.PRODUCTION}
        onBackToList={() => navigate(STUDIO_ROUTES.production)}
      />
      {local.recovered && (
        <Alert
          data-testid="ai-lesson-draft-recovered"
          severity="info"
          onClose={local.dismissRecovered}
          sx={{ mb: 2 }}
        >
          Rascunho recuperado: suas edições não salvas desta lição foram restauradas neste
          navegador. Revise e salve para não perdê-las.
        </Alert>
      )}
      {local.hasDrafts && (
        <Alert data-testid="ai-lesson-unsaved-notice" severity="warning" sx={{ mb: 2 }}>
          Há edições não salvas. Você pode alternar as etapas; salve ou descarte as edições antes de
          concluir ou gerar conteúdo.
        </Alert>
      )}
      {draftOutdated && (
        <Alert
          data-testid="ai-lesson-draft-outdated"
          severity="error"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            Esta etapa recebeu uma versão mais nova em outra sessão enquanto você editava. Sua edição
            foi preservada, mas não pode ser salva sobre a versão antiga.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              data-testid="ai-lesson-draft-view-remote"
              color="inherit"
              variant="outlined"
              onClick={() => setRemoteVersionOpen(true)}
              sx={{ minHeight: 44 }}
            >
              Ver versão remota
            </Button>
            <Button
              data-testid="ai-lesson-draft-rebase"
              color="inherit"
              variant="outlined"
              disabled={save.isPending}
              onClick={() => setConfirmation({ kind: ProductionConfirmationKind.REBASE })}
              sx={{ minHeight: 44 }}
            >
              Reaplicar minha edição sobre a versão atual
            </Button>
          </Stack>
        </Alert>
      )}
      {save.isError && !draftOutdated && (
        <Alert data-testid="ai-lesson-save-error" severity="error" sx={{ mb: 2 }}>
          {getHttpStatus(save.error) === HTTP_STATUS_CONFLICT
            ? 'Esta etapa foi alterada em outra sessão. Sua edição foi preservada; aguarde a versão atual carregar para compará-la ou reaplicar sua edição.'
            : getErrorMessage(
                save.error,
                'Não foi possível salvar. Sua edição foi preservada; tente novamente.'
              )}
        </Alert>
      )}
      {complete.isError && (
        <Alert data-testid="ai-lesson-complete-error" severity="error" sx={{ mb: 2 }}>
          {getHttpStatus(complete.error) === HTTP_STATUS_CONFLICT
            ? 'Esta etapa foi atualizada em outra sessão. A versão mais recente foi recarregada; revise o conteúdo antes de concluir o item.'
            : getErrorMessage(
                complete.error,
                'Não foi possível concluir o item para o pacote. Verifique se o conteúdo e as ilustrações estão prontos e tente novamente.'
              )}
        </Alert>
      )}

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
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={2.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              sx={{ gap: 1, mb: 1 }}
            >
              <Chip
                label={formatLessonBadgeLabel(lesson)}
                size="small"
                color={lesson.category === LessonCategory.SPECIAL ? 'secondary' : 'primary'}
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
              <Typography
                variant="h4"
                component="h1"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' },
                  color: 'text.primary',
                  overflowWrap: 'anywhere',
                }}
              >
                {lesson.theme}
              </Typography>
              <Chip
                data-testid="ai-lesson-status-chip"
                label={statusPresentation.label}
                color={statusPresentation.color}
                sx={{ fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              fontWeight={600}
              sx={{ overflowWrap: 'anywhere', mb: 1 }}
            >
              {lesson.biblicalReference}
            </Typography>

            {lesson.category === LessonCategory.SPECIAL && lesson.specialContext && (
              <Typography
                data-testid="ai-lesson-special-context"
                variant="body2"
                color="text.secondary"
                sx={{ overflowWrap: 'anywhere', mb: 1, fontStyle: 'italic' }}
              >
                Ideia da história: {lesson.specialContext}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Criada em {new Date(lesson.createdAt).toLocaleString('pt-BR')} · Atualizada em{' '}
              {new Date(lesson.updatedAt).toLocaleString('pt-BR')}
            </Typography>

            <Box sx={{ mt: 2, maxWidth: 650 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Progresso geral da lição
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {progressCount}/{lesson.stages.length} ({Math.round(progress)}%){' '}
                  {isFinalReview ? 'aprovados' : 'itens concluídos'}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                aria-label="Progresso geral da lição"
                sx={{
                  height: 9,
                  borderRadius: 4.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4.5,
                    bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button
              data-testid="ai-lesson-go-to-review"
              startIcon={<RateReview />}
              variant="contained"
              onClick={() =>
                leave.requestLeave(() => navigate(`${STUDIO_ROUTES.review}/${id}`))
              }
              sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 700 }}
            >
              Ir para Revisão e Aprovação
            </Button>

            {canDeleteLesson(lesson) && (
              <Button
                data-testid="ai-lesson-delete-button"
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                disabled={
                  generationLocked || local.hasDrafts || save.isPending || complete.isPending
                }
                onClick={() => {
                  deleteMutation.reset();
                  setDeleteConfirmOpen(true);
                }}
                sx={{ borderRadius: 2.5, minHeight: 48, fontWeight: 600 }}
              >
                Excluir lição
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <LessonStageNavigation
        category={lesson.category}
        stages={lesson.stages}
        selectedType={selectedType}
        draftStages={local.draftStages}
        mode={StageNavigationMode.MOBILE}
        onSelect={(type) => {
          complete.reset();
          selectStage(type);
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '320px minmax(0, 1fr)' },
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        <LessonStageNavigation
          category={lesson.category}
          stages={lesson.stages}
          selectedType={selectedType}
          draftStages={local.draftStages}
          mode={StageNavigationMode.DESKTOP}
          onSelect={(type) => {
            complete.reset();
            selectStage(type);
          }}
        />

        <Box>
          {!stage ? (
            <Alert data-testid="ai-lesson-stage-missing" severity="error" sx={{ borderRadius: 3 }}>
              Esta etapa não faz parte deste pacote. Selecione outra etapa no fluxo da produção.
            </Alert>
          ) : (
            <Card
              data-testid={`ai-stage-${stage.type}`}
              elevation={0}
              sx={{
                minWidth: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={1.5}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      component="h2"
                      fontWeight={800}
                      sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                      {stageLabel}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {lessonStageDescription(stage.type, lesson.category)}
                    </Typography>
                  </Box>

                  <Chip
                    data-testid="ai-lesson-stage-status-chip"
                    label={STATUS_LABELS[stage.status]}
                    color={STATUS_COLORS[stage.status]}
                    sx={{ fontWeight: 800, px: 1, borderRadius: 2 }}
                  />
                </Stack>

                {VERSE_DEPENDENT_STAGES.includes(stage.type) && mainVerse.text ? (
                  <Alert
                    severity="success"
                    icon={<AutoStories />}
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    <strong>{String(mainVerse.reference)} — NVI:</strong> “{String(mainVerse.text)}”
                  </Alert>
                ) : null}

                {(stage.status === LessonStageStatus.CHANGES_REQUESTED ||
                  stage.status === LessonStageStatus.STALE) && (
                  <Alert
                    data-testid="ai-lesson-stage-correction-guidance"
                    severity="warning"
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    {stage.status === LessonStageStatus.CHANGES_REQUESTED
                      ? 'Esta etapa recebeu solicitação de ajustes na revisão. Revise as observações abaixo, edite ou regenere o conteúdo e conclua o item novamente.'
                      : `Esta etapa ficou desatualizada após alterações em ${
                          staleOrigin
                            ? `“${lessonStageLabel(staleOrigin, lesson.category)}”`
                            : 'uma etapa anterior do fluxo'
                        }. Regenere ou revise o conteúdo e conclua o item novamente.`}
                  </Alert>
                )}

                <LessonCommentsPanel
                  data-testid="ai-lesson-stage-comments"
                  title="Observações da Revisão"
                  comments={stageComments}
                  onResolve={(commentId) => resolveComment.mutate({ id, commentId })}
                  resolvingId={
                    resolveComment.isPending ? (resolveComment.variables?.commentId ?? null) : null
                  }
                />

                {stageGenerating && (
                  <Alert
                    data-testid="ai-lesson-stage-generating"
                    severity="info"
                    role="status"
                    icon={<CircularProgress size={20} />}
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    Gerando o conteúdo com IA há {formatElapsedTime(elapsedSeconds)}. Itens com
                    imagens podem levar alguns minutos; você pode navegar pelas outras etapas e esta
                    tela será atualizada automaticamente.
                  </Alert>
                )}
                {generationLocked && !stageGenerating && (
                  <Alert
                    data-testid="ai-lesson-other-stage-generating"
                    severity="info"
                    sx={{ mb: 2, borderRadius: 2.5 }}
                  >
                    Outra etapa desta lição está sendo gerada há {formatElapsedTime(elapsedSeconds)}.
                    Edição, geração e conclusão ficam bloqueadas até ela terminar; a leitura continua
                    liberada.
                  </Alert>
                )}

                {!actions.dependencyReady && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2.5 }}>
                    Conclua a etapa anterior do fluxo antes de gerar esta.
                  </Alert>
                )}

                {stage.type !== LessonStageType.LESSON_VISUALS && (
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      label="Orientações e instruções para a IA (geração ou ajuste)"
                      placeholder="Ex: Enfatize o amor de Deus, mantenha linguagem acessível para crianças de 6 anos..."
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                      slotProps={{
                        htmlInput: {
                          maxLength: LESSON_INSTRUCTIONS_MAX_LENGTH,
                          'data-testid': 'ai-lesson-generation-instructions',
                        },
                      }}
                      helperText={`${instructions.length}/${LESSON_INSTRUCTIONS_MAX_LENGTH} caracteres`}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                    />
                  </Box>
                )}

                {stage.type === LessonStageType.LESSON_VISUALS && (
                  <StoryVisualConfiguration
                    visualType={visualType}
                    isSpecial={lesson.category === LessonCategory.SPECIAL}
                    visualOrientation={visualOrientation}
                    visualQuantity={visualQuantity}
                    instructions={instructions}
                    hasVersion={Boolean(stage.currentVersionId)}
                    isGenerating={stageGenerating}
                    canGenerate={canGenerate}
                    onVisualTypeChange={setVisualType}
                    onVisualOrientationChange={setVisualOrientation}
                    onVisualQuantityChange={setVisualQuantity}
                    onInstructionsChange={setInstructions}
                    onGenerate={runGeneration}
                  />
                )}

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: completeBlockedReason || regenerationLock ? 1 : 3 }}
                >
                  {stage.type !== LessonStageType.LESSON_VISUALS && (
                    <Button
                      data-testid="ai-lesson-generate-stage-button"
                      startIcon={<AutoAwesome />}
                      variant="contained"
                      disabled={!canGenerate || stageGenerating}
                      onClick={requestGeneration}
                      sx={{ borderRadius: 2.5, px: 2.5, minHeight: 44, fontWeight: 700 }}
                    >
                      {stageGenerating
                        ? 'Gerando com IA…'
                        : stage.currentVersionId
                          ? 'Regenerar com IA'
                          : 'Gerar com IA'}
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<EditNote />}
                    data-testid="ai-lesson-save-edit"
                    disabled={!edited || !actions.canSave || draftOutdated}
                    onClick={requestSave}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    {save.isPending ? 'Salvando…' : 'Salvar edição'}
                  </Button>

                  <Button
                    data-testid="ai-lesson-stage-pdf-preview"
                    variant="outlined"
                    color="secondary"
                    startIcon={previewLoading ? <CircularProgress size={18} /> : <PictureAsPdf />}
                    disabled={!stage.currentVersionId || Boolean(edited) || previewLoading}
                    onClick={() => void openStagePreview()}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 600 }}
                  >
                    {edited ? 'Salve para visualizar' : 'Visualizar PDF do item'}
                  </Button>

                  <Button
                    startIcon={<Check />}
                    color="primary"
                    variant="contained"
                    data-testid="ai-lesson-complete-stage"
                    disabled={!actions.canComplete || layoutOverflow}
                    onClick={() => completeStage(stage)}
                    sx={{ borderRadius: 2.5, minHeight: 44, fontWeight: 700 }}
                  >
                    {complete.isPending ? 'Concluindo…' : 'Concluir item para o pacote'}
                  </Button>
                </Stack>
                {regenerationLock && (
                  <Typography
                    data-testid="ai-lesson-regeneration-locked-reason"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: completeBlockedReason ? 1 : 3 }}
                  >
                    {regenerationLock}
                  </Typography>
                )}
                {completeBlockedReason && (
                  <Typography
                    data-testid="ai-lesson-complete-blocked-reason"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 3 }}
                  >
                    {completeBlockedReason}
                  </Typography>
                )}

                {edited && (
                  <Button
                    data-testid="ai-lesson-discard-edit"
                    disabled={save.isPending}
                    sx={{ minHeight: 44, mb: 2 }}
                    onClick={() => setConfirmation({ kind: ProductionConfirmationKind.DISCARD })}
                  >
                    Descartar edição desta etapa
                  </Button>
                )}
                <Divider sx={{ mb: 3 }} />

                <LessonStageContentViewer
                  stage={stage}
                  version={version}
                  document={document}
                  structuredData={structuredData}
                  visualOrientation={visualOrientation}
                  editable={editorEditable}
                  onChangeDocument={local.edit}
                  onOpenPdfPreview={() => void openStagePreview()}
                  pdfPreviewLoading={previewLoading}
                  pdfPreviewDisabled={!stage.currentVersionId || Boolean(edited)}
                  pdfPreviewLabel={edited ? 'Salve para visualizar' : undefined}
                  onLayoutOverflowChange={setLayoutOverflow}
                />
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <LessonDraftDialogs
        lesson={lesson}
        stage={stage}
        canGenerate={canGenerate}
        generationLocked={generationLocked}
        llmErrorOpen={llmErrorOpen}
        previewUrl={previewUrl}
        previewError={previewError}
        previewLoading={previewLoading}
        deleteConfirmOpen={deleteConfirmOpen}
        deletePending={deleteMutation.isPending}
        deleteError={
          deleteMutation.isError
            ? getErrorMessage(deleteMutation.error, 'Não foi possível excluir a lição.')
            : null
        }
        onCloseLlmError={() => setLlmErrorOpen(false)}
        onRetryGeneration={() => {
          setLlmErrorOpen(false);
          runGeneration();
        }}
        onClosePreview={preview.close}
        onCloseDelete={() => setDeleteConfirmOpen(false)}
        onConfirmDelete={confirmDelete}
      />

      <ConfirmDialog
        data-testid="ai-lesson-production-confirm-dialog"
        open={Boolean(confirmation)}
        maxWidth="sm"
        title={
          confirmation?.kind === ProductionConfirmationKind.COMPLETE_OUTDATED
            ? 'Concluir este item sem gerar novamente?'
            : confirmation?.kind === ProductionConfirmationKind.SAVE
            ? 'Salvar e desatualizar os itens seguintes?'
            : confirmation?.kind === ProductionConfirmationKind.REGENERATE
              ? `Regenerar “${stageLabel}” com IA?`
              : confirmation?.kind === ProductionConfirmationKind.REBASE
                ? 'Reaplicar sua edição sobre a versão atual?'
                : 'Descartar a edição desta etapa?'
        }
        confirmText={
          confirmation?.kind === ProductionConfirmationKind.COMPLETE_OUTDATED
            ? 'Continua válido, concluir'
            : confirmation?.kind === ProductionConfirmationKind.SAVE
            ? 'Salvar mesmo assim'
            : confirmation?.kind === ProductionConfirmationKind.REGENERATE
              ? 'Regenerar'
              : confirmation?.kind === ProductionConfirmationKind.REBASE
                ? 'Reaplicar minha edição'
                : 'Descartar edição'
        }
        confirmColor={
          confirmation?.kind === ProductionConfirmationKind.DISCARD ? 'error' : 'primary'
        }
        onConfirm={confirmCurrent}
        onClose={() => setConfirmation(null)}
        autoCloseOnConfirm={false}
      >
        {confirmation?.kind === ProductionConfirmationKind.SAVE && (
          <>
            <Typography variant="body2">
              Salvar esta edição marca como desatualizados os itens abaixo, que dependem dela. Eles
              perdem a conclusão e precisarão ser revistos e concluídos novamente. Itens aprovados
              ou em revisão não são alterados:
            </Typography>
            <StageImpactList stages={impactedStages} category={lesson.category} />
          </>
        )}
        {confirmation?.kind === ProductionConfirmationKind.REGENERATE && stage && (
          <>
            {SIGNED_OFF_STAGE_STATUSES.includes(stage.status) && (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                Este item já foi concluído. Regenerar descarta essa conclusão.
              </Alert>
            )}
            <Typography variant="body2">
              A IA criará uma nova versão que substitui o conteúdo atual deste item. A versão
              anterior fica apenas no histórico e a geração consome créditos do provedor.
            </Typography>
            {impactedStages.length > 0 && (
              <>
                <Typography variant="body2" sx={{ mt: 1.5 }}>
                  Os itens abaixo também ficarão desatualizados:
                </Typography>
                <StageImpactList stages={impactedStages} category={lesson.category} />
              </>
            )}
            {impactedStages.length === 0 && (
              <Typography
                data-testid="ai-lesson-regenerate-no-impact"
                variant="body2"
                sx={{ mt: 1.5 }}
              >
                {reviewCycleActive
                  ? 'O pacote está em revisão: os demais itens não serão alterados e os aprovados continuam aprovados.'
                  : 'Os demais itens não serão alterados.'}
              </Typography>
            )}
          </>
        )}
        {confirmation?.kind === ProductionConfirmationKind.COMPLETE_OUTDATED && (
          <Typography variant="body2">
            Este item foi produzido a partir de uma versão anterior
            {staleOrigin ? ` de “${lessonStageLabel(staleOrigin, lesson.category)}”` : ' dos itens anteriores'}
            , que mudou depois. Confirme apenas se você conferiu que o conteúdo continua correto
            (por exemplo, o versículo e a história); caso contrário, gere o item novamente ou
            edite-o.
          </Typography>
        )}
        {confirmation?.kind === ProductionConfirmationKind.REBASE && (
          <Typography variant="body2">
            Seu texto passa a substituir a versão que está no servidor quando você salvar. As
            alterações feitas na outra sessão que você não incorporou serão sobrescritas. Use “Ver
            versão remota” antes, se quiser comparar.
          </Typography>
        )}
        {confirmation?.kind === ProductionConfirmationKind.DISCARD && (
          <Typography variant="body2">
            A edição local desta etapa será apagada e a versão atual do servidor será carregada.
          </Typography>
        )}
      </ConfirmDialog>

      <Dialog
        data-testid="ai-lesson-remote-version-dialog"
        open={remoteVersionOpen && Boolean(stage)}
        onClose={() => setRemoteVersionOpen(false)}
        aria-labelledby="ai-lesson-remote-version-title"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle id="ai-lesson-remote-version-title" sx={{ fontWeight: 800 }}>
          Versão atual no servidor — {stageLabel}
        </DialogTitle>
        <DialogContent dividers>
          {stage && (
            <LessonStageContentViewer
              stage={stage}
              version={version}
              document={remoteDocument}
              structuredData={version?.structuredDataJson ?? EMPTY_STRUCTURED_DATA}
              editable={false}
              readOnly
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            data-testid="ai-lesson-remote-version-close"
            onClick={() => setRemoteVersionOpen(false)}
            sx={{ minHeight: 44 }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <UnsavedChangesDialog {...leave.dialog} />
    </Box>
  );
};
