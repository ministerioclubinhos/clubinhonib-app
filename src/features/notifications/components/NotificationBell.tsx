import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { NOTIFICATION_COPY, NOTIFICATIONS_BADGE_MAX, NOTIFICATIONS_TOUCH_TARGET } from '../constants';
import { bellCount } from '../utils';
import { useNotificationCenter } from './NotificationContext';
import { NotificationCenter } from './NotificationCenter';
import type { NotificationBellProps } from './types';

/**
 * Sino da barra superior. O contador soma avisos não lidos e pendências; o
 * nome acessível diferencia os dois. Em erro de rede, mantém o último valor.
 */
export function NotificationBell({ color = '#fff' }: NotificationBellProps) {
  const center = useNotificationCenter();
  if (!center.enabled) return null;
  const pending = center.pendingItems.length;
  const count = bellCount(center.unreadCount, pending);
  return (
    <Box data-testid="nav-bar-notifications" sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={NOTIFICATION_COPY.title} arrow>
        <IconButton
          data-testid="nav-bar-notifications-bell"
          aria-label={NOTIFICATION_COPY.bellLabel(center.unreadCount, pending)}
          aria-haspopup="dialog"
          aria-expanded={center.centerOpen}
          onClick={(event) => {
            if (center.centerOpen) center.closeCenter();
            else {
              center.openCenter(event.currentTarget);
              center.refresh();
            }
          }}
          sx={{
            color,
            minWidth: NOTIFICATIONS_TOUCH_TARGET,
            minHeight: NOTIFICATIONS_TOUCH_TARGET,
            '@media (prefers-reduced-motion: no-preference)': center.pulse
              ? {
                  animation: 'clubinho-bell-ring 0.8s ease-in-out 2',
                  '@keyframes clubinho-bell-ring': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '25%': { transform: 'rotate(14deg)' },
                    '75%': { transform: 'rotate(-14deg)' },
                  },
                }
              : {},
          }}
        >
          <Badge
            data-testid="nav-bar-notifications-count"
            color="error"
            badgeContent={count}
            max={NOTIFICATIONS_BADGE_MAX}
            invisible={count === 0}
          >
            {center.pulse ? <NotificationsActiveOutlinedIcon /> : <NotificationsOutlinedIcon />}
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationCenter />
    </Box>
  );
}
