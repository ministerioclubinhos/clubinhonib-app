import React, { useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import {
  useLessonDraft,
  useLessonDraftEvents,
  useResolveLessonComment,
} from '@/hooks/api/useAiLessons';
import { LessonConnectionAlert } from '@/features/ai-lessons/components/LessonConnectionAlert';
import { ProductionConfirmDialog } from '@/features/ai-lessons/components/production/ProductionConfirmDialog';
import { ProductionDetailSkeleton } from '@/features/ai-lessons/components/production/ProductionDetailSkeleton';
import { ProductionHeader } from '@/features/ai-lessons/components/production/ProductionHeader';
import { ProductionNotices } from '@/features/ai-lessons/components/production/ProductionNotices';
import { ProductionStageCard } from '@/features/ai-lessons/components/production/ProductionStageCard';
import { ProductionUnsavedBar } from '@/features/ai-lessons/components/production/ProductionUnsavedBar';
import { RemoteVersionDialog } from '@/features/ai-lessons/components/production/RemoteVersionDialog';
import { STUDIO_ROUTES } from '@/features/ai-lessons/presentation.constants';
import { lessonStageLabel } from '@/features/ai-lessons/presentation.utils';
import {
  AI_PROVIDER_SETTINGS_ROUTE,
  PRODUCTION_STAGE_CARD_ID,
  PRODUCTION_TEXTS,
  PRODUCTION_UNSAVED_BAR_CLEARANCE,
} from '@/features/ai-lessons/production.constants';
import { productionHeaderStep, productionProgress } from '@/features/ai-lessons/production.utils';
import {
  LessonConnectionState,
  StageNavigationMode,
  StudioScreenKind,
  type LessonStageType,
} from '@/features/ai-lessons/types';
import { useLessonPdfPreview } from '@/features/ai-lessons/useLessonPdfPreview';
import { useProductionStage } from '@/features/ai-lessons/useProductionStage';
import { useProductionWorkflow } from '@/features/ai-lessons/useProductionWorkflow';
import { useStageParam } from '@/features/ai-lessons/useStageParam';
import { useStudioUnsavedChanges } from '@/features/ai-lessons/useStudioUnsavedChanges';
import { canDeleteLesson } from '@/features/ai-lessons/workflow';
import { LessonDraftDialogs } from './components/LessonDraftDialogs';
import { STAGE_NAVIGATION_WIDTH } from '@/features/ai-lessons/production.constants';
import { LessonStageNavigation } from './components/LessonStageNavigation';

const PAGE_SX = { width: { xs: '98%', md: '95%' }, mx: 'auto' } as const;

export const LessonDraftDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data: lesson, isLoading, error, refetch } = useLessonDraft(id);
  const connection = useLessonDraftEvents(id);
  const resolveComment = useResolveLessonComment();
  const [selectedType, selectStage] = useStageParam();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [llmErrorOpen, setLlmErrorOpen] = useState(false);
  const [remoteVersionOpen, setRemoteVersionOpen] = useState(false);
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);

  const data = useProductionStage(id, lesson, selectedType);
  const { stage, version, local, edited } = data;
  const preview = useLessonPdfPreview(
    id,
    selectedType,
    stage?.lockVersion,
    stage?.currentVersionId
  );
  const workflow = useProductionWorkflow({
    id,
    lesson,
    data,
    selectedType,
    selectStage,
    lessonGone: connection.state === LessonConnectionState.NOT_FOUND,
    refetch,
    onDeleted: () => navigate(STUDIO_ROUTES.production),
  });
  const leave = useStudioUnsavedChanges(local.hasDrafts || workflow.savePending);

  const backToList = () => leave.requestLeave(() => navigate(STUDIO_ROUTES.production));
  const goToReview = () => leave.requestLeave(() => navigate(`${STUDIO_ROUTES.review}/${id}`));

  if (isLoading) return <ProductionDetailSkeleton data-testid="ai-lessons-detail-loading" />;

  if (error || !lesson) {
    return (
      <Box data-testid="ai-lessons-detail-error" sx={{ ...PAGE_SX, py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {PRODUCTION_TEXTS.loadError}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={backToList} sx={{ mt: 2, minHeight: 44 }}>
          {PRODUCTION_TEXTS.backFromError}
        </Button>
        <UnsavedChangesDialog {...leave.dialog} />
      </Box>
    );
  }

  const stageLabel = stage ? lessonStageLabel(stage.type, lesson.category) : '';
  const openStageFromHeader = (type: LessonStageType) => {
    workflow.openStage(type);
    // The header is far from the item on a phone: bring the item into view as well.
    requestAnimationFrame(() =>
      document
        .getElementById(PRODUCTION_STAGE_CARD_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };
  const navigation = (mode: StageNavigationMode) => (
    <LessonStageNavigation
      category={lesson.category}
      stages={lesson.stages}
      selectedType={selectedType}
      draftStages={local.draftStages}
      mode={mode}
      onSelect={workflow.openStage}
      collapsed={navigationCollapsed}
      onToggleCollapsed={() => setNavigationCollapsed((value) => !value)}
    />
  );

  return (
    <Box
      data-testid="ai-lessons-detail"
      aria-busy={workflow.generationLocked}
      sx={{
        ...PAGE_SX,
        py: { xs: 1.5, sm: 2.5, md: 3.5 },
        // Room for the fixed bar, so it never hides the end of the document on a phone.
        pb: edited ? { xs: `${PRODUCTION_UNSAVED_BAR_CLEARANCE}px`, lg: 3.5 } : undefined,
      }}
    >
      <Button
        data-testid="ai-lesson-back-to-production"
        startIcon={<ArrowBack />}
        onClick={backToList}
        sx={{ mb: 2, minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        {PRODUCTION_TEXTS.back}
      </Button>

      <LessonConnectionAlert
        state={connection.state}
        screen={StudioScreenKind.PRODUCTION}
        onBackToList={() => navigate(STUDIO_ROUTES.production)}
      />
      <ProductionNotices
        recovered={local.recovered}
        hasDrafts={local.hasDrafts}
        draftOutdated={workflow.draftOutdated}
        rebaseDisabled={workflow.savePending}
        onDismissRecovered={local.dismissRecovered}
        onViewRemote={() => setRemoteVersionOpen(true)}
        onRebase={workflow.requestRebase}
      />

      <ProductionHeader
        lesson={lesson}
        step={productionHeaderStep(lesson)}
        progress={productionProgress(lesson)}
        canDelete={canDeleteLesson(lesson)}
        deleteDisabled={workflow.deleteDisabled}
        onOpenStage={openStageFromHeader}
        onGoToReview={goToReview}
        onDelete={() => {
          workflow.resetDelete();
          setDeleteConfirmOpen(true);
        }}
      />

      {navigation(StageNavigationMode.MOBILE)}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            lg: `${
              navigationCollapsed
                ? STAGE_NAVIGATION_WIDTH.collapsed
                : STAGE_NAVIGATION_WIDTH.expanded
            }px minmax(0, 1fr)`,
          },
          transition: 'grid-template-columns 200ms ease',
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        {navigation(StageNavigationMode.DESKTOP)}

        <Box sx={{ minWidth: 0 }}>
          {stage ? (
            <ProductionStageCard
              lesson={lesson}
              data={data}
              workflow={workflow}
              refetch={refetch}
              preview={preview}
              resolvingCommentId={
                resolveComment.isPending ? (resolveComment.variables?.commentId ?? null) : null
              }
              onResolveComment={(commentId) => resolveComment.mutate({ id, commentId })}
              onShowFailureDetails={() => setLlmErrorOpen(true)}
              onGoToReview={goToReview}
              onOpenProviderSettings={() =>
                leave.requestLeave(() => navigate(AI_PROVIDER_SETTINGS_ROUTE))
              }
            />
          ) : (
            <Alert data-testid="ai-lesson-stage-missing" severity="error" sx={{ borderRadius: 3 }}>
              {PRODUCTION_TEXTS.stageMissing}
            </Alert>
          )}
          <ProductionUnsavedBar
            visible={edited}
            saveEnabled={workflow.saveEnabled}
            savePending={workflow.savePending}
            onSave={workflow.requestSave}
            onDiscard={workflow.requestDiscard}
          />
        </Box>
      </Box>

      <LessonDraftDialogs
        lesson={lesson}
        stage={stage}
        canGenerate={workflow.canRetry}
        generationLocked={workflow.generationLocked}
        llmErrorOpen={llmErrorOpen}
        previewUrl={preview.url}
        previewError={preview.error}
        previewLoading={preview.loading}
        deleteConfirmOpen={deleteConfirmOpen}
        deletePending={workflow.deletePending}
        deleteError={workflow.deleteError}
        onCloseLlmError={() => setLlmErrorOpen(false)}
        onRetryGeneration={() => {
          setLlmErrorOpen(false);
          workflow.runGeneration();
        }}
        onClosePreview={preview.close}
        onCloseDelete={() => setDeleteConfirmOpen(false)}
        onConfirmDelete={workflow.confirmDelete}
      />
      <ProductionConfirmDialog
        confirmation={workflow.confirmation}
        stage={stage}
        stageLabel={stageLabel}
        category={lesson.category}
        impactedStages={workflow.impactedStages}
        reviewCycleActive={workflow.reviewCycleActive}
        staleOrigin={workflow.staleOrigin}
        onConfirm={workflow.confirmCurrent}
        onClose={workflow.closeConfirmation}
      />
      <RemoteVersionDialog
        open={remoteVersionOpen}
        stage={stage}
        stageLabel={stageLabel}
        version={version}
        document={data.remoteDocument}
        onClose={() => setRemoteVersionOpen(false)}
      />
      <UnsavedChangesDialog {...leave.dialog} />
    </Box>
  );
};
