import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { NOTIFICATION_COPY, NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import { NotificationType } from '../types';
import { formatFullDate } from '../utils';
import type { NotificationDetailProps } from './types';

/**
 * Detalhe dentro da própria central (sem empilhar modais). Abrir e fechar não
 * marcam leitura: só “Entendi” persiste `readAt`.
 */
export function NotificationDetail({
  notification,
  loading,
  unavailable,
  error,
  readPending,
  readError,
  onBack,
  onRetry,
  onRead,
}: NotificationDetailProps) {
  return (
    <Box data-testid="notifications-detail" sx={{ p: 2 }}>
      {loading && (
        <Box role="status" data-testid="notifications-detail-loading" sx={{ display: 'flex', gap: 1 }}>
          <CircularProgress size={20} />
          {NOTIFICATION_COPY.loading}
        </Box>
      )}
      {unavailable && (
        <Alert data-testid="notifications-detail-unavailable" severity="info">
          {NOTIFICATION_COPY.detailUnavailable}
        </Alert>
      )}
      {error && !unavailable && (
        <Alert
          data-testid="notifications-detail-error"
          severity="error"
          action={
            <Button color="inherit" onClick={onRetry} sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}>
              {NOTIFICATION_COPY.retry}
            </Button>
          }
        >
          {NOTIFICATION_COPY.detailError}
        </Alert>
      )}
      {notification && (
        <>
          <Typography
            id="notifications-detail-title"
            component="h3"
            variant="h6"
            sx={{ fontSize: '1.05rem', fontWeight: 700, overflowWrap: 'anywhere' }}
          >
            {notification.title}
          </Typography>
          <Typography
            component="time"
            dateTime={notification.createdAt}
            variant="body2"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5 }}
          >
            {formatFullDate(notification.createdAt)}
          </Typography>
          {notification.details.type === NotificationType.FEED_COMMENT_REJECTED && (
            <>
              <Typography sx={{ mt: 2, fontWeight: 700 }}>{NOTIFICATION_COPY.commentLabel}</Typography>
              <Typography
                data-testid="notifications-detail-comment"
                sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', my: 1 }}
              >
                {notification.details.commentText}
              </Typography>
              <Alert
                data-testid="notifications-detail-reason"
                severity="warning"
                sx={{ mt: 2, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
              >
                <Typography component="span" sx={{ display: 'block', fontWeight: 700 }}>
                  {NOTIFICATION_COPY.reasonLabel}
                </Typography>
                {notification.details.reason}
              </Alert>
            </>
          )}
          {readError && (
            <Alert data-testid="notifications-detail-read-error" severity="error" sx={{ mt: 2 }}>
              {readError}
            </Alert>
          )}
        </>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <Button
          data-testid="notifications-detail-back"
          onClick={onBack}
          disabled={readPending}
          sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
        >
          {NOTIFICATION_COPY.back}
        </Button>
        {notification && !notification.readAt && (
          <Button
            data-testid="notifications-detail-read"
            variant="contained"
            color="success"
            disabled={readPending}
            onClick={() => onRead(notification.id)}
            sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          >
            {readPending ? NOTIFICATION_COPY.saving : NOTIFICATION_COPY.markRead}
          </Button>
        )}
      </Box>
    </Box>
  );
}
