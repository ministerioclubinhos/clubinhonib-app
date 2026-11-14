import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import type { ProfileAlert } from '@/features/profile/hooks';
import { usePhotoCommentNotifications } from '@/features/feed-photo-comments/notification-hooks';
import { PhotoCommentNotificationDialog } from '@/features/feed-photo-comments/components/PhotoCommentNotificationDialog';
import type { PhotoCommentNotification } from '@/features/feed-photo-comments/types';
import { formatPhotoCommentDate } from '@/features/feed-photo-comments/utils';
import { extractErrorMessage } from '@/utils/apiError';
import type { CompleteProfileAlertProps } from './types';

export default function CompleteProfileAlert({
  alerts,
  userId,
  photoNotificationsEnabled,
  onAlertClick,
}: CompleteProfileAlertProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<PhotoCommentNotification | null>(null);
  const { notifications, markRead } = usePhotoCommentNotifications(
    userId,
    photoNotificationsEnabled
  );
  const notices = photoNotificationsEnabled
    ? (notifications.data?.pages.flatMap((page) => page.data) ?? [])
    : [];
  const unreadCount = photoNotificationsEnabled
    ? (notifications.data?.pages[0]?.unreadCount ?? 0)
    : 0;
  const count = alerts.length + unreadCount;
  const handleAlert = (alert: ProfileAlert) => {
    setAnchorEl(null);
    if (alert.action) alert.action();
    else {
      onAlertClick?.();
      if (alert.to) navigate(alert.to);
    }
  };
  const handleRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
      setSelected(null);
    } catch {
      /* The dialog retains the notification and renders the retryable error. */
    }
  };
  return (
    <Box data-testid="nav-bar-complete-profile-alert" sx={{ display: 'flex' }}>
      <Tooltip title="Notificações" arrow>
        <IconButton
          data-testid="nav-bar-notifications-bell"
          aria-label={count ? `Notificações, ${count} não lidas` : 'Notificações'}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            if (photoNotificationsEnabled) void notifications.refetch();
          }}
          sx={{ color: '#fff', minWidth: 44, minHeight: 44 }}
        >
          <Badge
            data-testid="nav-bar-notifications-count"
            color="error"
            badgeContent={count}
            max={99}
          >
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        data-testid="nav-bar-notifications-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: '75dvh',
            borderRadius: 2,
          },
        }}
      >
        <Typography
          component="li"
          role="presentation"
          sx={{ px: 2, py: 1.5, fontWeight: 700, borderBottom: 1, borderColor: 'divider' }}
        >
          Notificações
        </Typography>
        {alerts.map((alert) => (
          <MenuItem
            key={alert.id}
            data-testid={`nav-bar-profile-alert-${alert.id}`}
            onClick={() => handleAlert(alert)}
            sx={{ whiteSpace: 'normal', minHeight: 44, py: 1.5 }}
          >
            <ListItemText primary={alert.message} />
          </MenuItem>
        ))}
        {photoNotificationsEnabled && notifications.isPending && (
          <Box
            component="li"
            role="status"
            data-testid="nav-bar-notifications-loading"
            sx={{ p: 2, display: 'flex', gap: 1 }}
          >
            <CircularProgress size={20} />
            Carregando avisos...
          </Box>
        )}
        {photoNotificationsEnabled && notifications.isError && (
          <Box
            component="li"
            role="presentation"
            data-testid="nav-bar-notifications-error"
            sx={{ p: 2 }}
          >
            <Typography role="alert" variant="body2">
              Não foi possível atualizar os avisos.
            </Typography>
            <Button
              disabled={notifications.isFetching}
              onClick={() => {
                void notifications.refetch();
              }}
              sx={{ minHeight: 44 }}
            >
              Tentar novamente
            </Button>
          </Box>
        )}
        {!alerts.length &&
          !notices.length &&
          (!photoNotificationsEnabled || (!notifications.isPending && !notifications.isError)) && (
            <Typography
              component="li"
              role="status"
              data-testid="nav-bar-notifications-empty"
              sx={{ p: 2, color: 'text.secondary' }}
            >
              Você não tem notificações.
            </Typography>
          )}
        {notices.map((notice) => (
          <MenuItem
            key={notice.id}
            data-testid={`nav-bar-photo-notification-${notice.id}`}
            onClick={() => {
              markRead.reset();
              setSelected(notice);
              setAnchorEl(null);
            }}
            sx={{
              alignItems: 'flex-start',
              whiteSpace: 'normal',
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: notice.readAt ? undefined : 'action.selected',
              minHeight: 44,
            }}
          >
            <ListItemText
              disableTypography
              primary={
                <Typography sx={{ fontWeight: notice.readAt ? 500 : 700, fontSize: '0.9rem' }}>
                  {!notice.readAt && (
                    <Box
                      component="span"
                      aria-label="Não lida"
                      sx={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        mr: 1,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                  )}
                  Seu comentário foi reprovado
                </Typography>
              }
              secondary={
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflowWrap: 'anywhere',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5,
                    }}
                  >
                    Motivo: {notice.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatPhotoCommentDate(notice.createdAt)}
                  </Typography>
                </>
              }
            />
          </MenuItem>
        ))}
        {photoNotificationsEnabled && notifications.hasNextPage && (
          <MenuItem
            data-testid="nav-bar-notifications-load-more"
            disabled={notifications.isFetching}
            onClick={() => {
              void notifications.fetchNextPage();
            }}
            sx={{ minHeight: 44, justifyContent: 'center' }}
          >
            {notifications.isFetching ? 'Carregando...' : 'Carregar mais'}
          </MenuItem>
        )}
      </Menu>
      <PhotoCommentNotificationDialog
        notification={photoNotificationsEnabled ? selected : null}
        pending={markRead.isPending}
        error={
          markRead.error
            ? extractErrorMessage(
                markRead.error,
                'Não foi possível marcar como lida. Tente novamente.'
              )
            : null
        }
        onClose={() => setSelected(null)}
        onRead={handleRead}
      />
    </Box>
  );
}
