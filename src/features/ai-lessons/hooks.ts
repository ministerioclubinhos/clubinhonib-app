import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { aiLessonsService } from './api';
import {
  AI_LESSON_EVENTS_FAILURES_BEFORE_NOTICE,
  PUBLICATION_PREVIEW_STALE_TIME_MS,
} from './constants';
import { nextReconnectDelay } from './stream';
import { aiLessonsKeys } from './queryKeys';
import { setCurrentWeek } from '@/features/week-materials/api';
import {
  computeLessonSnapshotSignature,
  isLessonSnapshotNewerOrEqual,
} from './utils';
import {
  LessonArchiveAction,
  LessonConnectionState,
  LessonStageAction,
  LessonStreamEnd,
  type GenerateLessonPayload,
  type GenerateStageVariables,
  type GetLessonDraftsParams,
  type Lesson,
  type ResolveCommentVariables,
  type SaveLessonVariables,
  type StageActionVariables,
  type LessonStreamMetrics,
} from './types';

function invalidateSummaries(client: QueryClient) {
  return Promise.all([
    client.invalidateQueries({ queryKey: aiLessonsKeys.lists }),
    client.invalidateQueries({ queryKey: aiLessonsKeys.dashboard }),
  ]);
}
function updateLesson(client: QueryClient, lesson: Lesson) {
  client.setQueryData(aiLessonsKeys.detail(lesson.id), lesson);
  return invalidateSummaries(client);
}
export function useGenerateLessonDraft() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateLessonPayload) => aiLessonsService.generateDraft(payload),
    onSuccess: (lesson) => updateLesson(client, lesson),
  });
}
export function useLessonDrafts(params: GetLessonDraftsParams = {}) {
  return useQuery({
    queryKey: aiLessonsKeys.drafts(params),
    queryFn: ({ signal }) => aiLessonsService.getDrafts(params, signal),
  });
}
export function useLessonDraft(id: string) {
  return useQuery({
    queryKey: aiLessonsKeys.detail(id),
    queryFn: ({ signal }) => aiLessonsService.getDraftById(id, signal),
    enabled: Boolean(id),
  });
}
export function useLessonDraftEvents(id: string) {
  const client = useQueryClient();
  const [state, setState] = useState(LessonConnectionState.CONNECTING);
  const metrics = useRef<LessonStreamMetrics | null>(null);
  useEffect(() => {
    if (!id) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    let terminal = false;
    setState(LessonConnectionState.CONNECTING);
    metrics.current = null;
    const stop = () => {
      unsubscribe?.();
      unsubscribe = undefined;
      clearTimeout(reconnectTimer);
    };
    const connect = () => {
      if (disposed || terminal || document.hidden) return;
      stop();
      unsubscribe = aiLessonsService.subscribeToLessonEvents(id, {
        onLesson: (lesson) => {
          if (disposed || lesson.id !== id) return;
          failures = 0;
          setState(LessonConnectionState.CONNECTED);
          const previous = client.getQueryData<Lesson>(aiLessonsKeys.detail(id));
          if (!isLessonSnapshotNewerOrEqual(previous, lesson)) return;
          if (
            previous &&
            computeLessonSnapshotSignature(previous) === computeLessonSnapshotSignature(lesson)
          ) {
            return;
          }
          client.setQueryData(aiLessonsKeys.detail(id), lesson);
          if (
            previous &&
            (previous.status !== lesson.status ||
              previous.stages.some(
                (stage) =>
                  lesson.stages.find((item) => item.id === stage.id)?.status !== stage.status
              ))
          )
            void invalidateSummaries(client);
        },
        onDisconnect: (reason) => {
          if (disposed || reason === LessonStreamEnd.CANCELLED) return;
          if (reason === LessonStreamEnd.DENIED || reason === LessonStreamEnd.NOT_FOUND) {
            terminal = true;
            setState(
              reason === LessonStreamEnd.DENIED
                ? LessonConnectionState.DENIED
                : LessonConnectionState.NOT_FOUND
            );
            return;
          }
          // Planned rotation: reconnect quietly, the screen keeps showing "connected".
          if (reason === LessonStreamEnd.ROTATED) {
            failures = 0;
            connect();
            return;
          }
          failures += 1;
          if (
            reason === LessonStreamEnd.TRANSIENT &&
            failures >= AI_LESSON_EVENTS_FAILURES_BEFORE_NOTICE
          )
            setState(LessonConnectionState.RECONNECTING);
          reconnectTimer = setTimeout(connect, nextReconnectDelay(failures));
        },
        onMetrics: (value) => {
          metrics.current = value;
        },
      });
    };
    // A hidden tab holds no connection; coming back refetches once and resubscribes.
    const onVisibility = () => {
      if (disposed || terminal) return;
      if (document.hidden) {
        stop();
        return;
      }
      failures = 0;
      void client.invalidateQueries({ queryKey: aiLessonsKeys.detail(id) });
      connect();
    };
    document.addEventListener('visibilitychange', onVisibility);
    connect();
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [client, id]);
  return { state };
}
export function useLessonDashboard() {
  return useQuery({
    queryKey: aiLessonsKeys.dashboard,
    queryFn: ({ signal }) => aiLessonsService.getDashboard(signal),
  });
}
export function useUpdateDraftContent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: SaveLessonVariables) =>
      aiLessonsService.updateContent(id, payload),
    onSuccess: (lesson) => updateLesson(client, lesson),
  });
}
export function useGenerateStage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: GenerateStageVariables) =>
      aiLessonsService.generateStage(id, payload),
    onSuccess: (lesson) => updateLesson(client, lesson),
    onSettled: (_, __, value) =>
      client.invalidateQueries({ queryKey: aiLessonsKeys.detail(value.id) }),
  });
}
export function useStageAction(action: LessonStageAction) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage, lockVersion, note, acknowledgeStale }: StageActionVariables) =>
      action === LessonStageAction.COMPLETE
        ? aiLessonsService.completeProductionStage(id, stage, lockVersion, acknowledgeStale)
        : action === LessonStageAction.APPROVE
          ? aiLessonsService.approveStage(id, stage, lockVersion)
          : action === LessonStageAction.REOPEN
            ? aiLessonsService.reopenStage(id, stage, note ?? '', lockVersion)
            : aiLessonsService.requestChanges(id, stage, note ?? '', lockVersion),
    onSuccess: (lesson) => updateLesson(client, lesson),
  });
}
export function useLessonArchive(action: LessonArchiveAction) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      action === LessonArchiveAction.ARCHIVE
        ? aiLessonsService.archive(id)
        : aiLessonsService.unarchive(id),
    onSuccess: async (lesson) => {
      await updateLesson(client, lesson);
      await client.invalidateQueries({ queryKey: aiLessonsKeys.publicationPreviews(lesson.id) });
    },
  });
}
/**
 * What publishing will create (title, PDFs, same-week duplicates) and the state of the page
 * already linked to the lesson. Keyed by status so each lesson transition refetches it.
 */
export function useLessonPublicationPreview(id: string, status: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: aiLessonsKeys.publicationPreview(id, status),
    queryFn: ({ signal }) => aiLessonsService.getPublicationPreview(id, signal),
    enabled: Boolean(id) && enabled,
    staleTime: PUBLICATION_PREVIEW_STALE_TIME_MS,
    retry: false,
  });
}
/** Publishes the lesson's page as the current week, then refreshes the preview and the public routes. */
export function useSetLessonMaterialCurrentWeek(lessonId: string, onRoutesChanged: () => unknown) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (weekMaterialId: string) => setCurrentWeek(weekMaterialId),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: aiLessonsKeys.publicationPreviews(lessonId) }),
        Promise.resolve(onRoutesChanged()),
      ]);
    },
  });
}
export function useResolveLessonComment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentId }: ResolveCommentVariables) =>
      aiLessonsService.resolveComment(id, commentId),
    onSuccess: (lesson) => updateLesson(client, lesson),
  });
}
export function useSubmitLessonPackage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: aiLessonsService.submitPackageReview,
    onSuccess: (lesson) => updateLesson(client, lesson),
  });
}
export function useDeleteLessonDraft() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: aiLessonsService.deleteDraft,
    onSuccess: (_, id) => {
      client.removeQueries({ queryKey: aiLessonsKeys.detail(id) });
      return invalidateSummaries(client);
    },
  });
}
export function usePublishLesson() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: aiLessonsService.publishToWeekMaterial,
    onSuccess: async (result) => {
      await updateLesson(client, result.lesson);
      await Promise.all([
        client.invalidateQueries({
          queryKey: aiLessonsKeys.publicationPreviews(result.lesson.id),
        }),
        client.invalidateQueries({ queryKey: ['week-material-pages'] }),
        client.invalidateQueries({ queryKey: ['week-materials'] }),
      ]);
    },
  });
}
