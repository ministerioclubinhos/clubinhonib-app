import { Box, ButtonBase, Typography } from '@mui/material';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import { NOTIFICATION_COPY, NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import { formatFullDate, formatRelativeTime } from '../utils';
import type { NotificationItemProps } from './types';

export function NotificationItem({ item, now, onOpen }: NotificationItemProps) {
  const unread = !item.readAt;
  return (
    <Box component="li" data-testid={`notifications-item-${item.id}`} sx={{ listStyle: 'none' }}>
      <ButtonBase
        data-testid={`notifications-item-open-${item.id}`}
        onClick={() => onOpen(item.id)}
        aria-label={`${item.title}${unread ? `, ${NOTIFICATION_COPY.unread}` : ''}`}
        sx={{
          width: '100%',
          minHeight: NOTIFICATIONS_TOUCH_TARGET,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.5,
          textAlign: 'left',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: unread ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
        }}
      >
        <FeedbackOutlinedIcon
          aria-hidden
          color={unread ? 'warning' : 'disabled'}
          sx={{ mt: 0.25, flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: unread ? 700 : 500,
              fontSize: '0.92rem',
              overflowWrap: 'anywhere',
            }}
          >
            {unread && (
              <Box
                component="span"
                data-testid={`notifications-item-unread-${item.id}`}
                aria-hidden
                sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }}
              />
            )}
            {item.title}
          </Typography>
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
              mt: 0.25,
            }}
          >
            {item.preview}
          </Typography>
          <Typography
            component="time"
            variant="caption"
            color="text.secondary"
            dateTime={item.createdAt}
            title={formatFullDate(item.createdAt)}
            sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}
          >
            {formatRelativeTime(item.createdAt, now)}
            {unread ? ` · ${NOTIFICATION_COPY.unread}` : ''}
          </Typography>
        </Box>
      </ButtonBase>
    </Box>
  );
}
