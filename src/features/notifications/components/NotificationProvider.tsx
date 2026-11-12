import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RootState } from '@/store/slices';
import { useProfileAlerts } from '@/features/profile/hooks';
import { FEATURE } from '@/features/feature-flags/features';
import { useFeatureFlags } from '@/hooks';
import LinkClubModal from '@/features/auth/components/LinkClubModal';
import { usePendingItems } from '../adapters/profileAlertsAdapter';
import { NOTIFICATION_COPY, NOTIFICATIONS_NEW_PULSE_MS } from '../constants';
import { notificationKeys } from '../queryKeys';
import { useNotificationDelivery } from '../hooks/useNotificationDelivery';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { useNotificationSummary } from '../hooks/useNotificationSummary';
import { browserNotificationService } from '../services/browserNotificationService';
import { notificationAudioService } from '../services/notificationAudioService';
import { clearProcessedMarks } from '../services/notificationTabCoordinator';
import {
  BrowserPermissionState,
  SoundPlayResult,
  type NotificationContextValue,
  type PendingItem,
} from '../types';
import { isWorkerOpenMessage } from '../utils';
import { NotificationContext } from './NotificationContext';

/**
 * Montado uma vez, dentro do `BrowserRouter`, acima da navbar e das rotas.
 * Fica inerte sem sessão elegível. Coordena os canais e o ciclo da sessão;
 * os dados da API ficam somente no cache do TanStack Query.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { user, isAuthenticated, initialized } = useSelector((state: RootState) => state.auth);
  const { flags, loading: flagsLoading } = useFeatureFlags();
  const profileAlerts = useProfileAlerts();

  const userId = isAuthenticated && user ? user.id : null;
  // Sem identidade resolvida ou flags carregando: nada de consulta, som ou prompt.
  const enabled =
    initialized && !flagsLoading && Boolean(userId) && flags[FEATURE.NOTIFICATION_CENTER_V2];
  const historyEnabled = enabled && Boolean(user?.active);
  const soundAvailable = enabled && flags[FEATURE.NOTIFICATION_SOUND];
  const browserAvailable = enabled && flags[FEATURE.BROWSER_NOTIFICATIONS];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [centerOpen, setCenterOpen] = useState(false);
  const [linkClubOpen, setLinkClubOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [permission, setPermission] = useState<BrowserPermissionState>(() =>
    browserNotificationService.permission()
  );
  const { preferences, update } = useNotificationPreferences(userId);

  const soundAllowed = soundAvailable && preferences.soundEnabled;
  const browserAllowed =
    browserAvailable &&
    preferences.browserNotificationsEnabled &&
    permission === BrowserPermissionState.GRANTED;

  const openLinkClub = useCallback(() => setLinkClubOpen(true), []);
  const pendingItems = usePendingItems({
    alerts: profileAlerts,
    role: user?.role ?? null,
    hasClub: Boolean(user?.teacherProfile?.club),
    clubLinkEnabled: flags[FEATURE.CLUB_LINK_REQUEST],
    onLinkClub: openLinkClub,
  });

  const [leaderState, setLeaderState] = useState(false);
  const summary = useNotificationSummary(userId, historyEnabled, browserAllowed && leaderState);

  const refetchSummary = summary.refetch;
  const delivery = useNotificationDelivery({
    userId,
    enabled: historyEnabled,
    summary: summary.data,
    centerOpen,
    soundAllowed,
    browserAllowed,
    onRemoteRevision: () => {
      void refetchSummary();
    },
    onAnnounce: () => {
      setAnnouncement(NOTIFICATION_COPY.newNotice);
      setPulse(true);
    },
  });
  useEffect(() => setLeaderState(delivery.isLeader), [delivery.isLeader]);

  useEffect(() => {
    if (!pulse) return;
    const timer = window.setTimeout(() => {
      setPulse(false);
      // Limpa para que o próximo aviso seja anunciado de novo.
      setAnnouncement('');
    }, NOTIFICATIONS_NEW_PULSE_MS);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  // Troca de conta/logout: cancela consultas, remove caches privados da conta
  // anterior, fecha conteúdo e para canais.
  const previousUser = useRef<string | null>(null);
  useEffect(() => {
    const previous = previousUser.current;
    previousUser.current = userId;
    if (previous && previous !== userId) {
      void client.cancelQueries({ queryKey: notificationKeys.user(previous) });
      client.removeQueries({ queryKey: notificationKeys.user(previous) });
      notificationAudioService.stop();
      void browserNotificationService.closeAll();
      clearProcessedMarks(previous);
      setCenterOpen(false);
      setAnchorEl(null);
      setLinkClubOpen(false);
      setAnnouncement('');
    }
  }, [userId, client]);

  // Histórico protegido sai da tela quando a conta deixa de ser elegível.
  useEffect(() => {
    if (historyEnabled || !userId) return;
    void client.cancelQueries({ queryKey: notificationKeys.user(userId) });
    client.removeQueries({ queryKey: notificationKeys.user(userId) });
    notificationAudioService.stop();
  }, [historyEnabled, userId, client]);

  // A permissão pode mudar fora do site: relê ao voltar o foco.
  useEffect(() => {
    if (!browserAvailable) return;
    void browserNotificationService.prepare();
    const reread = () => setPermission(browserNotificationService.permission());
    reread();
    window.addEventListener('focus', reread);
    document.addEventListener('visibilitychange', reread);
    return () => {
      window.removeEventListener('focus', reread);
      document.removeEventListener('visibilitychange', reread);
    };
  }, [browserAvailable]);

  // Clique no aviso do navegador: o worker só informa o caminho, revalidado aqui.
  useEffect(() => {
    if (!browserAvailable || !('serviceWorker' in navigator)) return;
    const onMessage = (event: MessageEvent<unknown>) => {
      if (isWorkerOpenMessage(event.data)) navigate(event.data.path);
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [browserAvailable, navigate]);

  const openCenter = useCallback((anchor: HTMLElement | null) => {
    setAnchorEl(anchor);
    setCenterOpen(true);
  }, []);
  const closeCenter = useCallback(() => {
    setCenterOpen(false);
  }, []);

  const resolvePending = useCallback(
    (item: PendingItem) => {
      // Fecha a central antes de abrir o modal: dois focos presos não se sobrepõem.
      setCenterOpen(false);
      if (item.action) item.action();
      else if (item.to) navigate(item.to);
    },
    [navigate]
  );

  const refresh = useCallback(() => {
    if (!userId) return;
    void client.invalidateQueries({ queryKey: notificationKeys.user(userId) });
  }, [client, userId]);

  const setDeliverySoundBlocked = delivery.setSoundBlocked;
  const setSoundEnabled = useCallback(
    async (next: boolean) => {
      if (!next) {
        notificationAudioService.stop();
        update({ soundEnabled: false });
        return;
      }
      // Liberação do áudio no próprio gesto de ativar.
      const unlocked = await notificationAudioService.unlock();
      update({ soundEnabled: true });
      setDeliverySoundBlocked(!unlocked);
    },
    [update, setDeliverySoundBlocked]
  );

  const testSound = useCallback(async () => {
    const result = await notificationAudioService.play(true);
    setDeliverySoundBlocked(result === SoundPlayResult.BLOCKED);
    return result;
  }, [setDeliverySoundBlocked]);

  const unlockSound = useCallback(async () => {
    setDeliverySoundBlocked(!(await notificationAudioService.unlock()));
  }, [setDeliverySoundBlocked]);

  const setBrowserEnabled = useCallback(
    async (next: boolean) => {
      if (!next) {
        update({ browserNotificationsEnabled: false });
        return browserNotificationService.permission();
      }
      let state = browserNotificationService.permission();
      if (state === BrowserPermissionState.DEFAULT)
        state = await browserNotificationService.requestPermission();
      setPermission(state);
      update({ browserNotificationsEnabled: state === BrowserPermissionState.GRANTED });
      return state;
    },
    [update]
  );

  const testBrowser = useCallback(() => browserNotificationService.showTest(), []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      enabled,
      historyEnabled,
      userId,
      unreadCount: historyEnabled ? (summary.data?.unreadCount ?? 0) : 0,
      pendingItems: enabled ? pendingItems : [],
      summaryError: historyEnabled && summary.isError,
      summaryLoading: historyEnabled && summary.isPending,
      pulse,
      centerOpen: enabled && centerOpen,
      anchorEl,
      openCenter,
      closeCenter,
      resolvePending,
      refresh,
      soundAvailable,
      browserAvailable,
      preferences,
      permission,
      soundBlocked: delivery.soundBlocked,
      setSoundEnabled,
      testSound,
      unlockSound,
      setBrowserEnabled,
      testBrowser,
    }),
    [
      enabled,
      historyEnabled,
      userId,
      summary.data?.unreadCount,
      summary.isError,
      summary.isPending,
      pendingItems,
      pulse,
      centerOpen,
      anchorEl,
      openCenter,
      closeCenter,
      resolvePending,
      refresh,
      soundAvailable,
      browserAvailable,
      preferences,
      permission,
      delivery.soundBlocked,
      setSoundEnabled,
      testSound,
      unlockSound,
      setBrowserEnabled,
      testBrowser,
    ]
  );

  return (
    <NotificationContext.Provider data-testid="notifications-provider" value={value}>
      {children}
      {enabled && (
        <Box
          data-testid="notifications-live-region"
          aria-live="polite"
          role="status"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          }}
        >
          {announcement}
        </Box>
      )}
      {enabled && flags[FEATURE.CLUB_LINK_REQUEST] && (
        <LinkClubModal open={linkClubOpen} onClose={() => setLinkClubOpen(false)} />
      )}
    </NotificationContext.Provider>
  );
}
