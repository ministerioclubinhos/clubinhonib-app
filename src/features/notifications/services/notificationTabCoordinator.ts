import {
  NOTIFICATIONS_CHANNEL_NAME,
  notificationLockName,
  notificationProcessedKey,
} from '../constants';
import { TabMessageKind } from '../types';
import {
  addProcessedMarks,
  buildTabMessage,
  isTabMessageFor,
  parseProcessedMarks,
  unprocessedIds,
} from '../utils';

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Storage indisponível: a deduplicação fica restrita a esta aba. */
  }
}

export function hasWebLocks(): boolean {
  return typeof navigator !== 'undefined' && 'locks' in navigator && Boolean(navigator.locks);
}

/**
 * Coordena abas da mesma conta.
 *
 * `BroadcastChannel` apenas avisa as outras abas para atualizarem o resumo.
 * A decisão de alertar usa exclusão mútua real (Web Locks): dentro do lock, a
 * aba confere e grava as marcas dos eventos já alertados. Sem Web Locks,
 * somente a aba visível e focada alerta, e alertas externos são suprimidos.
 */
export class NotificationTabCoordinator {
  private channel: BroadcastChannel | null = null;
  private readonly localProcessed = new Set<string>();
  private releaseLeadership: (() => void) | null = null;
  private disposed = false;

  constructor(
    private readonly userId: string,
    onRevisionChanged: () => void
  ) {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      this.channel = new BroadcastChannel(NOTIFICATIONS_CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<unknown>) => {
        if (isTabMessageFor(event.data, this.userId)) onRevisionChanged();
      };
    } catch {
      this.channel = null;
    }
  }

  announceRevision(): void {
    try {
      this.channel?.postMessage(buildTabMessage(this.userId, TabMessageKind.REVISION_CHANGED));
    } catch {
      /* Melhor esforço. */
    }
  }

  /**
   * Reivindica os IDs ainda não alertados por nenhuma aba. Retorna os que esta
   * aba deve alertar (vazio quando outra aba já o fez).
   */
  async claim(ids: string[]): Promise<string[]> {
    const fresh = ids.filter((id) => !this.localProcessed.has(id));
    if (!fresh.length) return [];
    if (!hasWebLocks()) {
      fresh.forEach((id) => this.localProcessed.add(id));
      return fresh;
    }
    const key = notificationProcessedKey(this.userId);
    return navigator.locks.request(notificationLockName(this.userId), async () => {
      const now = Date.now();
      const marks = parseProcessedMarks(readStorage(key), now);
      const claimed = unprocessedIds(marks, fresh);
      if (claimed.length) writeStorage(key, JSON.stringify(addProcessedMarks(marks, claimed, now)));
      fresh.forEach((id) => this.localProcessed.add(id));
      return claimed;
    });
  }

  /**
   * Eleição da aba coordenadora (a única que consulta oculta). O lock fica
   * preso enquanto a aba existir; ao fechar, outra aba o recebe.
   */
  startLeadership(onLeader: (leader: boolean) => void): void {
    if (!hasWebLocks()) return;
    void navigator.locks
      .request(`${notificationLockName(this.userId)}:leader`, () => {
        if (this.disposed) return Promise.resolve();
        onLeader(true);
        return new Promise<void>((resolve) => {
          this.releaseLeadership = resolve;
        });
      })
      .catch(() => onLeader(false));
  }

  dispose(): void {
    this.disposed = true;
    this.releaseLeadership?.();
    this.releaseLeadership = null;
    if (this.channel) {
      this.channel.onmessage = null;
      this.channel.close();
    }
    this.channel = null;
  }
}

/** Remove as marcas da conta ao sair (somente IDs opacos). */
export function clearProcessedMarks(userId: string): void {
  try {
    window.localStorage.removeItem(notificationProcessedKey(userId));
  } catch {
    /* Melhor esforço. */
  }
}
