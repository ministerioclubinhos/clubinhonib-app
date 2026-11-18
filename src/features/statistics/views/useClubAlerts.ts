import dayjs from 'dayjs';
import { STALE_CLUB_DAYS } from '../constants';
import { useClubs, useRecentWeeklyAttendance } from '../hooks';
import { ALERT_TEXTS } from '../texts';
import type { AttentionItem, PeriodShortcut } from '../types';
import {
  clubLabel,
  clubsWithoutChildren,
  daysSince,
  formatDaysAgo,
  lowPresenceClubs,
  staleClubs,
  weeklyPagelaStatus,
} from '../utils/alerts';
import { formatPercent } from '../utils/plain';
import { LIST_FETCH_LIMIT } from '../constants';

interface ClubAlertsOptions {
  period: PeriodShortcut;
  /** Chamado ao tocar em "Ver clubinhos"; sem ele, o aviso não tem botão. */
  onGoToClubs?: () => void;
}

const shortDate = (iso: string | null): string => (iso ? dayjs(iso).format('DD/MM') : '');

/**
 * Os avisos sobre clubinhos, compartilhados pelas visões que os mostram.
 *
 * Reúne pagela que faltou (semana passada e atual), presença baixa, clubinho
 * parado e clubinho sem criança, cada um com os nomes de quem está na situação.
 */
export function useClubAlerts({ period, onGoToClubs }: ClubAlertsOptions) {
  const clubs = useClubs({ period, limit: LIST_FETCH_LIMIT });
  const weeks = useRecentWeeklyAttendance();

  const list = clubs.data?.clubs ?? [];
  const items: AttentionItem[] = [];
  const action = onGoToClubs ? { actionLabel: ALERT_TEXTS.goClubs, onAction: onGoToClubs } : {};

  const previous = weeklyPagelaStatus(weeks.previousQuery.data);
  const previousRange = weeks.previousQuery.data?.weekRange;
  if (previous.missing.length > 0) {
    items.push({
      key: 'missing-last-week',
      severity: 'error',
      title: ALERT_TEXTS.missingLastWeek(previous.missing.length),
      detail: previousRange
        ? ALERT_TEXTS.weekRange(shortDate(previousRange.start), shortDate(previousRange.end))
        : undefined,
      names: previous.missing.map(clubLabel),
      ...action,
    });
  }
  if (previous.partial.length > 0) {
    items.push({ key: 'partial-last-week', title: ALERT_TEXTS.partial(previous.partial.length), names: previous.partial.map(clubLabel), ...action });
  }

  const current = weeklyPagelaStatus(weeks.currentQuery.data);
  if (current.missing.length > 0) {
    items.push({ key: 'missing-this-week', severity: 'error', title: ALERT_TEXTS.missingThisWeek(current.missing.length), names: current.missing.map(clubLabel), ...action });
  }

  const low = lowPresenceClubs(list);
  if (low.length > 0) {
    items.push({
      key: 'low-presence',
      title: ALERT_TEXTS.lowPresence(low.length),
      detail: ALERT_TEXTS.lowPresenceDetail,
      names: low.map((club) => `${clubLabel(club)} (${formatPercent(club.performance.presenceRate)})`),
      ...action,
    });
  }

  const stale = staleClubs(list);
  if (stale.length > 0) {
    items.push({
      key: 'stale',
      title: ALERT_TEXTS.stale(stale.length, STALE_CLUB_DAYS),
      names: stale.map((club) => `${clubLabel(club)} (${formatDaysAgo(daysSince(club.lastActivity?.date))})`),
      ...action,
    });
  }

  const empty = clubsWithoutChildren(list);
  if (empty.length > 0) {
    items.push({ key: 'no-children', severity: 'info', title: ALERT_TEXTS.noChildren(empty.length), names: empty.map(clubLabel), ...action });
  }

  return {
    items,
    clubs,
    weeks,
    previous,
    current,
    isLoading: clubs.isLoading,
    isError: clubs.isError,
    refetch: () => {
      void clubs.refetch();
      void weeks.previousQuery.refetch();
      void weeks.currentQuery.refetch();
    },
  };
}
