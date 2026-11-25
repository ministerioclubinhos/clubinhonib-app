import type { PlayVideo } from './types';

/** Fila de reprodução ("Tocar tudo" / "Aleatório"). */
export interface PlayQueue {
  /** Vídeos da fila, na ordem original (curadoria/filtro). */
  videos: PlayVideo[];
  /** Ids na ordem em que serão tocados. */
  order: string[];
  shuffle: boolean;
  /** De onde veio a fila, para mostrar ao professor. */
  label: string;
}

const STORAGE_KEY = 'clubinho-play:queue';

/** Embaralha (Fisher-Yates) sem alterar a lista recebida. `random` é injetável para teste. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/**
 * Ordem de reprodução. Com `startId`, ele vai primeiro e o resto segue a regra:
 * embaralhado, ou na ordem original a partir do próprio vídeo.
 */
export function buildOrder(
  videos: readonly PlayVideo[],
  shuffle: boolean,
  startId?: string,
  random: () => number = Math.random
): string[] {
  const ids = videos.map((video) => video.id);
  if (!shuffle) {
    const start = startId ? ids.indexOf(startId) : 0;
    return start > 0 ? [...ids.slice(start), ...ids.slice(0, start)] : ids;
  }
  const rest = shuffled(
    ids.filter((id) => id !== startId),
    random
  );
  return startId && ids.includes(startId) ? [startId, ...rest] : rest;
}

export function createQueue(
  videos: PlayVideo[],
  shuffle: boolean,
  label: string,
  startId?: string
): PlayQueue {
  return { videos, order: buildOrder(videos, shuffle, startId), shuffle, label };
}

/** Liga/desliga o aleatório mantendo o vídeo atual como ponto de partida. */
export function withShuffle(queue: PlayQueue, shuffle: boolean, currentId: string): PlayQueue {
  return { ...queue, shuffle, order: buildOrder(queue.videos, shuffle, currentId) };
}

export const queueIndex = (queue: PlayQueue, id: string): number => queue.order.indexOf(id);

export const nextInQueue = (queue: PlayQueue, id: string): string | null => {
  const index = queueIndex(queue, id);
  return index >= 0 && index < queue.order.length - 1 ? queue.order[index + 1] : null;
};

export const previousInQueue = (queue: PlayQueue, id: string): string | null => {
  const index = queueIndex(queue, id);
  return index > 0 ? queue.order[index - 1] : null;
};

/** Vídeos que ainda vão tocar depois do atual, na ordem da fila. */
export function upcoming(queue: PlayQueue, id: string): PlayVideo[] {
  const byId = new Map(queue.videos.map((video) => [video.id, video]));
  const index = queueIndex(queue, id);
  if (index < 0) return [];
  return queue.order
    .slice(index + 1)
    .map((videoId) => byId.get(videoId))
    .filter((video): video is PlayVideo => Boolean(video));
}

export function saveQueue(queue: PlayQueue | null): void {
  try {
    if (queue) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Armazenamento indisponível (modo privado/cota): a fila vale só enquanto a aba não recarrega.
  }
}

export function loadQueue(): PlayQueue | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlayQueue>;
    if (!Array.isArray(parsed.videos) || !Array.isArray(parsed.order)) return null;
    return {
      videos: parsed.videos,
      order: parsed.order,
      shuffle: Boolean(parsed.shuffle),
      label: String(parsed.label ?? ''),
    };
  } catch {
    return null;
  }
}
