import { isAxiosError, isCancel } from 'axios';
import { AI_LESSON_EVENTS_STALE_TIMEOUT_MS } from './constants';
import {
  LessonStreamEnd,
  type Lesson,
  type LessonStreamCallbacks,
  type LessonStreamTransport,
} from './types';
import { parseSseChunk } from './utils';

export function classifyStreamError(error: unknown): LessonStreamEnd {
  if (isCancel(error)) return LessonStreamEnd.CANCELLED;
  if (isAxiosError(error) && [401, 403, 404].includes(error.response?.status ?? 0))
    return LessonStreamEnd.DENIED;
  return LessonStreamEnd.TRANSIENT;
}

export function subscribeLessonStream(
  lessonId: string,
  request: LessonStreamTransport,
  callbacks: LessonStreamCallbacks
): () => void {
  const controller = new AbortController();
  let consumedLength = 0;
  let pending = '';
  let closed = false;
  let bytes = 0;
  let snapshots = 0;
  const startedAt = performance.now();
  let staleTimer: ReturnType<typeof setTimeout>;
  let activeRequest: XMLHttpRequest | null = null;
  const finish = (reason: LessonStreamEnd) => {
    if (closed) return;
    closed = true;
    clearTimeout(staleTimer);
    controller.abort();
    callbacks.onMetrics?.({ bytes, snapshots, durationMs: performance.now() - startedAt });
    callbacks.onDisconnect(reason);
  };
  const resetWatchdog = () => {
    clearTimeout(staleTimer);
    staleTimer = setTimeout(
      () => finish(LessonStreamEnd.TRANSIENT),
      AI_LESSON_EVENTS_STALE_TIMEOUT_MS
    );
  };
  resetWatchdog();
  void request({
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
      resetWatchdog();
      const chunk = xhr.responseText.slice(consumedLength);
      consumedLength = xhr.responseText.length;
      bytes += new TextEncoder().encode(chunk).byteLength;
      pending += chunk;
      const parsed = parseSseChunk(pending);
      pending = parsed.remainder;
      try {
        for (const data of parsed.messages) {
          const lesson = JSON.parse(data) as Lesson;
          if (lesson.id !== lessonId || !Array.isArray(lesson.stages))
            throw new Error('Invalid snapshot');
          snapshots += 1;
          callbacks.onLesson(lesson);
        }
      } catch {
        finish(LessonStreamEnd.TRANSIENT);
      }
    },
  })
    .then(() => finish(LessonStreamEnd.TRANSIENT))
    .catch((error: unknown) => finish(classifyStreamError(error)));
  return () => finish(LessonStreamEnd.CANCELLED);
}
