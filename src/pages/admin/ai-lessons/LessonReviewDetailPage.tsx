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
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle as ApproveIcon,
  Download as DownloadIcon,
  EventNoteOutlined as WeekIcon,
  PictureAsPdf,
  RateReview as ChangesIcon,
  Send as PublishIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '@/components/common/modal/ConfirmDialog';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import {
  useLessonArchive,
  useLessonDraft,
  useLessonDraftEvents,
  useLessonPublicationPreview,
  usePublishLesson,
  useSetLessonMaterialCurrentWeek,
  useStageAction,
  useSubmitLessonPackage,
} from '@/hooks/api/useAiLessons';
import { LessonCommentsPanel } from '@/features/ai-lessons/components/LessonCommentsPanel';
import { LessonConnectionAlert } from '@/features/ai-lessons/components/LessonConnectionAlert';
import { LessonPdfPreviewDialog } from '@/features/ai-lessons/components/LessonPdfPreviewDialog';
import { LessonPublishConfirmDialog } from '@/features/ai-lessons/components/LessonPublishConfirmDialog';
import { LessonPublishedPanel } from '@/features/ai-lessons/components/LessonPublishedPanel';
import { LessonStageContentViewer } from '@/features/ai-lessons/components/LessonStageContentViewer';
import {
  EMPTY_STRUCTURED_DATA,
  EMPTY_TIPTAP_DOCUMENT,
  HTTP_STATUS_CONFLICT,
  LESSON_ACTION_NOTE_MAX_LENGTH,
  getStudioStageOrder,
} from '@/features/ai-lessons/constants';
import {
  LESSON_STAGE_STATUS_COLORS,
  REVIEW_TAB_STATUS_LABELS,
  STUDIO_ROUTES,
} from '@/features/ai-lessons/presentation.constants';
import {
  lessonStageLabel,
  localizeLegacyDocumentLabels,
} from '@/features/ai-lessons/presentation.utils';
import {
  canDownloadLessonPackage,
  canPublishOrRepublishLesson,
  canRepublishLesson,
  canSetMaterialAsCurrentWeek,
  isPublishedMaterialMissing,
  isStagePdfFailure,
  lessonPackageFileName,
  publicationFailureNotice,
  publicationKindLabel,
} from '@/features/ai-lessons/publication';
import { lessonReviewActions } from '@/features/ai-lessons/review-actions';
import {
  LessonArchiveAction,
  LessonCategory,
  LessonConnectionState,
  LessonStageAction,
  LessonStageStatus,
  LessonStatus,
  StageAssetIssue,
  StudioFeedbackSeverity,
  StudioScreenKind,
  type StudioFeedback,
} from '@/features/ai-lessons/types';
import { useAcknowledgedVersions } from '@/features/ai-lessons/useAcknowledgedVersions';
import { useLessonPackageDownload } from '@/features/ai-lessons/useLessonPackageDownload';
import { useLessonPdfPreview } from '@/features/ai-lessons/useLessonPdfPreview';
import { useReviewFeedback } from '@/features/ai-lessons/useReviewFeedback';
import { useStageAssetIssue } from '@/features/ai-lessons/useStageAssetIssue';
import { useStageParam } from '@/features/ai-lessons/useStageParam';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { formatLessonBadgeLabel } from '@/features/ai-lessons/utils';
import {
  canPublishLesson,
  canReopenStage,
  nextPendingReviewStage,
  reviewBlockReason,
  staleOriginStage,
} from '@/features/ai-lessons/workflow';
import type { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { getErrorMessage, getHttpStatus } from '@/utils/apiError';

export const LessonReviewDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: lesson, isLoading, error, refetch } = useLessonDraft(id);
  const isSpecial = lesson?.category === LessonCategory.SPECIAL;
  const connection = useLessonDraftEvents(id);
  const approve = useStageAction(LessonStageAction.APPROVE);
  const changes = useStageAction(LessonStageAction.CHANGES);
  const reopen = useStageAction(LessonStageAction.REOPEN);
  const archive = useLessonArchive(LessonArchiveAction.ARCHIVE);
  const unarchive = useLessonArchive(LessonArchiveAction.UNARCHIVE);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const publishMutation = usePublishLesson();
  const submitReview = useSubmitLessonPackage();

  const [selectedType, selectStage] = useStageParam();
  const notes = useReviewFeedback(id);
  const acknowledged = useAcknowledgedVersions(lesson);
  const [notice, setNotice] = useState<StudioFeedback | null>(null);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [currentWeekConfirmOpen, setCurrentWeekConfirmOpen] = useState(false);
  const publishCallToAction = useRef<HTMLButtonElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  // The preview is only needed for the publish dialog and for the published state.
  const publication = useLessonPublicationPreview(
    id,
    lesson?.status,
    publishConfirmOpen || lesson?.status === LessonStatus.PUBLISHED
  );
  const setCurrentWeek = useSetLessonMaterialCurrentWeek(id, () => dispatch(fetchRoutes()));
  const packageDownload = useLessonPackageDownload(
    id,
    lesson ? lessonPackageFileName(lesson) : ''
  );
  // `isPending` only changes on the next render; this closes the same-frame double click.
  const submitting = useRef(false);

  useEffect(() => {
    setNotice(null);
  }, [id]);

  const stage = useMemo(
    () => lesson?.stages.find((s) => s.type === selectedType),
    [lesson, selectedType]
  );
  const currentVersion =
    stage?.versions.find((version) => version.id === stage.currentVersionId) ?? null;
  const preview = useLessonPdfPreview(
    id,
    selectedType,
    stage?.lockVersion,
    stage?.currentVersionId
  );
  const leave = useStudioUnsavedChanges(notes.hasUnsent);
  const document = useMemo(
    () => localizeLegacyDocumentLabels(currentVersion?.tiptapAstJson ?? EMPTY_TIPTAP_DOCUMENT),
    [currentVersion?.tiptapAstJson]
  );
  // The same value feeds the viewer notice and the approval gate.
  const structuredData = currentVersion?.structuredDataJson ?? EMPTY_STRUCTURED_DATA;
  const assetIssue = useStageAssetIssue(stage?.type, structuredData) ?? StageAssetIssue.NONE;

  const backToList = () => leave.requestLeave(() => navigate(STUDIO_ROUTES.review));

  if (isLoading) {
    return (
      <Box
        data-testid="ai-lesson-review-loading"
        role="status"
        sx={{ display: 'flex', justifyContent: 'center', py: 10 }}
      >
        <CircularProgress aria-label="Carregando a lição para revisão" />
      </Box>
    );
  }

  if (error || !lesson) {
    return (
      <Box
        data-testid="ai-lesson-review-error"
        sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: 4 }}
      >
        <Alert severity="error">Não foi possível carregar a lição para revisão.</Alert>
        <Button startIcon={<ArrowBack />} onClick={backToList} sx={{ mt: 2, minHeight: 44 }}>
          Voltar para Revisão
        </Button>
        <UnsavedChangesDialog {...leave.dialog} />
      </Box>
    );
  }

  const stageOrder = getStudioStageOrder(lesson.category);
  const approvedCount = lesson.stages.filter((s) => s.status === LessonStageStatus.APPROVED).length;
  const totalStages = lesson.stages.length || stageOrder.length;
  const allApproved = approvedCount === totalStages;
  const progress = (approvedCount / totalStages) * 100;
  const lessonGone = connection.state === LessonConnectionState.NOT_FOUND;
  const generating = lesson.stages.some((item) => item.status === LessonStageStatus.GENERATING);
  const remoteBusy = lessonGone || lesson.status === LessonStatus.PUBLISHING || generating;
  const versionChanged = acknowledged.hasChanged(stage);
  const hasVersion = Boolean(stage?.currentVersionId);

  const reviewActions = lessonReviewActions(lesson.status, stage?.status, hasVersion, {
    busy: remoteBusy,
    assetsComplete: assetIssue === StageAssetIssue.NONE,
  });
  const canApprove = reviewActions.canReviewItem && !versionChanged;
  // Missing or broken art is exactly what the reviewer must be able to send back.
  const canRequestChanges =
    lessonReviewActions(lesson.status, stage?.status, hasVersion, { busy: remoteBusy })
      .canReviewItem && !versionChanged;
  const blockReason = reviewBlockReason({
    lessonStatus: lesson.status,
    stageStatus: stage?.status,
    hasVersion,
    busy: generating,
    assetIssue,
    versionChanged,
  });
  const actionsPending =
    remoteBusy ||
    approve.isPending ||
    changes.isPending ||
    reopen.isPending ||
    archive.isPending ||
    unarchive.isPending ||
    submitReview.isPending ||
    publishMutation.isPending;
  const archived = lesson.status === LessonStatus.ARCHIVED;
  const reopenAllowed = canReopenStage(lesson.status, stage, remoteBusy) && !versionChanged;
  const currentFeedback = notes.feedback[selectedType] ?? '';
  const stageComments =
    lesson.comments?.filter((comment) => comment.sectionKey === selectedType) ?? [];
  const stageLabel = lessonStageLabel(selectedType, lesson.category);
  const published = lesson.status === LessonStatus.PUBLISHED;
  const publicationPreview = publication.data;
  const previewLoading = publication.isLoading;
  const materialMissing = isPublishedMaterialMissing(lesson, publicationPreview);
  const republish = canRepublishLesson(lesson, publicationPreview);
  const canPublishNow = canPublishOrRepublishLesson(lesson, publicationPreview);
  const publishFailed =
    publishMutation.isError &&
    (lesson.status === LessonStatus.READY_FOR_PUBLICATION || materialMissing);
  const kindLabel = publicationKindLabel(isSpecial);
  const approvePdfFailed =
    approve.isError &&
    approve.variables?.stage === selectedType &&
    isStagePdfFailure(approve.error);
  // Informative only: approved items are no longer invalidated by an earlier correction.
  const newerUpstream =
    stage && !published && !archived ? staleOriginStage(lesson, stage) : null;

  const guarded = (run: (release: () => void) => void) => {
    if (submitting.current) return;
    submitting.current = true;
    run(() => {
      submitting.current = false;
    });
  };
  const onConflict = (err: unknown) => {
    if (getHttpStatus(err) === HTTP_STATUS_CONFLICT) void refetch();
  };

  const handleApproveStage = () => {
    if (!stage || !canApprove || actionsPending) return;
    guarded((release) =>
      approve.mutate(
        { id, stage: stage.type, lockVersion: stage.lockVersion },
        {
          onSuccess: (updated) => {
            const next = nextPendingReviewStage(updated, stage.type);
            if (next) {
              selectStage(next);
              setNotice({
                severity: StudioFeedbackSeverity.SUCCESS,
                text: `“${stageLabel}” aprovado. Próximo item aguardando decisão: “${lessonStageLabel(next, updated.category)}”.`,
              });
              return;
            }
            const everyApproved = updated.stages.every(
              (item) => item.status === LessonStageStatus.APPROVED
            );
            setNotice({
              severity: StudioFeedbackSeverity.SUCCESS,
              text: everyApproved
                ? `“${stageLabel}” aprovado. Todos os itens estão aprovados: o pacote está pronto para publicar.`
                : `“${stageLabel}” aprovado. Não há outro item aguardando decisão no momento.`,
            });
            if (everyApproved)
              window.requestAnimationFrame(() => {
                publishCallToAction.current?.scrollIntoView({ block: 'center' });
                publishCallToAction.current?.focus();
              });
          },
          onError: onConflict,
          onSettled: release,
        }
      )
    );
  };

  const handleRequestChanges = () => {
    if (!stage || !canRequestChanges || actionsPending) return;
    if (!currentFeedback.trim()) {
      setNotice({
        severity: StudioFeedbackSeverity.ERROR,
        text: 'Descreva os ajustes necessários antes de devolver o item.',
      });
      return;
    }
    const submittedText = currentFeedback;
    guarded((release) =>
      changes.mutate(
        { id, stage: stage.type, lockVersion: stage.lockVersion, note: submittedText.trim() },
        {
          onSuccess: () => {
            setNotice({
              severity: StudioFeedbackSeverity.SUCCESS,
              text: `Ajustes solicitados para “${stageLabel}”. O item voltou para a produção.`,
            });
            notes.clearSent(stage.type, submittedText);
          },
          onError: onConflict,
          onSettled: release,
        }
      )
    );
  };

  const handleReopenStage = () => {
    if (!stage || !reopenAllowed || actionsPending || !currentFeedback.trim()) return;
    const submittedText = currentFeedback;
    guarded((release) =>
      reopen.mutate(
        { id, stage: stage.type, lockVersion: stage.lockVersion, note: submittedText.trim() },
        {
          onSuccess: () => {
            setNotice({
              severity: StudioFeedbackSeverity.SUCCESS,
              text: `“${stageLabel}” foi reaberto e voltou para a produção. A publicação fica bloqueada até ele ser aprovado de novo.`,
            });
            notes.clearSent(stage.type, submittedText);
          },
          onError: onConflict,
          onSettled: release,
        }
      )
    );
  };

  const handleArchiveToggle = () => {
    setArchiveConfirmOpen(false);
    if (actionsPending) return;
    guarded((release) => (archived ? unarchive : archive).mutate(id, { onSettled: release }));
  };

  const handlePublish = () => {
    setPublishConfirmOpen(false);
    if (!canPublishNow || actionsPending) return;
    setNotice(null);
    guarded((release) =>
      publishMutation.mutate(id, {
        // A timeout does not mean failure: the real outcome comes from the lesson status.
        onError: () => void refetch(),
        onSettled: release,
      })
    );
  };

  const handleSetCurrentWeek = () => {
    setCurrentWeekConfirmOpen(false);
    const material = publicationPreview?.weekMaterial;
    if (!material || !canSetMaterialAsCurrentWeek(lesson, publicationPreview)) return;
    if (actionsPending || setCurrentWeek.isPending) return;
    setCurrentWeek.mutate(material.id);
  };

  const actionError =
    submitReview.error ??
    (approvePdfFailed ? null : approve.error) ??
    changes.error ??
    reopen.error ??
    archive.error ??
    unarchive.error;
  const isConflictError = getHttpStatus(actionError) === HTTP_STATUS_CONFLICT;

  return (
    <Box
      data-testid="ai-lesson-review-detail"
      sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 2, md: 3 } }}
    >
      <Button
        data-testid="ai-lesson-review-back"
        startIcon={<ArrowBack />}
        onClick={backToList}
        sx={{ mb: 2, minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para a lista de Revisão
      </Button>

      <LessonConnectionAlert
        state={connection.state}
        screen={StudioScreenKind.REVIEW}
        onBackToList={() => navigate(STUDIO_ROUTES.review)}
      />

      {notes.recovered && (
        <Alert
          data-testid="ai-lesson-review-feedback-recovered"
          severity="info"
          onClose={notes.dismissRecovered}
          sx={{ mb: 2 }}
        >
          Rascunho recuperado: as observações que você digitou e não enviou foram restauradas neste
          navegador.
        </Alert>
      )}

      {lesson.status === LessonStatus.PUBLISHING && (
        <Alert
          data-testid="ai-lesson-publishing-notice"
          severity="info"
          role="status"
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Publicação do {kindLabel} em andamento em Materiais Semanais. Isso pode levar alguns minutos enquanto os
          PDFs são gerados; envios duplicados estão bloqueados e esta tela será atualizada sozinha.
        </Alert>
      )}

      {published && (
        <LessonPublishedPanel
          isSpecial={isSpecial}
          preview={publicationPreview}
          previewLoading={previewLoading}
          busy={actionsPending}
          settingCurrentWeek={setCurrentWeek.isPending}
          currentWeekError={
            setCurrentWeek.isError
              ? getErrorMessage(
                  setCurrentWeek.error,
                  'Não foi possível definir este material como semana atual.'
                )
              : null
          }
          onOpenWeekMaterials={() => navigate(STUDIO_ROUTES.weekMaterials)}
          onSetCurrentWeek={() => setCurrentWeekConfirmOpen(true)}
          onRepublish={() => setPublishConfirmOpen(true)}
        />
      )}

      {archived && (
        <Alert
          data-testid="ai-lesson-archived-notice"
          severity="info"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              data-testid="ai-lesson-unarchive"
              color="inherit"
              size="small"
              disabled={actionsPending}
              onClick={handleArchiveToggle}
              sx={{ minHeight: 44 }}
            >
              {unarchive.isPending ? 'Restaurando…' : 'Restaurar'}
            </Button>
          }
        >
          Esta lição está arquivada. O material publicado continua em Materiais Semanais; restaurar
          apenas devolve a lição à lista de publicadas do Estúdio.
        </Alert>
      )}

      {publishFailed && (
        <Alert
          data-testid="ai-lesson-publish-error"
          severity="error"
          onClose={() => publishMutation.reset()}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {getErrorMessage(
            publishMutation.error,
            `Não foi possível publicar o ${kindLabel}. Os itens aprovados foram preservados; tente novamente.`
          )}
        </Alert>
      )}

      {lesson.publicationFailureMessage && !published && !publishFailed && (
        <Alert
          data-testid="ai-lesson-publication-failure-notice"
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {publicationFailureNotice(lesson.publicationFailureMessage)}
        </Alert>
      )}

      {reviewActions.canStartReview && (
        <Alert
          data-testid="ai-lesson-review-start-notice"
          severity="info"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {isSpecial ? 'Os três itens do Material Especial' : 'Os oito itens'} estão concluídos.
              Inicie a revisão para habilitar a aprovação de cada item.
            </Typography>
            <Button
              data-testid="ai-lesson-review-start"
              color="inherit"
              disabled={actionsPending}
              onClick={() =>
                guarded((release) => submitReview.mutate(id, { onSettled: release }))
              }
              sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
            >
              {submitReview.isPending ? 'Iniciando revisão…' : 'Iniciar revisão'}
            </Button>
          </Stack>
        </Alert>
      )}
      {Boolean(actionError) && (
        <Alert data-testid="ai-lesson-review-action-error" severity="error" sx={{ mb: 2 }}>
          {isConflictError
            ? 'Este item foi alterado em outra sessão enquanto estava aberto. O conteúdo atualizado foi recarregado e suas observações locais foram preservadas; revise a nova versão antes de decidir.'
            : getErrorMessage(actionError, 'Não foi possível concluir a ação de revisão.')}
        </Alert>
      )}
      {notice && (
        <Alert
          data-testid="ai-lesson-review-notice"
          severity={notice.severity}
          onClose={() => setNotice(null)}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {notice.text}
        </Alert>
      )}
      {packageDownload.error && (
        <Alert
          data-testid="ai-lesson-review-download-package-error"
          severity="error"
          onClose={packageDownload.dismissError}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {packageDownload.error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
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
                color={isSpecial ? 'secondary' : 'primary'}
                size="small"
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
              <Typography
                variant="h4"
                component="h1"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.3rem', md: '1.8rem' }, overflowWrap: 'anywhere' }}
              >
                {lesson.theme}
              </Typography>
              <Chip
                data-testid="ai-lesson-review-status-chip"
                label={
                  archived
                    ? 'ARQUIVADO'
                    : published
                    ? 'PUBLICADO NO MATERIAIS SEMANAIS'
                    : lesson.status === LessonStatus.PUBLISHING
                      ? 'PUBLICANDO NO MATERIAIS SEMANAIS'
                      : allApproved
                        ? 'TODOS OS ITENS APROVADOS'
                        : `${approvedCount}/${totalStages} ITENS APROVADOS`
                }
                color={
                  published || allApproved
                    ? 'success'
                    : lesson.status === LessonStatus.PUBLISHING
                      ? 'info'
                      : 'warning'
                }
                sx={{ fontWeight: 800, borderRadius: 1.5 }}
              />
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 1.5, overflowWrap: 'anywhere' }}
            >
              {lesson.biblicalReference}
            </Typography>

            <Box sx={{ maxWidth: 600 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={0.25}
                sx={{ mb: 0.5 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Progresso de Revisão & Aprovação
                </Typography>
                <Typography variant="caption" fontWeight={800} color="primary.main">
                  {approvedCount} de {totalStages} itens aprovados ({Math.round(progress)}%)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                aria-label="Progresso de revisão e aprovação"
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

          <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' } }}>
            {canDownloadLessonPackage(lesson) && (
              <Button
                data-testid="ai-lesson-review-download-package"
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={
                  packageDownload.loading ? <CircularProgress size={18} /> : <DownloadIcon />
                }
                disabled={packageDownload.loading}
                onClick={() => void packageDownload.download()}
                fullWidth
                sx={{ borderRadius: 3, mb: 1, fontWeight: 700, minHeight: 44, textTransform: 'none' }}
              >
                {packageDownload.loading ? 'Gerando o PDF do pacote…' : 'Baixar pacote completo (PDF)'}
              </Button>
            )}
            {published && (
              <Button
                data-testid="ai-lesson-archive"
                variant="text"
                size="large"
                disabled={actionsPending}
                onClick={() => setArchiveConfirmOpen(true)}
                fullWidth
                sx={{ borderRadius: 3, mb: 1, fontWeight: 700, minHeight: 44 }}
              >
                {archive.isPending ? 'Arquivando…' : 'Arquivar lição'}
              </Button>
            )}
            {published && !materialMissing ? (
              <Button
                data-testid="ai-lesson-review-open-week-materials"
                variant="outlined"
                size="large"
                startIcon={<WeekIcon />}
                onClick={() => navigate(STUDIO_ROUTES.weekMaterials)}
                fullWidth
                sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 800 }}
              >
                Abrir Materiais Semanais
              </Button>
            ) : archived ? null : (
              <Button
                data-testid="ai-lesson-review-publish"
                variant="contained"
                color={allApproved ? 'success' : 'primary'}
                size="large"
                startIcon={<PublishIcon />}
                disabled={actionsPending || !canPublishNow}
                onClick={() => setPublishConfirmOpen(true)}
                fullWidth
                sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: 800, fontSize: '0.95rem' }}
              >
                {publishMutation.isPending || lesson.status === LessonStatus.PUBLISHING
                  ? 'Publicando…'
                  : republish
                    ? 'Publicar novamente'
                    : isSpecial
                      ? 'Publicar como Material Especial'
                      : 'Enviar ao Materiais Semanais'}
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={stageOrder.includes(selectedType) ? selectedType : false}
          onChange={(_, next: typeof selectedType) => selectStage(next)}
          aria-label="Itens da lição"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            py: 0.5,
            '& .MuiTab-root': { minHeight: 52, textTransform: 'none', fontWeight: 700 },
          }}
        >
          {stageOrder.map((stageType) => {
            const st = lesson.stages.find((item) => item.type === stageType);
            return (
              <Tab
                data-testid={`ai-lesson-review-tab-${stageType.toLowerCase().replaceAll('_', '-')}`}
                key={stageType}
                value={stageType}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{lessonStageLabel(stageType, lesson.category, true)}</span>
                    {st && (
                      <Chip
                        size="small"
                        label={REVIEW_TAB_STATUS_LABELS[st.status]}
                        color={LESSON_STAGE_STATUS_COLORS[st.status]}
                        sx={{ height: 20, fontSize: '0.675rem', fontWeight: 800, borderRadius: 1 }}
                      />
                    )}
                  </Stack>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          gap: { xs: 2, md: 3 },
          alignItems: 'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            minWidth: 0,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" component="h2" fontWeight={800}>
                {stageLabel}
              </Typography>
              {currentVersion && (
                <Typography
                  data-testid="ai-lesson-review-version"
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Versão {currentVersion.versionNumber} · criada em{' '}
                  {new Date(currentVersion.createdAt).toLocaleString('pt-BR')}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Button
                data-testid="ai-lesson-review-pdf-preview"
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={preview.loading ? <CircularProgress size={16} /> : <PictureAsPdf />}
                disabled={!stage?.currentVersionId || preview.loading}
                onClick={() => void preview.open()}
                sx={{ minHeight: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                Visualizar PDF do item
              </Button>
              {stage?.status === LessonStageStatus.APPROVED && (
                <Chip
                  icon={<ApproveIcon />}
                  label="Item Aprovado"
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Stack>
          </Stack>

          {versionChanged && stage && (
            <Alert
              data-testid="ai-lesson-review-version-changed"
              severity="warning"
              sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Este item recebeu uma nova versão
                {currentVersion ? ` (versão ${currentVersion.versionNumber})` : ''} enquanto estava
                aberto. O conteúdo abaixo já é o atual. Releia antes de decidir.
              </Typography>
              <Button
                data-testid="ai-lesson-review-acknowledge-version"
                color="inherit"
                variant="outlined"
                onClick={() => acknowledged.acknowledge(stage)}
                sx={{ minHeight: 44 }}
              >
                Revisei a versão atual
              </Button>
            </Alert>
          )}

          {newerUpstream && (
            <Alert data-testid="ai-lesson-review-upstream-changed" severity="info" sx={{ mb: 2 }}>
              “{lessonStageLabel(newerUpstream, lesson.category)}” foi alterado depois desta versão;
              confira se este item continua coerente com ele. Este aviso é apenas informativo.
            </Alert>
          )}

          <Divider sx={{ mb: 3 }} />

          {stage ? (
            <LessonStageContentViewer
              stage={stage}
              version={currentVersion}
              document={document}
              structuredData={structuredData}
              assetIssue={assetIssue}
              editable={false}
              readOnly
              onOpenPdfPreview={() => void preview.open()}
              pdfPreviewLoading={preview.loading}
              pdfPreviewDisabled={!stage.currentVersionId}
            />
          ) : (
            <Alert data-testid="ai-lesson-review-stage-missing" severity="error">
              Esta etapa não faz parte deste pacote. Selecione outro item acima.
            </Alert>
          )}
        </Paper>

        <Stack spacing={2.5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" component="h2" fontWeight={800} gutterBottom>
                Avaliação do Revisor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Aprove este item ou descreva os ajustes e devolva-o para a produção.
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ajustes necessários (enviado ao devolver o item)"
                placeholder="Ex: Ajustar o parágrafo inicial para ficar mais claro para as crianças..."
                value={currentFeedback}
                onChange={(e) => notes.change(selectedType, e.target.value)}
                slotProps={{
                  htmlInput: {
                    maxLength: LESSON_ACTION_NOTE_MAX_LENGTH,
                    'data-testid': 'ai-lesson-review-feedback-input',
                  },
                }}
                helperText={`${currentFeedback.length}/${LESSON_ACTION_NOTE_MAX_LENGTH} caracteres${
                  currentFeedback.trim() ? ' · este texto não é enviado ao aprovar' : ''
                }`}
                sx={{ mb: 2 }}
              />

              <LessonCommentsPanel
                data-testid="ai-lesson-review-comments-history"
                title="Histórico de observações desta etapa"
                comments={stageComments}
              />

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<ApproveIcon />}
                  data-testid="ai-lesson-review-approve"
                  disabled={actionsPending || !canApprove}
                  onClick={handleApproveStage}
                  sx={{ borderRadius: 2.5, fontWeight: 800, py: 1.2, minHeight: 44 }}
                >
                  {approve.isPending
                    ? 'Gerando o PDF e aprovando…'
                    : stage?.status === LessonStageStatus.APPROVED
                      ? 'Item Aprovado'
                      : 'Aprovar Este Item'}
                </Button>
                {approve.isPending && (
                  <Typography
                    data-testid="ai-lesson-review-approve-pending"
                    role="status"
                    variant="caption"
                    color="text.secondary"
                  >
                    A aprovação confere se o PDF deste item pode ser gerado; isso pode levar alguns
                    segundos.
                  </Typography>
                )}
                {approvePdfFailed && (
                  <Alert
                    data-testid="ai-lesson-review-approve-pdf-error"
                    severity="error"
                    onClose={() => approve.reset()}
                    sx={{ '& .MuiAlert-message': { width: '100%' } }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {getErrorMessage(
                        approve.error,
                        'Não foi possível gerar o PDF deste item, então ele não foi aprovado. Tente novamente.'
                      )}
                    </Typography>
                    <Button
                      data-testid="ai-lesson-review-approve-pdf-error-preview"
                      color="inherit"
                      variant="outlined"
                      size="small"
                      startIcon={<PictureAsPdf />}
                      disabled={!stage?.currentVersionId || preview.loading}
                      onClick={() => void preview.open()}
                      sx={{ minHeight: 44, textTransform: 'none' }}
                    >
                      Visualizar PDF do item
                    </Button>
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<ChangesIcon />}
                  disabled={actionsPending || !currentFeedback.trim() || !canRequestChanges}
                  data-testid="ai-lesson-review-request-changes"
                  onClick={handleRequestChanges}
                  sx={{ borderRadius: 2.5, fontWeight: 700, minHeight: 44 }}
                >
                  {changes.isPending ? 'Solicitando…' : 'Solicitar Ajustes neste Item'}
                </Button>
                {canReopenStage(lesson.status, stage, remoteBusy) && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<ChangesIcon />}
                    disabled={actionsPending || !currentFeedback.trim() || !reopenAllowed}
                    data-testid="ai-lesson-review-reopen"
                    onClick={handleReopenStage}
                    sx={{ borderRadius: 2.5, fontWeight: 700, minHeight: 44 }}
                  >
                    {reopen.isPending ? 'Reabrindo…' : 'Reabrir este item para ajustes'}
                  </Button>
                )}
                {blockReason && (
                  <Typography
                    data-testid="ai-lesson-review-block-reason"
                    variant="caption"
                    color="text.secondary"
                  >
                    {blockReason}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {(canPublishLesson(lesson) || publishMutation.isPending) && (
            <Alert
              data-testid="ai-lesson-review-ready-notice"
              severity="success"
              variant="filled"
              sx={{ borderRadius: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<PublishIcon />}
                  onClick={() => setPublishConfirmOpen(true)}
                  data-testid="ai-lesson-review-publish-now"
                  ref={publishCallToAction}
                  disabled={actionsPending || !canPublishLesson(lesson)}
                  sx={{ fontWeight: 800, minHeight: 44 }}
                >
                  Publicar Agora
                </Button>
              }
            >
              Todos os itens foram aprovados!{' '}
              {isSpecial
                ? 'O Material Especial está pronto para ser publicado em Materiais Semanais.'
                : 'A lição está pronta para ir ao Materiais Semanais.'}
            </Alert>
          )}
        </Stack>
      </Box>

      <LessonPdfPreviewDialog
        data-testid="ai-lesson-pdf-preview-dialog"
        title={stage ? stageLabel : 'Item'}
        fileName={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`}
        url={preview.url}
        error={preview.error}
        loading={preview.loading}
        onClose={preview.close}
      />

      <LessonPublishConfirmDialog
        open={publishConfirmOpen}
        lessonTheme={lesson.theme}
        fallbackIsSpecial={isSpecial}
        fallbackDocumentCount={totalStages}
        republish={republish}
        preview={publicationPreview}
        previewLoading={previewLoading}
        previewFailed={publication.isError}
        onConfirm={handlePublish}
        onClose={() => setPublishConfirmOpen(false)}
      />

      <ConfirmDialog
        data-testid="ai-lesson-current-week-confirm-dialog"
        open={currentWeekConfirmOpen}
        title="Definir como semana atual?"
        confirmText="Definir como semana atual"
        onConfirm={handleSetCurrentWeek}
        onClose={() => setCurrentWeekConfirmOpen(false)}
        autoCloseOnConfirm={false}
      >
        <Typography variant="body2">
          Este material passa a ser o material da semana atual e substitui o que está definido
          hoje. O material anterior continua publicado em Materiais Semanais, apenas deixa de ser o
          da semana.
        </Typography>
      </ConfirmDialog>

      <ConfirmDialog
        data-testid="ai-lesson-archive-confirm-dialog"
        open={archiveConfirmOpen}
        title="Arquivar esta lição?"
        confirmText="Arquivar"
        onConfirm={handleArchiveToggle}
        onClose={() => setArchiveConfirmOpen(false)}
        autoCloseOnConfirm={false}
      >
        <Typography variant="body2">
          A lição sai das listas ativas do Estúdio. O material já publicado em Materiais Semanais
          não é alterado, e a lição pode ser restaurada depois.
        </Typography>
      </ConfirmDialog>

      <UnsavedChangesDialog {...leave.dialog} />
    </Box>
  );
};
