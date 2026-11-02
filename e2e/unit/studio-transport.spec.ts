import { expect, test } from '@playwright/test';
import { AxiosError, CanceledError, type AxiosRequestConfig } from 'axios';
import { classifyStreamError, subscribeLessonStream } from '@/features/ai-lessons/stream';
import { lessonPdfError } from '@/features/ai-lessons/pdf';
import {
  LessonStageStatus,
  LessonStageType,
  LessonStatus,
  LessonStreamEnd,
  type Lesson,
  type LessonStreamMetrics,
} from '@/features/ai-lessons/types';
import {
  buildLessonListParams,
  computeLessonSnapshotSignature,
  hasCompleteStageAssets,
  isLessonSnapshotNewerOrEqual,
  parseSseChunk,
} from '@/features/ai-lessons/utils';
import {
  REVIEW_LESSON_STATUSES,
  PDF_ERROR_FALLBACK,
  PDF_NETWORK_ERROR,
} from '@/features/ai-lessons/constants';
import { aiLessonsKeys } from '@/features/ai-lessons/queryKeys';

function httpFailure(status: number, data: unknown) {
  return new AxiosError('Transport error', undefined, undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: {} },
  } as NonNullable<AxiosError['response']>);
}

test('SSE diferencia cancelamento, indisponibilidade e permissão definitiva', () => {
  expect(classifyStreamError(new CanceledError())).toBe(LessonStreamEnd.CANCELLED);
  expect(classifyStreamError(httpFailure(403, {}))).toBe(LessonStreamEnd.DENIED);
  expect(classifyStreamError(httpFailure(503, {}))).toBe(LessonStreamEnd.TRANSIENT);
});

test('parseSseChunk reconhece heartbeats e preserva frames incompletos', () => {
  const chunk = ': heartbeat\n\nevent: heartbeat\ndata: {}\n\ndata: {"id":"A","stages":[]}\n\nparcial';
  const parsed = parseSseChunk(chunk);
  expect(parsed.heartbeats).toBe(2);
  expect(parsed.hasActivity).toBe(true);
  expect(parsed.messages).toHaveLength(1);
  expect(JSON.parse(parsed.messages[0] ?? '{}').id).toBe('A');
  expect(parsed.remainder).toBe('parcial');
});

test('rotação de stream por maxBytes encerra com LessonStreamEnd.ROTATED sem erro', async () => {
  let config: AxiosRequestConfig | undefined;
  const reasons: LessonStreamEnd[] = [];
  subscribeLessonStream(
    'A',
    (value) => {
      config = value;
      return new Promise<void>((_, reject) => {
        const signal = value.signal as AbortSignal | undefined;
        signal?.addEventListener('abort', () => reject(new CanceledError()));
      });
    },
    {
      onLesson: () => {},
      onDisconnect: (reason) => reasons.push(reason),
    },
    { maxBytes: 16, maxDurationMs: 60_000 }
  );
  const body = 'data: {"id":"A","stages":[]}\n\n';
  config?.onDownloadProgress?.({
    loaded: body.length,
    bytes: body.length,
    lengthComputable: false,
    event: { target: { status: 200, responseText: body } },
  });
  await expect.poll(() => reasons).toEqual([LessonStreamEnd.ROTATED]);
});

test('EOF normal reconecta, mede snapshots/bytes e libera a assinatura', async () => {
  let config: AxiosRequestConfig | undefined;
  let finishRequest: (() => void) | undefined;
  const reasons: LessonStreamEnd[] = [];
  const lessons: string[] = [];
  const metrics: LessonStreamMetrics[] = [];
  const unsubscribe = subscribeLessonStream(
    'A',
    (value) => {
      config = value;
      return new Promise<void>((resolve) => {
        finishRequest = resolve;
      });
    },
    {
      onLesson: (lesson) => lessons.push(lesson.id),
      onDisconnect: (reason) => reasons.push(reason),
      onMetrics: (value) => metrics.push(value),
    }
  );
  const body = 'data: {"id":"A","stages":[]}\n\n';
  config?.onDownloadProgress?.({
    loaded: body.length,
    bytes: body.length,
    lengthComputable: false,
    event: { target: { status: 200, responseText: body } },
  });
  finishRequest?.();
  await expect.poll(() => reasons).toEqual([LessonStreamEnd.TRANSIENT]);
  expect(lessons).toEqual(['A']);
  expect(metrics[0].bytes).toBe(Buffer.byteLength(body));
  expect(metrics[0].snapshots).toBe(1);
  unsubscribe();
  expect(reasons).toHaveLength(1);
});

test('cleanup impede snapshots tardios de substituir outra lição', async () => {
  let config: AxiosRequestConfig | undefined;
  const ids: string[] = [];
  const unsubscribe = subscribeLessonStream(
    'A',
    async (value) => {
      config = value;
      await new Promise(() => {});
    },
    { onLesson: (lesson) => ids.push(lesson.id), onDisconnect: () => {} }
  );
  unsubscribe();
  config?.onDownloadProgress?.({
    loaded: 1,
    bytes: 1,
    lengthComputable: false,
    event: { target: { status: 200, responseText: 'data: {"id":"A","stages":[]}\n\n' } },
  });
  expect(ids).toEqual([]);
  expect(config?.signal?.aborted).toBe(true);
});

test('PDF 422 em Blob usa mensagem pública; rede e exceção interna têm diagnósticos distintos', async () => {
  const blob = new Blob(
    [JSON.stringify({ success: false, error: { message: 'O conteúdo não cabe na folha.' } })],
    { type: 'application/json' }
  );
  expect(await lessonPdfError(httpFailure(422, blob))).toBe('O conteúdo não cabe na folha.');
  expect(await lessonPdfError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe(
    PDF_NETWORK_ERROR
  );
  expect(await lessonPdfError(httpFailure(503, new Blob(['stack password secret'])))).toBe(
    PDF_ERROR_FALLBACK
  );
  expect(await lessonPdfError(httpFailure(422, new Blob(['not JSON'])))).toBe(PDF_ERROR_FALLBACK);
});

test('fila envia conjunto de estados antes da paginação e cache distingue filtros e usuário', () => {
  const params = { statuses: REVIEW_LESSON_STATUSES, search: 'teste', page: 1, limit: 12 };
  expect(buildLessonListParams(params)).toEqual({
    ...params,
    statuses: REVIEW_LESSON_STATUSES.join(','),
  });
  expect(aiLessonsKeys.drafts(params)).not.toEqual(aiLessonsKeys.drafts({ ...params, page: 2 }));
  expect(aiLessonsKeys.drafts(params)).not.toEqual(
    aiLessonsKeys.drafts({ ...params, statuses: [] })
  );
  expect(aiLessonsKeys.preferences.slice(0, 2)).not.toEqual(aiLessonsKeys.lists);
  expect(aiLessonsKeys.preferencesByUser('admin-1')).not.toEqual(
    aiLessonsKeys.preferencesByUser('admin-2')
  );
});

test('monotonicidade de snapshots e integridade de mídias das etapas visuais', () => {
  const baseLesson: Lesson = {
    id: 'lesson-1',
    theme: 'Tema',
    biblicalReference: 'Jo 3:16',
    weekNumber: 1,
    status: LessonStatus.IN_PROGRESS,
    weekMaterialId: null,
    createdAt: '',
    updatedAt: '2026-11-01T10:00:00Z',
    comments: [],
    stages: [
      {
        id: 's1',
        type: LessonStageType.LESSON,
        status: LessonStageStatus.DRAFT,
        lockVersion: 2,
        currentVersionId: 'v2',
        failureMessage: null,
        versions: [],
      },
    ],
  };
  const olderLesson: Lesson = {
    ...baseLesson,
    stages: [{ ...baseLesson.stages[0], lockVersion: 1 }],
  };
  expect(isLessonSnapshotNewerOrEqual(baseLesson, olderLesson)).toBe(false);
  expect(isLessonSnapshotNewerOrEqual(baseLesson, baseLesson)).toBe(true);
  expect(computeLessonSnapshotSignature(baseLesson)).toBe(
    computeLessonSnapshotSignature({ ...baseLesson })
  );

  expect(hasCompleteStageAssets(LessonStageType.LESSON_VISUALS, { visualConfig: {} })).toBe(false);
  expect(
    hasCompleteStageAssets(LessonStageType.LESSON_VISUALS, {
      assets: [{ url: 'https://cdn.example.com/1.png' }],
    })
  ).toBe(true);
  expect(
    hasCompleteStageAssets(LessonStageType.MANUAL_WORK, {
      printableAssets: [{ url: '' }],
    })
  ).toBe(false);
});
