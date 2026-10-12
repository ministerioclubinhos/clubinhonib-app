import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { aiLessonsService } from '@/services/aiLessonsService';
import { AI_LESSON_EVENTS_RECONNECT_DELAY_MS } from '@/features/ai-lessons/constants';
import { aiLessonsKeys } from '@/features/ai-lessons/queryKeys';
import {
  LessonConnectionState,
  LessonStageAction,
  LessonStreamEnd,
  type GenerateLessonPayload,
  type GenerateStageVariables,
  type GetLessonDraftsParams,
  type Lesson,
  type SaveLessonVariables,
  type StageActionVariables,
  type LessonStreamMetrics,
} from '@/features/ai-lessons/types';

export const useAiLessonsKeys = aiLessonsKeys;

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
    queryFn: () => aiLessonsService.getDrafts(params),
  });
}
export function useLessonDraft(id: string) {
  return useQuery({
    queryKey: aiLessonsKeys.detail(id),
    queryFn: () => aiLessonsService.getDraftById(id),
    enabled: Boolean(id),
  });
}
export function useLessonDraftEvents(id: string) {
  const client = useQueryClient();
  const [state, setState] = useState(LessonConnectionState.CONNECTING);
  const [metrics, setMetrics] = useState<LessonStreamMetrics | null>(null);
  useEffect(() => {
    if (!id) return;
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    setState(LessonConnectionState.CONNECTING);
    setMetrics(null);
    const connect = () => {
      if (disposed) return;
      unsubscribe = aiLessonsService.subscribeToLessonEvents(id, {
        onLesson: (lesson) => {
          if (disposed || lesson.id !== id) return;
          setState(LessonConnectionState.CONNECTED);
          const previous = client.getQueryData<Lesson>(aiLessonsKeys.detail(id));
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
          if (reason === LessonStreamEnd.DENIED) {
            setState(LessonConnectionState.DENIED);
            return;
          }
          setState(LessonConnectionState.RECONNECTING);
          reconnectTimer = setTimeout(connect, AI_LESSON_EVENTS_RECONNECT_DELAY_MS);
        },
        onMetrics: (value) => {
          if (!disposed) setMetrics(value);
        },
      });
    };
    connect();
    return () => {
      disposed = true;
      unsubscribe?.();
      clearTimeout(reconnectTimer);
    };
  }, [client, id]);
  return { state, metrics };
}
export function useLessonDashboard() {
  return useQuery({ queryKey: aiLessonsKeys.dashboard, queryFn: aiLessonsService.getDashboard });
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
    mutationFn: ({ id, stage, note }: StageActionVariables) =>
      action === LessonStageAction.COMPLETE
        ? aiLessonsService.completeProductionStage(id, stage)
        : action === LessonStageAction.APPROVE
          ? aiLessonsService.approveStage(id, stage)
          : aiLessonsService.requestChanges(id, stage, note ?? ''),
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
    onSuccess: (result) => updateLesson(client, result.lesson),
  });
}
