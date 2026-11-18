import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { AutoAwesome, AutoStories, RateReview } from '@mui/icons-material';
import { GENERATION_TEXTS } from '../../generation.constants';
import { VERSE_DEPENDENT_STAGES } from '../../presentation.constants';
import { GenerationProgress } from '../generation/GenerationProgress';
import { displayAiFailure, lessonStageLabel } from '../../presentation.utils';
import { PRODUCTION_TEXTS } from '../../production.constants';
import type { ProductionStageGuidanceProps } from '../../production.types';
import { completionNoticeText } from '../../production.utils';
import { LessonStageStatus, LessonStageType } from '../../types';
import { formatElapsedTime } from '../../utils';

const ALERT_SX = { mb: 2, borderRadius: 2.5 } as const;

/** What the producer needs to know about the item before acting on it. */
export function ProductionStageGuidance({
  stage,
  category,
  verse,
  staleOrigin,
  stageGenerating,
  generationLocked,
  generation,
  elapsedSeconds,
  dependencyReady,
  completionNotice,
  canRetry,
  onRetry,
  onShowFailureDetails,
  onDismissCompletionNotice,
  onGoToReview,
}: ProductionStageGuidanceProps) {
  const elapsed = formatElapsedTime(elapsedSeconds);
  return (
    <>
      {completionNotice && (
        <Alert
          data-testid="ai-lesson-completion-notice"
          severity="success"
          role="status"
          onClose={onDismissCompletionNotice}
          closeText={PRODUCTION_TEXTS.dismissNotice}
          sx={{ ...ALERT_SX, '& .MuiAlert-message': { flex: 1, minWidth: 0 } }}
        >
          {completionNoticeText({ category }, completionNotice)}
          {!completionNotice.next && (
            <Button
              data-testid="ai-lesson-completion-go-to-review"
              color="inherit"
              variant="outlined"
              startIcon={<RateReview />}
              onClick={onGoToReview}
              sx={{ display: 'flex', mt: 1, minHeight: 44 }}
            >
              {PRODUCTION_TEXTS.goToReview}
            </Button>
          )}
        </Alert>
      )}

      {stage.failureMessage && !stageGenerating && (
        // Inline instead of a modal: the failure is still there on every visit, and a
        // dialog that reopens by itself gets in the way of reading the item.
        <Alert
          data-testid="ai-lesson-stage-generation-failed"
          severity="error"
          sx={{ ...ALERT_SX, '& .MuiAlert-message': { flex: 1, minWidth: 0 } }}
        >
          <Typography variant="body2" fontWeight={700}>
            {PRODUCTION_TEXTS.generationFailedTitle}
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {displayAiFailure(stage.type, stage.failureMessage, category)}
          </Typography>
          {!canRetry && stage.type === LessonStageType.LESSON_VISUALS && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {PRODUCTION_TEXTS.retryNeedsVisualConfig}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button
              data-testid="ai-lesson-stage-generation-retry"
              color="inherit"
              variant="outlined"
              startIcon={<AutoAwesome />}
              disabled={!canRetry}
              onClick={onRetry}
              sx={{ minHeight: 44 }}
            >
              {PRODUCTION_TEXTS.retryGeneration}
            </Button>
            <Button
              data-testid="ai-lesson-stage-generation-details"
              color="inherit"
              onClick={onShowFailureDetails}
              sx={{ minHeight: 44 }}
            >
              {PRODUCTION_TEXTS.failureDetails}
            </Button>
          </Stack>
        </Alert>
      )}

      {VERSE_DEPENDENT_STAGES.includes(stage.type) && verse && (
        <Alert
          data-testid="ai-lesson-stage-memory-verse"
          severity="success"
          icon={<AutoStories />}
          sx={ALERT_SX}
        >
          <strong>{verse.reference} — NVI:</strong> “{verse.text}”
        </Alert>
      )}

      {(stage.status === LessonStageStatus.CHANGES_REQUESTED ||
        stage.status === LessonStageStatus.STALE) && (
        <Alert data-testid="ai-lesson-stage-correction-guidance" severity="warning" sx={ALERT_SX}>
          {stage.status === LessonStageStatus.CHANGES_REQUESTED
            ? PRODUCTION_TEXTS.changesRequested
            : `Esta etapa ficou desatualizada após alterações em ${
                staleOrigin
                  ? `“${lessonStageLabel(staleOrigin, category)}”`
                  : PRODUCTION_TEXTS.staleUnknownOrigin
              }. Regenere ou revise o conteúdo e conclua o item novamente.`}
        </Alert>
      )}

      {stageGenerating && (
        <Alert
          data-testid="ai-lesson-stage-generating"
          severity="info"
          role="status"
          icon={<CircularProgress size={20} />}
          sx={{ ...ALERT_SX, '& .MuiAlert-message': { flex: 1, minWidth: 0 } }}
        >
          <GenerationProgress progress={generation} elapsed={elapsed} />
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {GENERATION_TEXTS.keepBrowsing}
          </Typography>
        </Alert>
      )}
      {generationLocked && !stageGenerating && (
        <Alert
          data-testid="ai-lesson-other-stage-generating"
          severity="info"
          sx={{ ...ALERT_SX, '& .MuiAlert-message': { flex: 1, minWidth: 0 } }}
        >
          <GenerationProgress
            progress={generation}
            elapsed={elapsed}
            title={
              generation
                ? `Gerando “${lessonStageLabel(generation.stage, category)}”`
                : 'Outra etapa desta lição está sendo gerada'
            }
          />
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {GENERATION_TEXTS.otherStage}
          </Typography>
        </Alert>
      )}

      {!dependencyReady && (
        <Alert data-testid="ai-lesson-stage-dependency-missing" severity="warning" sx={ALERT_SX}>
          {PRODUCTION_TEXTS.dependencyMissing}
        </Alert>
      )}
    </>
  );
}
