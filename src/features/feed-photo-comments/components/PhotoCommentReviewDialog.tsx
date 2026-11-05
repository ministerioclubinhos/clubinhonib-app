import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  PHOTO_COMMENT_REASON_MAX_LENGTH,
  PHOTO_COMMENT_STATUS_COLORS,
  PHOTO_COMMENT_STATUS_LABELS,
  PHOTO_COMMENTS_TOUCH_TARGET,
} from '../constants';
import { PhotoCommentStatus, type PhotoCommentReviewDialogProps } from '../types';
import { formatPhotoCommentDate, getPhotoCommentPreviewUrl } from '../utils';

export function PhotoCommentReviewDialog({
  comment,
  pending,
  error,
  onClose,
  onModerate,
}: PhotoCommentReviewDialogProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);
  return (
    <Dialog
      data-testid="feed-photo-comment-review-dialog"
      open={Boolean(comment)}
      onClose={() => {
        if (!pending) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="feed-photo-comment-review-title"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 3 },
          width: { xs: 'calc(100% - 16px)', sm: '100%' },
          maxHeight: 'calc(100dvh - 16px)',
        },
      }}
    >
      <DialogTitle id="feed-photo-comment-review-title">Revisar comentário da foto</DialogTitle>
      {comment && (
        <>
          <DialogContent dividers>
            <Box
              component="img"
              src={getPhotoCommentPreviewUrl(comment)}
              alt={comment.photoTitle || comment.sectionCaption}
              sx={{
                width: '100%',
                maxHeight: 260,
                objectFit: 'contain',
                borderRadius: 2,
                bgcolor: 'grey.100',
              }}
            />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              {comment.sectionCaption}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 2 }}
            >
              <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere', minWidth: 0 }}>
                {comment.authorName}
              </Typography>
              <Chip
                label={PHOTO_COMMENT_STATUS_LABELS[comment.status]}
                color={PHOTO_COMMENT_STATUS_COLORS[comment.status]}
                size="small"
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatPhotoCommentDate(comment.createdAt)}
            </Typography>
            <Typography
              data-testid="feed-photo-comment-review-text"
              sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.7, my: 2 }}
            >
              {comment.text}
            </Typography>
            {comment.reviewedAt && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Última revisão: {comment.moderatedByName ?? 'Administrador'} ·{' '}
                {formatPhotoCommentDate(comment.reviewedAt)}
              </Typography>
            )}
            {comment.moderationReason && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Motivo anterior: {comment.moderationReason}
              </Alert>
            )}
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Motivo da reprovação"
              error={reasonError}
              value={reason}
              disabled={pending}
              onChange={(event) => {
                setReason(event.target.value);
                setReasonError(false);
              }}
              inputProps={{ maxLength: PHOTO_COMMENT_REASON_MAX_LENGTH }}
              helperText={
                reasonError
                  ? 'Informe o motivo antes de reprovar.'
                  : 'Obrigatório para reprovar. O autor receberá este motivo na notificação.'
              }
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
            <Button
              type="button"
              disabled={pending}
              onClick={onClose}
              sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
            >
              Fechar
            </Button>
            <Button
              data-testid="feed-photo-comment-reject"
              type="button"
              color="error"
              variant="outlined"
              disabled={pending || comment.status === PhotoCommentStatus.REJECTED}
              onClick={() => {
                if (!reason.trim()) {
                  setReasonError(true);
                  return;
                }
                void onModerate(comment, PhotoCommentStatus.REJECTED, reason.trim());
              }}
              sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET, textTransform: 'none' }}
            >
              {comment.status === PhotoCommentStatus.APPROVED
                ? 'Retirar publicação'
                : 'Não aprovar'}
            </Button>
            <Button
              data-testid="feed-photo-comment-approve"
              type="button"
              color="success"
              variant="contained"
              disabled={pending || comment.status === PhotoCommentStatus.APPROVED}
              onClick={() => {
                void onModerate(comment, PhotoCommentStatus.APPROVED);
              }}
              sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET, textTransform: 'none' }}
            >
              {pending ? 'Salvando...' : 'Aprovar e publicar'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
