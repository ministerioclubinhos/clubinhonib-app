import { Box, Button, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { STUDIO_ROUTES } from '../../presentation.constants';
import type { LessonReviewWorkspaceProps } from '../../review.types';
import { LessonStageStatus, LessonStatus, StudioScreenKind } from '../../types';
import { useReviewWorkflow } from '../../useReviewWorkflow';
import { LessonConnectionAlert } from '../LessonConnectionAlert';
import { LessonPdfPreviewDialog } from '../LessonPdfPreviewDialog';
import { LessonPublishConfirmDialog } from '../LessonPublishConfirmDialog';
import { LessonPublishedPanel } from '../LessonPublishedPanel';
import { ReviewConfirmDialogs } from './ReviewConfirmDialogs';
import { ReviewDecisionCard } from './ReviewDecisionCard';
import { ReviewHeader } from './ReviewHeader';
import { ReviewMobileBar } from './ReviewMobileBar';
import { ReviewNotices } from './ReviewNotices';
import { ReviewReadyNotice } from './ReviewReadyNotice';
import { ReviewStagePanel } from './ReviewStagePanel';
import { ReviewStageTabs } from './ReviewStageTabs';

/** Review screen of one loaded lesson: layout only; decisions live in `useReviewWorkflow`. */
export function LessonReviewWorkspace({ lesson, refetch, notes, onBack }: LessonReviewWorkspaceProps) {
  const navigate = useNavigate();
  const review = useReviewWorkflow({ lesson, refetch, notes });
  const { mutations, dialogs, actions, preview, stage, publication } = review;
  const openPreview = () => void preview.open();

  return (
    <Box
      data-testid="ai-lesson-review-detail"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 2, md: 3 },
        // Folga para a barra fixa de decisão não cobrir o fim do conteúdo.
        pb: { xs: 12, lg: 3 },
      }}
    >
      <Button
        data-testid="ai-lesson-review-back"
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{ mb: 2, minHeight: 44, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
      >
        Voltar para a lista de Revisão
      </Button>

      <LessonConnectionAlert
        state={review.connection.state}
        screen={StudioScreenKind.REVIEW}
        onBackToList={() => navigate(STUDIO_ROUTES.review)}
      />

      <ReviewNotices
        recovered={notes.recovered}
        onDismissRecovered={notes.dismissRecovered}
        publishing={lesson.status === LessonStatus.PUBLISHING}
        kindLabel={review.kindLabel}
        publishedPanel={
          review.published && (
            <LessonPublishedPanel
              isSpecial={review.isSpecial}
              preview={publication.data}
              previewLoading={publication.isLoading}
              busy={review.actionsPending}
              settingCurrentWeek={mutations.setCurrentWeek.isPending}
              currentWeekError={review.currentWeekErrorMessage}
              onOpenWeekMaterials={() => navigate(STUDIO_ROUTES.weekMaterials)}
              onSetCurrentWeek={() => dialogs.setCurrentWeekConfirmOpen(true)}
              onRepublish={() => dialogs.setPublishConfirmOpen(true)}
            />
          )
        }
        archived={review.archived}
        restoring={mutations.unarchive.isPending}
        restoreDisabled={review.actionsPending}
        onRestore={actions.toggleArchive}
        publishErrorMessage={review.publishErrorMessage}
        onDismissPublishError={() => mutations.publish.reset()}
        publicationFailureMessage={review.publicationFailureMessage}
        canStartReview={review.canStartReview}
        startingReview={mutations.submitReview.isPending}
        startReviewDisabled={review.actionsPending}
        onStartReview={actions.startReview}
        isSpecial={review.isSpecial}
        actionErrorMessage={review.actionErrorMessage}
        notice={review.notice}
        onDismissNotice={review.dismissNotice}
        downloadError={review.packageDownload.error}
        onDismissDownloadError={review.packageDownload.dismissError}
      />

      <ReviewHeader
        lesson={lesson}
        isSpecial={review.isSpecial}
        summary={review.summary}
        headerStatus={review.headerStatus}
        allApproved={review.allApproved}
        showPublish={review.showPublish}
        showPublishHint={review.showPublishHint}
        publishLabel={review.publishLabel}
        publishDisabled={review.actionsPending || !review.canPublishNow}
        onPublish={() => dialogs.setPublishConfirmOpen(true)}
        canDownload={review.canDownload}
        downloading={review.packageDownload.loading}
        onDownload={() => void review.packageDownload.download()}
        showArchive={review.published}
        archiving={mutations.archive.isPending}
        archiveDisabled={review.actionsPending}
        onArchive={() => dialogs.setArchiveConfirmOpen(true)}
      />

      <ReviewStageTabs
        lesson={lesson}
        stageOrder={review.stageOrder}
        selectedType={review.selectedType}
        onSelect={review.selectStage}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
          gap: { xs: 2, md: 3 },
          alignItems: 'start',
        }}
      >
        <ReviewStagePanel
          category={lesson.category}
          stage={stage}
          stageLabel={review.stageLabel}
          currentVersion={review.currentVersion}
          document={review.document}
          structuredData={review.structuredData}
          assetIssue={review.assetIssue}
          previewLoading={preview.loading}
          onOpenPreview={openPreview}
          versionChanged={review.versionChanged}
          onAcknowledgeVersion={() => stage && review.acknowledged.acknowledge(stage)}
          newerUpstream={review.newerUpstream}
        />

        <Stack
          spacing={2}
          sx={{
            minWidth: 0,
            // A decisão acompanha a leitura: o revisor não precisa voltar ao topo.
            position: { lg: 'sticky' },
            top: { lg: 88 },
          }}
        >
          <ReviewDecisionCard
            decisionOpen={review.decisionOpen}
            blockReason={review.blockReason}
            feedback={review.currentFeedback}
            onFeedbackChange={(text) => notes.change(review.selectedType, text)}
            feedbackInputRef={review.refs.feedbackInput}
            approving={mutations.approve.isPending}
            approveDisabled={review.actionsPending || !review.canApprove}
            stageApproved={stage?.status === LessonStageStatus.APPROVED}
            onApprove={actions.approveStage}
            approvePdfErrorMessage={review.approvePdfErrorMessage}
            onDismissApprovePdfError={() => mutations.approve.reset()}
            previewDisabled={!stage?.currentVersionId || preview.loading}
            onOpenPreview={openPreview}
            canRequestChanges={review.canRequestChanges}
            requestingChanges={mutations.changes.isPending}
            requestChangesDisabled={
              review.actionsPending || !review.currentFeedback.trim() || !review.canRequestChanges
            }
            onRequestChanges={actions.requestChanges}
            showReopen={review.showReopen}
            reopening={mutations.reopen.isPending}
            reopenDisabled={
              review.actionsPending || !review.currentFeedback.trim() || !review.reopenAllowed
            }
            onReopen={actions.reopenStage}
            nextPending={review.nextPending}
            pendingCount={review.pendingStages.length}
            onSelectStage={review.selectStage}
            comments={review.stageComments}
          />

          {(review.readyToPublish || mutations.publish.isPending) && (
            <ReviewReadyNotice
              isSpecial={review.isSpecial}
              disabled={review.actionsPending || !review.readyToPublish}
              onPublish={() => dialogs.setPublishConfirmOpen(true)}
              buttonRef={review.refs.publishCallToAction}
            />
          )}
        </Stack>
      </Box>

      {review.decisionOpen && (review.canApprove || review.canRequestChanges) && (
        <ReviewMobileBar
          approving={mutations.approve.isPending}
          approveDisabled={review.actionsPending || !review.canApprove}
          requestChangesDisabled={review.actionsPending || !review.canRequestChanges}
          onApprove={actions.approveStage}
          onFocusFeedback={actions.focusFeedback}
        />
      )}

      <LessonPdfPreviewDialog
        data-testid="ai-lesson-pdf-preview-dialog"
        title={stage ? review.stageLabel : 'Item'}
        fileName={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`}
        url={preview.url}
        error={preview.error}
        loading={preview.loading}
        onClose={preview.close}
      />

      <LessonPublishConfirmDialog
        open={dialogs.publishConfirmOpen}
        lessonTheme={lesson.theme}
        fallbackIsSpecial={review.isSpecial}
        fallbackDocumentCount={review.summary.total}
        republish={review.republish}
        preview={publication.data}
        previewLoading={publication.isLoading}
        previewFailed={publication.isError}
        onConfirm={actions.publish}
        onClose={() => dialogs.setPublishConfirmOpen(false)}
      />

      <ReviewConfirmDialogs
        currentWeekOpen={dialogs.currentWeekConfirmOpen}
        onConfirmCurrentWeek={actions.confirmCurrentWeek}
        onCloseCurrentWeek={() => dialogs.setCurrentWeekConfirmOpen(false)}
        archiveOpen={dialogs.archiveConfirmOpen}
        onConfirmArchive={actions.toggleArchive}
        onCloseArchive={() => dialogs.setArchiveConfirmOpen(false)}
      />
    </Box>
  );
}
