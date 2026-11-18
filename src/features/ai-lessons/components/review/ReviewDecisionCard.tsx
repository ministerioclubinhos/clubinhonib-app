import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import {
  ArrowForward as NextIcon,
  CheckCircle as ApproveIcon,
  PictureAsPdf,
  RateReview as ChangesIcon,
} from '@mui/icons-material';
import { LESSON_ACTION_NOTE_MAX_LENGTH } from '../../constants';
import { REVIEW_TEXTS } from '../../review.constants';
import type { ReviewDecisionCardProps } from '../../review.types';
import { LessonCommentsPanel } from '../LessonCommentsPanel';

/** The reviewer's decision on the selected item: approve, send back or reopen. */
export function ReviewDecisionCard({
  decisionOpen,
  blockReason,
  feedback,
  onFeedbackChange,
  feedbackInputRef,
  approving,
  approveDisabled,
  stageApproved,
  onApprove,
  approvePdfErrorMessage,
  onDismissApprovePdfError,
  previewDisabled,
  onOpenPreview,
  canRequestChanges,
  requestingChanges,
  requestChangesDisabled,
  onRequestChanges,
  showReopen,
  reopening,
  reopenDisabled,
  onReopen,
  nextPending,
  pendingCount,
  onSelectStage,
  comments,
}: ReviewDecisionCardProps) {
  return (
    <Card
      component="section"
      aria-labelledby="ai-lesson-review-decision-title"
      data-testid="ai-lesson-review-decision"
      elevation={0}
      sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Typography
          id="ai-lesson-review-decision-title"
          variant="subtitle1"
          component="h2"
          fontWeight={800}
          color="text.primary"
          gutterBottom
        >
          {decisionOpen ? REVIEW_TEXTS.decisionTitle : REVIEW_TEXTS.noDecisionTitle}
        </Typography>

        {decisionOpen ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {REVIEW_TEXTS.decisionHint}
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={10}
              label={REVIEW_TEXTS.feedbackLabel}
              placeholder={REVIEW_TEXTS.feedbackPlaceholder}
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              inputRef={feedbackInputRef}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  maxLength: LESSON_ACTION_NOTE_MAX_LENGTH,
                  'data-testid': 'ai-lesson-review-feedback-input',
                },
              }}
              helperText={`${feedback.length}/${LESSON_ACTION_NOTE_MAX_LENGTH} · só é enviado ao devolver o item`}
              sx={{ mb: 2 }}
            />

            <Stack spacing={1.25}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                startIcon={<ApproveIcon />}
                data-testid="ai-lesson-review-approve"
                disabled={approveDisabled}
                onClick={onApprove}
                sx={{ borderRadius: 2.5, fontWeight: 800, minHeight: 48, textTransform: 'none' }}
              >
                {approving
                  ? 'Gerando o PDF e aprovando…'
                  : stageApproved
                    ? REVIEW_TEXTS.approved
                    : REVIEW_TEXTS.approve}
              </Button>
              {approving && (
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
              {approvePdfErrorMessage && (
                <Alert
                  data-testid="ai-lesson-review-approve-pdf-error"
                  severity="error"
                  onClose={onDismissApprovePdfError}
                  sx={{ '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {approvePdfErrorMessage}
                  </Typography>
                  <Button
                    data-testid="ai-lesson-review-approve-pdf-error-preview"
                    color="inherit"
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdf />}
                    disabled={previewDisabled}
                    onClick={onOpenPreview}
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
                disabled={requestChangesDisabled}
                data-testid="ai-lesson-review-request-changes"
                onClick={onRequestChanges}
                sx={{ borderRadius: 2.5, fontWeight: 700, minHeight: 44, textTransform: 'none' }}
              >
                {requestingChanges ? 'Devolvendo…' : REVIEW_TEXTS.requestChanges}
              </Button>
              {canRequestChanges && !feedback.trim() && (
                <Typography
                  data-testid="ai-lesson-review-feedback-needed"
                  variant="caption"
                  color="text.secondary"
                >
                  {REVIEW_TEXTS.feedbackNeeded}
                </Typography>
              )}
              {showReopen && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  startIcon={<ChangesIcon />}
                  disabled={reopenDisabled}
                  data-testid="ai-lesson-review-reopen"
                  onClick={onReopen}
                  sx={{ borderRadius: 2.5, fontWeight: 700, minHeight: 44, textTransform: 'none' }}
                >
                  {reopening ? 'Reabrindo…' : REVIEW_TEXTS.reopen}
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
              {nextPending && (
                <Button
                  fullWidth
                  data-testid="ai-lesson-review-next-pending"
                  endIcon={<NextIcon />}
                  onClick={() => onSelectStage(nextPending)}
                  sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }}
                >
                  {REVIEW_TEXTS.nextPending} ({pendingCount})
                </Button>
              )}
            </Stack>
          </>
        ) : (
          // Publicada, arquivada ou ainda em produção: não há o que decidir aqui.
          <Typography
            data-testid="ai-lesson-review-block-reason"
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            {blockReason}
          </Typography>
        )}

        <Box sx={{ mt: decisionOpen ? 2 : 0 }}>
          <LessonCommentsPanel
            data-testid="ai-lesson-review-comments-history"
            title="Histórico de observações deste item"
            comments={comments}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
