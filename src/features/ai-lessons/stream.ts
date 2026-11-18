import { isAxiosError, isCancel } from 'axios';
import {
  AI_LESSON_EVENTS_CONNECT_TIMEOUT_MS,
  AI_LESSON_EVENTS_MAX_BYTES,
  AI_LESSON_EVENTS_MAX_DURATION_MS,
  AI_LESSON_EVENTS_RECONNECT_DELAY_MS,
  AI_LESSON_EVENTS_RECONNECT_JITTER_RATIO,
  AI_LESSON_EVENTS_RECONNECT_MAX_DELAY_MS,
  AI_LESSON_EVENTS_STALE_TIMEOUT_MS,
  HTTP_STATUS_DENIED,
  HTTP_STATUS_NOT_FOUND,
} from './constants';
import {
  LessonStreamEnd,
  type Lesson,
  type LessonStreamCallbacks,
  type LessonStreamTransport,
  type SubscribeLessonStreamOptions,
} from './types';
import { parseSseChunk } from './utils';

export function classifyStreamError(error: unknown): LessonStreamEnd {
  if (isCancel(error)) return LessonStreamEnd.CANCELLED;
  const status = isAxiosError(error) ? (error.response?.status ?? 0) : 0;
  if (status === HTTP_STATUS_NOT_FOUND) return LessonStreamEnd.NOT_FOUND;
  if (HTTP_STATUS_DENIED.includes(status)) return LessonStreamEnd.DENIED;
  return LessonStreamEnd.TRANSIENT;
}

/** Exponential backoff with jitter; `failures` counts consecutive failed connections (1-based). */
export function nextReconnectDelay(failures: number, random: () => number = Math.random): number {
  const exponent = Math.max(0, Math.min(failures - 1, 10));
  const base = Math.min(
    AI_LESSON_EVENTS_RECONNECT_MAX_DELAY_MS,
    AI_LESSON_EVENTS_RECONNECT_DELAY_MS * 2 ** exponent
  );
  const jitter = base * AI_LESSON_EVENTS_RECONNECT_JITTER_RATIO * random();
  return Math.round(Math.min(AI_LESSON_EVENTS_RECONNECT_MAX_DELAY_MS, base + jitter));
}

export function subscribeLessonStream(
  lessonId: string,
  request: LessonStreamTransport,
  callbacks: LessonStreamCallbacks,
  options?: SubscribeLessonStreamOptions
): () => void {
  const controller = new AbortController();
  const maxDurationMs = options?.maxDurationMs ?? AI_LESSON_EVENTS_MAX_DURATION_MS;
  const maxBytes = options?.maxBytes ?? AI_LESSON_EVENTS_MAX_BYTES;
  let consumedLength = 0;
  let pending = '';
  let closed = false;
  let bytes = 0;
  let snapshots = 0;
  let events = 0;
  const startedAt = performance.now();
  let staleTimer: ReturnType<typeof setTimeout> | undefined;
  const rotationTimer = setTimeout(() => finish(LessonStreamEnd.ROTATED), maxDurationMs);
  let activeRequest: XMLHttpRequest | null = null;
  const finish = (reason: LessonStreamEnd) => {
    if (closed) return;
    closed = true;
    clearTimeout(staleTimer);
    clearTimeout(rotationTimer);
    controller.abort();
    callbacks.onMetrics?.({ bytes, snapshots, durationMs: performance.now() - startedAt });
    callbacks.onDisconnect(reason);
  };
  const armWatchdog = (timeoutMs: number) => {
    clearTimeout(staleTimer);
    staleTimer = setTimeout(() => finish(LessonStreamEnd.TRANSIENT), timeoutMs);
  };
  const pendingRequest = request({
    signal: controller.signal,
    responseType: 'text',
    // The screen owns connection feedback. Authentication/refresh stays in apiAxios.
    skipGlobalError: true,
    onDownloadProgress: ({ event }) => {
      if (closed) return;
      const xhr = event?.target as XMLHttpRequest | null;
      // Error responses (including the first 401 before refresh) are not SSE frames.
      if (!xhr || xhr.status >= 400) return;
      if (xhr !== activeRequest) {
        activeRequest = xhr;
        consumedLength = 0;
        pending = '';
      }
      armWatchdog(AI_LESSON_EVENTS_STALE_TIMEOUT_MS);
      const chunk = xhr.responseText.slice(consumedLength);
      consumedLength = xhr.responseText.length;
      bytes += new TextEncoder().encode(chunk).byteLength;
      pending += chunk;
      const parsed = parseSseChunk(pending);
      pending = parsed.remainder;
      events += parsed.heartbeats;
      try {
        for (const data of parsed.messages) {
          const lesson = JSON.parse(data) as Lesson;
          if (lesson.id !== lessonId || !Array.isArray(lesson.stages))
            throw new Error('Invalid snapshot');
          snapshots += 1;
          events += 1;
          callbacks.onLesson(lesson);
        }
      } catch {
        finish(LessonStreamEnd.TRANSIENT);
        return;
      }
      // Never cut a frame in half: an oversized first snapshot must still be delivered.
      if (bytes >= maxBytes && snapshots > 0 && pending.trim() === '') {
        finish(LessonStreamEnd.BYTE_LIMIT);
      }
    },
  });
  // The watchdog only starts once the request is on its way; until the first byte it also
  // has to cover a token refresh, so it uses the longer connect timeout.
  armWatchdog(AI_LESSON_EVENTS_CONNECT_TIMEOUT_MS);
  void pendingRequest
    // A clean end after at least one event is the server's planned rotation, not an outage.
    .then(() => finish(events > 0 ? LessonStreamEnd.ROTATED : LessonStreamEnd.TRANSIENT))
    .catch((error: unknown) => finish(classifyStreamError(error)));
  return () => finish(LessonStreamEnd.CANCELLED);
}
