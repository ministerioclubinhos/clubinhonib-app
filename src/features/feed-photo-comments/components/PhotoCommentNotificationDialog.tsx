import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { PhotoCommentNotificationDialogProps } from '../types';
import { PHOTO_COMMENTS_TOUCH_TARGET } from '../constants';
import { formatPhotoCommentDate } from '../utils';

export function PhotoCommentNotificationDialog({
  notification,
  pending,
  error,
  onClose,
  onRead,
}: PhotoCommentNotificationDialogProps) {
  return (
    <Dialog
      data-testid="feed-photo-comment-notification-dialog"
      open={Boolean(notification)}
      onClose={() => {
        if (!pending) onClose();
      }}
      fullWidth
      maxWidth="sm"
      aria-labelledby="photo-notification-title"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 3 },
          width: { xs: 'calc(100% - 16px)', sm: '100%' },
          maxHeight: 'calc(100dvh - 16px)',
        },
      }}
    >
      <DialogTitle id="photo-notification-title">Seu comentário foi reprovado</DialogTitle>
      {notification && (
        <>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary">
              {formatPhotoCommentDate(notification.createdAt)}
            </Typography>
            <Typography sx={{ mt: 2, fontWeight: 700 }}>Comentário na foto do feed</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', my: 1 }}>
              {notification.commentText}
            </Typography>
            <Alert
              data-testid="feed-photo-comment-notification-reason"
              severity="warning"
              sx={{ mt: 2, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
            >
              <Typography component="span" sx={{ display: 'block', fontWeight: 700 }}>
                Motivo da reprovação
              </Typography>
              {notification.reason}
            </Alert>
            {error && (
              <Alert
                data-testid="feed-photo-comment-notification-error"
                severity="error"
                sx={{ mt: 2 }}
              >
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={onClose}
              disabled={pending}
              sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
            >
              Fechar
            </Button>
            {!notification.readAt && (
              <Button
                data-testid="feed-photo-comment-notification-read"
                variant="contained"
                color="success"
                disabled={pending}
                sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
                onClick={() => {
                  void onRead(notification.id);
                }}
              >
                {pending ? 'Salvando...' : 'Entendi'}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
