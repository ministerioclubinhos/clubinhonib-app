import { useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { getErrorMessage, getHttpStatus } from '@/utils/apiError';
import { EMPTY_STRUCTURED_DATA, EMPTY_TIPTAP_DOCUMENT, HTTP_STATUS_CONFLICT, getStudioStageOrder } from './constants';
import {
  useLessonArchive,
  useLessonDraftEvents,
  useLessonPublicationPreview,
  usePublishLesson,
  useSetLessonMaterialCurrentWeek,
  useStageAction,
  useSubmitLessonPackage,
} from './hooks';
import { lessonStageLabel, localizeLegacyDocumentLabels } from './presentation.utils';
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
} from './publication';
import { lessonReviewActions } from './review-actions';
import type { UseReviewWorkflowInput } from './review.types';
import {
  isReviewDecisionOpen,
  pendingReviewStages,
  reviewHeaderStatus,
  reviewLessonSummary,
  reviewPublishButtonLabel,
} from './review.utils';
import {
  LessonArchiveAction,
  LessonCategory,
  LessonConnectionState,
  LessonStageAction,
  LessonStageStatus,
  LessonStatus,
  StageAssetIssue,
  StudioFeedbackSeverity,
  type StudioFeedback,
} from './types';
import { useAcknowledgedVersions } from './useAcknowledgedVersions';
import { useLessonPackageDownload } from './useLessonPackageDownload';
import { useLessonPdfPreview } from './useLessonPdfPreview';
import { useStageAssetIssue } from './useStageAssetIssue';
import { useStageParam } from './useStageParam';
import {
  canPublishLesson,
  canReopenStage,
  nextPendingReviewStage,
  reviewBlockReason,
  staleOriginStage,
} from './workflow';

const CONFLICT_ACTION_MESSAGE =
  'Este item foi alterado em outra sessão enquanto estava aberto. O conteúdo atualizado foi recarregado e suas observações locais foram preservadas; revise a nova versão antes de decidir.';

/**
 * State, derived permissions and actions of the review screen for one loaded lesson.
 * The screen only lays out what this hook decides.
 */
export function useReviewWorkflow({ lesson, refetch, notes }: UseReviewWorkflowInput) {
  const id = lesson.id;
  const isSpecial = lesson.category === LessonCategory.SPECIAL;
  const dispatch = useDispatch<AppDispatch>();
  const connection = useLessonDraftEvents(id);
  const approve = useStageAction(LessonStageAction.APPROVE);
  const changes = useStageAction(LessonStageAction.CHANGES);
  const reopen = useStageAction(LessonStageAction.REOPEN);
  const archive = useLessonArchive(LessonArchiveAction.ARCHIVE);
  const unarchive = useLessonArchive(LessonArchiveAction.UNARCHIVE);
  const publishMutation = usePublishLesson();
  const submitReview = useSubmitLessonPackage();

  const [selectedType, selectStage] = useStageParam();
  const acknowledged = useAcknowledgedVersions(lesson);
  const [notice, setNotice] = useState<StudioFeedback | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [currentWeekConfirmOpen, setCurrentWeekConfirmOpen] = useState(false);
  const publishCallToAction = useRef<HTMLButtonElement | null>(null);
  const feedbackInput = useRef<HTMLInputElement | null>(null);
  // The preview is only needed for the publish dialog and for the published state.
  const publication = useLessonPublicationPreview(
    id,
    lesson.status,
    publishConfirmOpen || lesson.status === LessonStatus.PUBLISHED
  );
  const setCurrentWeek = useSetLessonMaterialCurrentWeek(id, () => dispatch(fetchRoutes()));
  const packageDownload = useLessonPackageDownload(id, lessonPackageFileName(lesson));
  // `isPending` only changes on the next render; this closes the same-frame double click.
  const submitting = useRef(false);

  const stage = useMemo(
    () => lesson.stages.find((s) => s.type === selectedType),
    [lesson, selectedType]
  );
  const currentVersion =
    stage?.versions.find((version) => version.id === stage.currentVersionId) ?? null;
  const preview = useLessonPdfPreview(id, selectedType, stage?.lockVersion, stage?.currentVersionId);
  const document = useMemo(
    () => localizeLegacyDocumentLabels(currentVersion?.tiptapAstJson ?? EMPTY_TIPTAP_DOCUMENT),
    [currentVersion?.tiptapAstJson]
  );
  // The same value feeds the viewer notice and the approval gate.
  const structuredData = currentVersion?.structuredDataJson ?? EMPTY_STRUCTURED_DATA;
  const assetIssue = useStageAssetIssue(stage?.type, structuredData) ?? StageAssetIssue.NONE;

  const stageOrder = getStudioStageOrder(lesson.category);
  const summary = reviewLessonSummary(lesson);
  const allApproved = summary.approved === summary.total;
  const headerStatus = reviewHeaderStatus(lesson, summary);
  // Só há formulário de decisão enquanto o pacote está no ciclo de revisão.
  const decisionOpen = isReviewDecisionOpen(lesson.status);
  const pendingStages = pendingReviewStages(lesson);
  const nextPending = pendingStages.find((type) => type !== selectedType) ?? null;
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
  const published = lesson.status === LessonStatus.PUBLISHED;
  const showReopen = canReopenStage(lesson.status, stage, remoteBusy);
  const reopenAllowed = showReopen && !versionChanged;
  const currentFeedback = notes.feedback[selectedType] ?? '';
  const stageComments =
    lesson.comments?.filter((comment) => comment.sectionKey === selectedType) ?? [];
  const stageLabel = lessonStageLabel(selectedType, lesson.category);
  const publicationPreview = publication.data;
  const materialMissing = isPublishedMaterialMissing(lesson, publicationPreview);
  const republish = canRepublishLesson(lesson, publicationPreview);
  const canPublishNow = canPublishOrRepublishLesson(lesson, publicationPreview);
  const publishFailed =
    publishMutation.isError &&
    (lesson.status === LessonStatus.READY_FOR_PUBLICATION || materialMissing);
  const kindLabel = publicationKindLabel(isSpecial);
  const approvePdfFailed =
    approve.isError && approve.variables?.stage === selectedType && isStagePdfFailure(approve.error);
  // Informative only: approved items are no longer invalidated by an earlier correction.
  const newerUpstream = stage && !published && !archived ? staleOriginStage(lesson, stage) : null;
  // Publicada com o material no ar: as ações do material ficam no painel verde.
  const showPublish = !archived && !(published && !materialMissing);

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

  const approveStage = () => {
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

  const requestChanges = () => {
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

  const reopenStage = () => {
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

  const toggleArchive = () => {
    setArchiveConfirmOpen(false);
    if (actionsPending) return;
    guarded((release) => (archived ? unarchive : archive).mutate(id, { onSettled: release }));
  };

  const publish = () => {
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

  const confirmCurrentWeek = () => {
    setCurrentWeekConfirmOpen(false);
    const material = publicationPreview?.weekMaterial;
    if (!material || !canSetMaterialAsCurrentWeek(lesson, publicationPreview)) return;
    if (actionsPending || setCurrentWeek.isPending) return;
    setCurrentWeek.mutate(material.id);
  };

  const startReview = () => guarded((release) => submitReview.mutate(id, { onSettled: release }));

  const focusFeedback = () => {
    feedbackInput.current?.scrollIntoView({ block: 'center' });
    feedbackInput.current?.focus();
  };

  const actionError =
    submitReview.error ??
    (approvePdfFailed ? null : approve.error) ??
    changes.error ??
    reopen.error ??
    archive.error ??
    unarchive.error;
  const actionErrorMessage = actionError
    ? getHttpStatus(actionError) === HTTP_STATUS_CONFLICT
      ? CONFLICT_ACTION_MESSAGE
      : getErrorMessage(actionError, 'Não foi possível concluir a ação de revisão.')
    : null;

  return {
    isSpecial,
    connection,
    stageOrder,
    selectedType,
    selectStage,
    stage,
    stageLabel,
    currentVersion,
    document,
    structuredData,
    assetIssue,
    preview,
    acknowledged,
    versionChanged,
    newerUpstream,
    summary,
    allApproved,
    headerStatus,
    decisionOpen,
    pendingStages,
    nextPending,
    blockReason,
    canStartReview: reviewActions.canStartReview,
    canApprove,
    canRequestChanges,
    showReopen,
    reopenAllowed,
    actionsPending,
    archived,
    published,
    currentFeedback,
    stageComments,
    kindLabel,
    readyToPublish: canPublishLesson(lesson),
    showPublish,
    showPublishHint: showPublish && !canPublishNow && !allApproved,
    publishLabel: reviewPublishButtonLabel({
      publishing: publishMutation.isPending || lesson.status === LessonStatus.PUBLISHING,
      republish,
      isSpecial,
    }),
    canPublishNow,
    republish,
    canDownload: canDownloadLessonPackage(lesson),
    publication,
    publishErrorMessage: publishFailed
      ? getErrorMessage(
          publishMutation.error,
          `Não foi possível publicar o ${kindLabel}. Os itens aprovados foram preservados; tente novamente.`
        )
      : null,
    publicationFailureMessage:
      lesson.publicationFailureMessage && !published && !publishFailed
        ? publicationFailureNotice(lesson.publicationFailureMessage)
        : null,
    currentWeekErrorMessage: setCurrentWeek.isError
      ? getErrorMessage(setCurrentWeek.error, 'Não foi possível definir este material como semana atual.')
      : null,
    approvePdfErrorMessage: approvePdfFailed
      ? getErrorMessage(
          approve.error,
          'Não foi possível gerar o PDF deste item, então ele não foi aprovado. Tente novamente.'
        )
      : null,
    actionErrorMessage,
    notice,
    dismissNotice: () => setNotice(null),
    mutations: {
      approve,
      changes,
      reopen,
      archive,
      unarchive,
      publish: publishMutation,
      submitReview,
      setCurrentWeek,
    },
    packageDownload,
    dialogs: {
      archiveConfirmOpen,
      setArchiveConfirmOpen,
      publishConfirmOpen,
      setPublishConfirmOpen,
      currentWeekConfirmOpen,
      setCurrentWeekConfirmOpen,
    },
    refs: { publishCallToAction, feedbackInput },
    actions: {
      approveStage,
      requestChanges,
      reopenStage,
      toggleArchive,
      publish,
      confirmCurrentWeek,
      startReview,
      focusFeedback,
    },
  };
}

export type ReviewWorkflow = ReturnType<typeof useReviewWorkflow>;
