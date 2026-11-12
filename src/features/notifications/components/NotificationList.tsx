import { useEffect, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Skeleton, Typography } from '@mui/material';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import {
  NOTIFICATION_COPY,
  NOTIFICATIONS_NOW_TICK_MS,
  NOTIFICATIONS_SKELETON_ROWS,
  NOTIFICATIONS_TOUCH_TARGET,
} from '../constants';
import { NotificationCenterFilter } from '../types';
import { NotificationItem } from './NotificationItem';
import type { NotificationListProps } from './types';

function emptyCopy(filter: NotificationCenterFilter): string {
  if (filter === NotificationCenterFilter.UNREAD) return NOTIFICATION_COPY.emptyUnread;
  if (filter === NotificationCenterFilter.PENDING) return NOTIFICATION_COPY.emptyPending;
  return NOTIFICATION_COPY.emptyAll;
}

const sectionTitleSx = {
  px: 2,
  pt: 1.5,
  pb: 0.5,
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const;

export function NotificationList(props: NotificationListProps) {
  const {
    filter,
    pendingItems,
    items,
    showNotices,
    loading,
    error,
    fetching,
    offline,
    hasNextPage,
    fetchingNextPage,
  } = props;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), NOTIFICATIONS_NOW_TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const showPending = filter !== NotificationCenterFilter.UNREAD && pendingItems.length > 0;
  const noticesVisible = filter !== NotificationCenterFilter.PENDING && showNotices;
  const isEmpty =
    !showPending &&
    (filter === NotificationCenterFilter.PENDING ||
      !noticesVisible ||
      (!loading && !error && items.length === 0));

  return (
    <Box data-testid="notifications-list">
      {offline && (
        <Alert
          data-testid="notifications-offline"
          severity="info"
          icon={<WifiOffIcon fontSize="small" />}
          sx={{ m: 1.5 }}
        >
          {NOTIFICATION_COPY.offline}
        </Alert>
      )}

      {showPending && (
        <Box component="section" aria-labelledby="notifications-pending-title">
          <Typography id="notifications-pending-title" component="h3" sx={sectionTitleSx}>
            {NOTIFICATION_COPY.pendingSection}
          </Typography>
          <Box component="ul" sx={{ m: 0, p: 0 }}>
            {pendingItems.map((item) => (
              <Box component="li" key={item.id} sx={{ listStyle: 'none' }}>
                <ButtonBase
                  data-testid={`notifications-pending-${item.id}`}
                  onClick={() => props.onResolvePending(item)}
                  sx={{
                    width: '100%',
                    minHeight: NOTIFICATIONS_TOUCH_TARGET,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    textAlign: 'left',
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&.Mui-focusVisible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: -2,
                    },
                  }}
                >
                  <AssignmentLateOutlinedIcon aria-hidden color="action" />
                  <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>
                    {item.message}
                  </Typography>
                  <ChevronRightIcon aria-hidden color="action" />
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {noticesVisible && (
        <Box component="section" aria-labelledby="notifications-notices-title">
          {(showPending || items.length > 0) && (
            <Typography id="notifications-notices-title" component="h3" sx={sectionTitleSx}>
              {NOTIFICATION_COPY.noticesSection}
            </Typography>
          )}
          {loading && (
            <Box data-testid="notifications-loading" role="status" aria-label={NOTIFICATION_COPY.loading}>
              {Array.from({ length: NOTIFICATIONS_SKELETON_ROWS }, (_, index) => (
                <Box key={index} sx={{ px: 2, py: 1.5 }}>
                  <Skeleton width="70%" />
                  <Skeleton width="90%" />
                </Box>
              ))}
            </Box>
          )}
          {error && (
            <Box data-testid="notifications-error" sx={{ px: 2, py: 1.5 }}>
              <Typography role="alert" variant="body2">
                {NOTIFICATION_COPY.error}
              </Typography>
              <Button
                data-testid="notifications-retry"
                disabled={fetching}
                onClick={props.onRetry}
                sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET, mt: 0.5 }}
              >
                {NOTIFICATION_COPY.retry}
              </Button>
            </Box>
          )}
          {items.length > 0 && (
            <Box component="ul" sx={{ m: 0, p: 0 }}>
              {items.map((item) => (
                <NotificationItem key={item.id} item={item} now={now} onOpen={props.onOpen} />
              ))}
            </Box>
          )}
          {hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <Button
                data-testid="notifications-load-more"
                disabled={fetchingNextPage}
                onClick={props.onLoadMore}
                sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
              >
                {fetchingNextPage ? NOTIFICATION_COPY.loadingMore : NOTIFICATION_COPY.loadMore}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {isEmpty && (
        <Typography
          data-testid="notifications-empty"
          role="status"
          sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}
        >
          {emptyCopy(filter)}
        </Typography>
      )}
    </Box>
  );
}
