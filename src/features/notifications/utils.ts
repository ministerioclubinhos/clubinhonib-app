import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATIONS_LOCALE,
  NOTIFICATIONS_LONG_ABSENCE_MS,
  NOTIFICATIONS_MAX_RETRIES,
  NOTIFICATIONS_NO_RETRY_STATUSES,
  NOTIFICATIONS_PROCESSED_LIMIT,
  NOTIFICATIONS_PROCESSED_TTL_MS,
  NOTIFICATIONS_QUERY_PARAM,
  NOTIFICATIONS_RECENT_WINDOW,
  NOTIFICATIONS_RETRY_BASE_MS,
  NOTIFICATIONS_RETRY_MAX_MS,
  NOTIFICATIONS_ROUTE,
  NOTIFICATIONS_SEEN_LIMIT,
  NOTIFICATIONS_STORAGE_VERSION,
  NOTIFICATIONS_SUMMARY_HIDDEN_POLL_MS,
  NOTIFICATIONS_SUMMARY_POLL_MS,
  NOTIFICATIONS_SW_MESSAGE_OPEN,
  NOTIFICATIONS_SW_MESSAGE_VERSION,
  NOTIFICATIONS_TAB_MESSAGE_VERSION,
  NOTIFICATIONS_UUID_PATTERN,
} from './constants';
import {
  BrowserPermissionState,
  NotificationAlertChannel,
  TabMessageKind,
  type AlertChannelInput,
  type NotificationPreferences,
  type NotificationRecentDto,
  type NoveltyResult,
  type NoveltyState,
  type ProcessedMark,
  type StoredNotificationPreferences,
  type TabMessage,
  type WorkerOpenMessage,
} from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/* ---------- Contador ---------- */

export function bellCount(unread: number, pending: number): number {
  return Math.max(0, unread) + Math.max(0, pending);
}

/* ---------- Detector de novidades ---------- */

export function emptyNoveltyState(): NoveltyState {
  return { baselineReady: false, seen: [], lastCheckedAt: null };
}

function rememberIds(seen: string[], ids: string[]): string[] {
  const merged = [...ids, ...seen.filter((id) => !ids.includes(id))];
  return merged.slice(0, NOTIFICATIONS_SEEN_LIMIT);
}

/**
 * Compara os IDs não lidos recentes com os já vistos. A identidade decide a
 * novidade — nunca a diferença do contador nem a ordem dos UUIDs.
 *
 * Sincroniza em silêncio: a primeira resposta, uma ausência longa e o caso
 * ambíguo de a janela inteira ser nova (rajada maior que a janela ou referência
 * perdida). A caixa de entrada continua sendo a garantia do aviso.
 */
export function detectNovelty(
  state: NoveltyState,
  recent: NotificationRecentDto[],
  now: number
): NoveltyResult {
  const ids = recent.map((item) => item.id);
  const next: NoveltyState = {
    baselineReady: true,
    seen: rememberIds(state.seen, ids),
    lastCheckedAt: now,
  };
  if (!state.baselineReady) return { state: next, fresh: [] };
  const longAbsence =
    state.lastCheckedAt !== null && now - state.lastCheckedAt > NOTIFICATIONS_LONG_ABSENCE_MS;
  const fresh = recent.filter((item) => !state.seen.includes(item.id));
  const wholeWindowIsNew =
    fresh.length >= NOTIFICATIONS_RECENT_WINDOW && state.seen.length > 0;
  if (longAbsence || wholeWindowIsNew) return { state: next, fresh: [] };
  return { state: next, fresh };
}

/* ---------- Marcas de eventos já alertados (entre abas) ---------- */

export function parseProcessedMarks(raw: string | null, now: number): ProcessedMark[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is ProcessedMark =>
          isRecord(item) && typeof item.id === 'string' && typeof item.at === 'number'
      )
      .filter((mark) => now - mark.at < NOTIFICATIONS_PROCESSED_TTL_MS);
  } catch {
    return [];
  }
}

export function unprocessedIds(marks: ProcessedMark[], ids: string[]): string[] {
  const known = new Set(marks.map((mark) => mark.id));
  return ids.filter((id) => !known.has(id));
}

export function addProcessedMarks(
  marks: ProcessedMark[],
  ids: string[],
  now: number
): ProcessedMark[] {
  const added = ids.map((id) => ({ id, at: now }));
  return [...added, ...marks.filter((mark) => !ids.includes(mark.id))].slice(
    0,
    NOTIFICATIONS_PROCESSED_LIMIT
  );
}

/* ---------- Preferências ---------- */

export function parsePreferences(raw: string | null): NotificationPreferences {
  if (!raw) return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== NOTIFICATIONS_STORAGE_VERSION)
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    return {
      soundEnabled: parsed.soundEnabled === true,
      browserNotificationsEnabled: parsed.browserNotificationsEnabled === true,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export function serializePreferences(preferences: NotificationPreferences): string {
  const stored: StoredNotificationPreferences = {
    version: NOTIFICATIONS_STORAGE_VERSION,
    soundEnabled: preferences.soundEnabled,
    browserNotificationsEnabled: preferences.browserNotificationsEnabled,
  };
  return JSON.stringify(stored);
}

/* ---------- Canal de alerta ---------- */

/**
 * Uma aba visível toca (exceto com a central aberta, onde o aviso já está à
 * vista). Sem aba visível, o aviso externo substitui o toque.
 */
export function chooseAlertChannel(input: AlertChannelInput): NotificationAlertChannel {
  if (input.visible) {
    if (input.centerOpen) return NotificationAlertChannel.NONE;
    return input.soundAllowed ? NotificationAlertChannel.SOUND : NotificationAlertChannel.NONE;
  }
  if (input.browserAllowed) return NotificationAlertChannel.BROWSER;
  return input.soundAllowed ? NotificationAlertChannel.SOUND : NotificationAlertChannel.NONE;
}

export function resolvePermissionState(input: {
  supported: boolean;
  permission: string | null;
}): BrowserPermissionState {
  if (!input.supported) return BrowserPermissionState.UNSUPPORTED;
  if (input.permission === BrowserPermissionState.GRANTED) return BrowserPermissionState.GRANTED;
  if (input.permission === BrowserPermissionState.DENIED) return BrowserPermissionState.DENIED;
  return BrowserPermissionState.DEFAULT;
}

/* ---------- Polling e retry ---------- */

export function summaryPollInterval(input: {
  visible: boolean;
  hiddenChannelReady: boolean;
  stopped: boolean;
}): number | false {
  if (input.stopped) return false;
  if (input.visible) return NOTIFICATIONS_SUMMARY_POLL_MS;
  return input.hiddenChannelReady ? NOTIFICATIONS_SUMMARY_HIDDEN_POLL_MS : false;
}

/** Erros de autorização, validação e ausência não se repetem sozinhos. */
export function isTerminalStatus(status: number | null): boolean {
  return status !== null && NOTIFICATIONS_NO_RETRY_STATUSES.includes(status);
}

export function shouldRetryNotifications(failureCount: number, status: number | null): boolean {
  return !isTerminalStatus(status) && failureCount < NOTIFICATIONS_MAX_RETRIES;
}

export function notificationsRetryDelay(attempt: number): number {
  return Math.min(NOTIFICATIONS_RETRY_BASE_MS * 2 ** attempt, NOTIFICATIONS_RETRY_MAX_MS);
}

/* ---------- Rotas seguras ---------- */

export function isNotificationId(value: string | null | undefined): value is string {
  return typeof value === 'string' && NOTIFICATIONS_UUID_PATTERN.test(value);
}

export function buildNotificationPath(id?: string): string {
  return isNotificationId(id)
    ? `${NOTIFICATIONS_ROUTE}?${NOTIFICATIONS_QUERY_PARAM}=${id}`
    : NOTIFICATIONS_ROUTE;
}

/**
 * Aceita somente a central (`/notificacoes`) com, no máximo, um ID válido.
 * Impede redirecionamento aberto por payload ou estado de navegação.
 */
export function isSafeNotificationPath(path: unknown): path is string {
  if (typeof path !== 'string' || !path.startsWith(NOTIFICATIONS_ROUTE)) return false;
  let url: URL;
  try {
    url = new URL(path, 'https://clubinho.invalid');
  } catch {
    return false;
  }
  if (url.origin !== 'https://clubinho.invalid' || url.pathname !== NOTIFICATIONS_ROUTE)
    return false;
  if (url.hash) return false;
  const keys = [...url.searchParams.keys()];
  if (!keys.length) return true;
  return (
    keys.length === 1 &&
    keys[0] === NOTIFICATIONS_QUERY_PARAM &&
    isNotificationId(url.searchParams.get(NOTIFICATIONS_QUERY_PARAM))
  );
}

/* ---------- Mensagens entre contextos ---------- */

export function buildTabMessage(userId: string, kind: TabMessageKind): TabMessage {
  return { version: NOTIFICATIONS_TAB_MESSAGE_VERSION, userId, kind };
}

export function isTabMessageFor(data: unknown, userId: string): data is TabMessage {
  return (
    isRecord(data) &&
    data.version === NOTIFICATIONS_TAB_MESSAGE_VERSION &&
    data.userId === userId &&
    Object.values(TabMessageKind).includes(data.kind as TabMessageKind)
  );
}

export function isWorkerOpenMessage(data: unknown): data is WorkerOpenMessage {
  return (
    isRecord(data) &&
    data.type === NOTIFICATIONS_SW_MESSAGE_OPEN &&
    data.version === NOTIFICATIONS_SW_MESSAGE_VERSION &&
    isSafeNotificationPath(data.path)
  );
}

/* ---------- Listas ---------- */

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/* ---------- Datas ---------- */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Data relativa em português, no fuso do dispositivo, como o restante do site. */
export function formatRelativeTime(iso: string, now: number): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';
  const diff = Math.max(0, now - time);
  if (diff < MINUTE) return 'agora';
  if (diff < HOUR) return `há ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `há ${Math.floor(diff / HOUR)} h`;
  const days = Math.floor(diff / DAY);
  if (days < 7) return days === 1 ? 'ontem' : `há ${days} dias`;
  return new Intl.DateTimeFormat(NOTIFICATIONS_LOCALE, {
    day: '2-digit',
    month: 'short',
  }).format(time);
}

export function formatFullDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return '';
  return new Intl.DateTimeFormat(NOTIFICATIONS_LOCALE, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(time);
}
