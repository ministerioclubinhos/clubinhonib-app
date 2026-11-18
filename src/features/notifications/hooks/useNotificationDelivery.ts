import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATIONS_HIDDEN_ALERT_DELAY_MS } from '../constants';
import { notificationKeys } from '../queryKeys';
import { browserNotificationService } from '../services/browserNotificationService';
import { notificationAudioService } from '../services/notificationAudioService';
import { hasWebLocks, NotificationTabCoordinator } from '../services/notificationTabCoordinator';
import {
  NotificationAlertChannel,
  SoundPlayResult,
  type NotificationSummaryDto,
  type NoveltyState,
} from '../types';
import { chooseAlertChannel, detectNovelty, emptyNoveltyState } from '../utils';

interface DeliveryInput {
  userId: string | null;
  enabled: boolean;
  summary: NotificationSummaryDto | undefined;
  centerOpen: boolean;
  soundAllowed: boolean;
  browserAllowed: boolean;
  /** Outra aba avisou que os dados mudaram. */
  onRemoteRevision: () => void;
  /** Novidade alertada com a aba visível (aria-live e animação). */
  onAnnounce: () => void;
}

const isVisible = () => typeof document !== 'undefined' && document.visibilityState === 'visible';
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Detecta novidades no resumo e decide, com as outras abas, quem alerta e por
 * qual canal. O som e o aviso externo são auxiliares de melhor esforço: a
 * caixa de entrada continua sendo a garantia do aviso.
 */
export function useNotificationDelivery(input: DeliveryInput) {
  const client = useQueryClient();
  const [isLeader, setLeader] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const novelty = useRef<NoveltyState>(emptyNoveltyState());
  const revision = useRef<string | null>(null);
  const coordinator = useRef<NotificationTabCoordinator | null>(null);
  const latest = useRef(input);
  latest.current = input;

  useEffect(() => {
    novelty.current = emptyNoveltyState();
    revision.current = null;
    setLeader(false);
    setSoundBlocked(false);
    if (!input.userId || !input.enabled) return;
    const instance = new NotificationTabCoordinator(input.userId, () =>
      latest.current.onRemoteRevision()
    );
    instance.startLeadership(setLeader);
    coordinator.current = instance;
    return () => {
      instance.dispose();
      if (coordinator.current === instance) coordinator.current = null;
      setLeader(false);
    };
  }, [input.userId, input.enabled]);

  const alertFresh = useCallback(async (owner: string, ids: string[]) => {
    const startedVisible = isVisible();
    // A aba visível tem preferência: a oculta espera antes de reivindicar.
    if (!startedVisible) await wait(NOTIFICATIONS_HIDDEN_ALERT_DELAY_MS);
    if (latest.current.userId !== owner || !coordinator.current) return;
    const locks = hasWebLocks();
    if (!locks && !(isVisible() && document.hasFocus())) return;
    const claimed = await coordinator.current.claim(ids);
    const current = latest.current;
    if (!claimed.length || current.userId !== owner) return;
    const visible = isVisible();
    if (visible) current.onAnnounce();
    const channel = chooseAlertChannel({
      visible,
      centerOpen: current.centerOpen,
      soundAllowed: current.soundAllowed,
      browserAllowed: current.browserAllowed && locks,
    });
    if (channel === NotificationAlertChannel.SOUND) {
      const result = await notificationAudioService.play();
      if (result === SoundPlayResult.BLOCKED) setSoundBlocked(true);
      if (result === SoundPlayResult.PLAYED) setSoundBlocked(false);
    } else if (channel === NotificationAlertChannel.BROWSER) {
      await browserNotificationService.showNotice(claimed[0]);
    }
  }, []);

  useEffect(() => {
    const { summary, userId, enabled } = input;
    if (!summary || !userId || !enabled) return;
    const previous = revision.current;
    revision.current = summary.revision;
    if (previous !== null && previous !== summary.revision) {
      void client.invalidateQueries({ queryKey: notificationKeys.lists(userId) });
      void client.invalidateQueries({ queryKey: notificationKeys.details(userId) });
      coordinator.current?.announceRevision();
    }
    const { state, fresh } = detectNovelty(novelty.current, summary.recentUnread, Date.now());
    novelty.current = state;
    if (fresh.length)
      void alertFresh(
        userId,
        fresh.map((item) => item.id)
      );
  }, [input.summary, input.userId, input.enabled, client, alertFresh]);

  // Desligar o som interrompe o toque imediatamente, inclusive vindo de outra aba.
  useEffect(() => {
    if (!input.soundAllowed) notificationAudioService.stop();
  }, [input.soundAllowed]);

  return { isLeader, soundBlocked, setSoundBlocked };
}
