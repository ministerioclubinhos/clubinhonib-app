import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { extractErrorMessage, getHttpStatus } from '@/utils/apiError';
import {
  NOTIFICATION_COPY,
  NOTIFICATION_FILTER_LABELS,
  NOTIFICATION_FILTERS,
  NOTIFICATION_FILTER_STATUS,
  NOTIFICATIONS_ROUTE,
  NOTIFICATIONS_TOUCH_TARGET,
} from '../constants';
import { useNotificationDetail } from '../hooks/useNotificationDetail';
import { useNotificationMutations } from '../hooks/useNotificationMutations';
import { useNotifications } from '../hooks/useNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  NotificationCenterFilter,
  NotificationCenterView,
  NotificationPanelVariant,
  NotificationStatusFilter,
} from '../types';
import { isNotificationId, isTerminalStatus } from '../utils';
import { useNotificationCenter } from './NotificationContext';
import { NotificationDetail } from './NotificationDetail';
import { NotificationList } from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import type { NotificationPanelProps } from './types';

/**
 * Conteúdo único da central, usado no painel do desktop, na tela cheia do
 * celular e na página `/notificacoes`. A lista continua montada (oculta)
 * durante o detalhe, preservando filtro e rolagem ao voltar.
 */
export function NotificationPanel({ variant, onClose, selectedId, onSelect }: NotificationPanelProps) {
  const center = useNotificationCenter();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [filter, setFilter] = useState(NotificationCenterFilter.ALL);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localId, setLocalId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const lastOpened = useRef<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const currentId = selectedId !== undefined ? selectedId : localId;
  const select = (id: string | null) => (onSelect ? onSelect(id) : setLocalId(id));
  const view = currentId
    ? NotificationCenterView.DETAIL
    : settingsOpen
      ? NotificationCenterView.SETTINGS
      : NotificationCenterView.LIST;

  const status =
    filter === NotificationCenterFilter.PENDING
      ? NotificationStatusFilter.ALL
      : NOTIFICATION_FILTER_STATUS[filter];
  const { query, items } = useNotifications(
    center.userId,
    status,
    center.historyEnabled && filter !== NotificationCenterFilter.PENDING
  );
  const detail = useNotificationDetail(center.userId, currentId, center.historyEnabled);
  const { markRead, markAllRead } = useNotificationMutations(center.userId);

  const detailStatus = getHttpStatus(detail.error);
  const detailUnavailable =
    Boolean(currentId) &&
    (!isNotificationId(currentId) ||
      !center.historyEnabled ||
      (detail.isError && isTerminalStatus(detailStatus)));

  // O foco nunca fica solto quando um bloco some: sem ele, Escape e Tab
  // deixam de funcionar dentro do painel.
  const focusTitle = () =>
    root.current?.querySelector<HTMLElement>('#notifications-center-title')?.focus();

  // Foco: ação "Voltar" ao abrir o detalhe; item de origem ao voltar (ou o
  // título, se o item saiu da lista filtrada).
  useEffect(() => {
    if (view === NotificationCenterView.DETAIL) {
      root.current?.querySelector<HTMLElement>('[data-testid="notifications-detail-back"]')?.focus();
      return;
    }
    if (view !== NotificationCenterView.LIST || !lastOpened.current) return;
    const origin = root.current?.querySelector<HTMLElement>(
      `[data-testid="notifications-item-open-${lastOpened.current}"]`
    );
    if (origin) origin.focus();
    else focusTitle();
  }, [view, detail.data, items]);

  const openItem = (id: string) => {
    lastOpened.current = id;
    markRead.reset();
    select(id);
  };
  const back = () => {
    markRead.reset();
    if (currentId) select(null);
    else setSettingsOpen(false);
  };
  const read = (id: string) => {
    markRead.mutate(id, { onSuccess: () => select(null) });
  };
  const readAll = () => {
    setBulkMessage(null);
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        setConfirmAll(false);
        setBulkMessage(NOTIFICATION_COPY.markAllDone);
        focusTitle();
      },
      onError: () => {
        setConfirmAll(false);
        setBulkMessage(NOTIFICATION_COPY.markAllError);
        focusTitle();
      },
    });
  };

  const total = center.unreadCount + center.pendingItems.length;
  const isPage = variant === NotificationPanelVariant.PAGE;

  return (
    <Box
      ref={root}
      data-testid="notifications-center"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: isPage ? 'auto' : '100%',
        maxHeight: '100%',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          minHeight: 56,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        {view !== NotificationCenterView.LIST && (
          <IconButton
            data-testid="notifications-back"
            aria-label={NOTIFICATION_COPY.back}
            onClick={back}
            sx={{ minWidth: NOTIFICATIONS_TOUCH_TARGET, minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography
          id="notifications-center-title"
          component="h2"
          tabIndex={-1}
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            ml: view === NotificationCenterView.LIST ? 1 : 0,
            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          }}
        >
          {view === NotificationCenterView.SETTINGS ? NOTIFICATION_COPY.settings : NOTIFICATION_COPY.title}
        </Typography>
        {view === NotificationCenterView.LIST && total > 0 && (
          <Chip data-testid="notifications-total" size="small" color="error" label={total} />
        )}
        <Box sx={{ flex: 1 }} />
        {view === NotificationCenterView.LIST && (
          <Tooltip title={NOTIFICATION_COPY.settings}>
            <IconButton
              data-testid="notifications-settings-open"
              aria-label={NOTIFICATION_COPY.settings}
              onClick={() => setSettingsOpen(true)}
              sx={{ minWidth: NOTIFICATIONS_TOUCH_TARGET, minHeight: NOTIFICATIONS_TOUCH_TARGET }}
            >
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>
        )}
        {onClose && (
          <IconButton
            data-testid="notifications-close"
            aria-label={NOTIFICATION_COPY.close}
            onClick={onClose}
            sx={{ minWidth: NOTIFICATIONS_TOUCH_TARGET, minHeight: NOTIFICATIONS_TOUCH_TARGET }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {view === NotificationCenterView.LIST && (
        <Box sx={{ px: 1.5, py: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <ToggleButtonGroup
            data-testid="notifications-filters"
            exclusive
            size="small"
            value={filter}
            aria-label="Filtrar notificações"
            onChange={(_, next: NotificationCenterFilter | null) => {
              if (next) setFilter(next);
            }}
            sx={{ width: '100%' }}
          >
            {NOTIFICATION_FILTERS.map((option) => (
              <ToggleButton
                key={option}
                value={option}
                data-testid={`notifications-filter-${option}`}
                sx={{ flex: 1, minHeight: NOTIFICATIONS_TOUCH_TARGET, textTransform: 'none' }}
              >
                {NOTIFICATION_FILTER_LABELS[option]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}

      <Box
        data-testid="notifications-body"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: isPage ? 'visible' : 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Box sx={{ display: view === NotificationCenterView.LIST ? 'block' : 'none' }}>
          <NotificationList
            filter={filter}
            pendingItems={center.pendingItems}
            items={items}
            showNotices={center.historyEnabled}
            loading={query.isPending && query.fetchStatus !== 'idle'}
            error={query.isError}
            fetching={query.isFetching}
            offline={!online}
            hasNextPage={query.hasNextPage}
            fetchingNextPage={query.isFetchingNextPage}
            onRetry={() => {
              void query.refetch();
            }}
            onLoadMore={() => {
              void query.fetchNextPage();
            }}
            onOpen={openItem}
            onResolvePending={center.resolvePending}
          />
        </Box>
        {view === NotificationCenterView.DETAIL && (
          <NotificationDetail
            notification={detailUnavailable ? undefined : detail.data}
            loading={!detailUnavailable && detail.isPending && detail.fetchStatus !== 'idle'}
            unavailable={detailUnavailable}
            error={detail.isError}
            readPending={markRead.isPending}
            readError={markRead.error ? extractErrorMessage(markRead.error, NOTIFICATION_COPY.readError) : null}
            onBack={back}
            onRetry={() => {
              void detail.refetch();
            }}
            onRead={read}
          />
        )}
        {view === NotificationCenterView.SETTINGS && <NotificationSettings />}
      </Box>

      {view === NotificationCenterView.LIST && (
        <Box
          component="footer"
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            px: 1.5,
            py: 1,
            flexShrink: 0,
            bgcolor: 'background.paper',
            pb: isPage ? 1 : 'max(env(safe-area-inset-bottom), 8px)',
          }}
        >
          {bulkMessage && (
            <Alert
              data-testid="notifications-mark-all-result"
              severity={markAllRead.isError ? 'error' : 'success'}
              onClose={() => setBulkMessage(null)}
              sx={{ mb: 1 }}
            >
              {bulkMessage}
            </Alert>
          )}
          {confirmAll ? (
            <Box data-testid="notifications-mark-all-confirm">
              <Typography variant="body2" sx={{ mb: 1 }}>
                {NOTIFICATION_COPY.markAllConfirm(center.unreadCount)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  data-testid="notifications-mark-all-cancel"
                  disabled={markAllRead.isPending}
                  onClick={() => {
                    setConfirmAll(false);
                    focusTitle();
                  }}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {NOTIFICATION_COPY.cancel}
                </Button>
                <Button
                  data-testid="notifications-mark-all-submit"
                  variant="contained"
                  color="success"
                  disabled={markAllRead.isPending}
                  onClick={readAll}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {markAllRead.isPending ? NOTIFICATION_COPY.saving : NOTIFICATION_COPY.confirm}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {!isPage ? (
                <Button
                  data-testid="notifications-see-all"
                  onClick={() => {
                    onClose?.();
                    navigate(NOTIFICATIONS_ROUTE);
                  }}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {NOTIFICATION_COPY.seeAll}
                </Button>
              ) : (
                <span />
              )}
              {center.historyEnabled && center.unreadCount > 0 && (
                <Button
                  data-testid="notifications-mark-all"
                  onClick={() => {
                    setBulkMessage(null);
                    setConfirmAll(true);
                  }}
                  sx={{ minHeight: NOTIFICATIONS_TOUCH_TARGET }}
                >
                  {NOTIFICATION_COPY.markAll}
                </Button>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
