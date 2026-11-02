import { subscribeLessonStream } from '@/features/ai-lessons/stream';
import type {
  Lesson,
  LessonDashboard,
  GenerateLessonPayload,
  SaveTiptapPayload,
  RegenerateSectionPayload,
  AdminPromptPreference,
  GetLessonDraftsParams,
  LessonListResponse,
  LessonDeleteResponse,
  LessonPublicationResponse,
  LessonStreamCallbacks,
} from '@/features/ai-lessons/types';
import apiAxios from '@/config/axiosConfig';
import { LessonCategory, LessonStageType } from '@/features/ai-lessons/types';
import { buildLessonListParams } from '@/features/ai-lessons/utils';
import { AI_LESSONS_ENDPOINT } from '@/features/ai-lessons/constants';

export {
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
} from '@/features/ai-lessons/types';
export type {
  TiptapDocument,
  LessonVersion,
  LessonStage,
  Lesson,
  LessonComment,
  LessonDashboard,
  GenerateLessonPayload,
  SaveTiptapPayload,
  RegenerateSectionPayload,
  AdminPromptPreference,
  GetLessonDraftsParams,
} from '@/features/ai-lessons/types';
const endpoint = AI_LESSONS_ENDPOINT;
export const aiLessonsService = {
  async generateDraft(payload: GenerateLessonPayload): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(endpoint, payload)).data;
  },
  async getDrafts(
    params: GetLessonDraftsParams = {},
    signal?: AbortSignal
  ): Promise<LessonListResponse> {
    return (
      await apiAxios.get<LessonListResponse>(endpoint, {
        params: buildLessonListParams(params),
        signal,
      })
    ).data;
  },
  async getDraftById(id: string, signal?: AbortSignal): Promise<Lesson> {
    return (await apiAxios.get<Lesson>(`${endpoint}/${id}`, { signal })).data;
  },
  subscribeToLessonEvents(id: string, callbacks: LessonStreamCallbacks): () => void {
    return subscribeLessonStream(
      id,
      (config) => apiAxios.get<string>(`${endpoint}/${id}/events`, config),
      callbacks
    );
  },
  async deleteDraft(id: string): Promise<LessonDeleteResponse> {
    return (await apiAxios.delete<LessonDeleteResponse>(`${endpoint}/${id}`)).data;
  },
  async getDashboard(signal?: AbortSignal): Promise<LessonDashboard> {
    return (await apiAxios.get<LessonDashboard>(`${endpoint}/dashboard`, { signal })).data;
  },
  async generateStage(id: string, payload: RegenerateSectionPayload): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/generate`, payload)).data;
  },
  async updateContent(id: string, payload: SaveTiptapPayload): Promise<Lesson> {
    return (
      await apiAxios.patch<Lesson>(`${endpoint}/${id}/stages/content`, payload, {
        skipGlobalError: true,
      })
    ).data;
  },
  async completeProductionStage(
    id: string,
    stage: LessonStageType,
    lockVersion?: number
  ): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/complete-production`, {
        stage,
        lockVersion,
      })
    ).data;
  },
  async submitPackageReview(id: string): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/package/submit-review`)).data;
  },
  async approveStage(id: string, stage: LessonStageType, lockVersion?: number): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/approve`, {
        stage,
        lockVersion,
      })
    ).data;
  },
  async requestChanges(
    id: string,
    stage: LessonStageType,
    note: string,
    lockVersion?: number
  ): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/request-changes`, {
        stage,
        note,
        lockVersion,
      })
    ).data;
  },
  async exportPdf(id: string): Promise<Blob> {
    return (
      await apiAxios.post<Blob>(
        `${endpoint}/${id}/export/pdf`,
        {},
        { responseType: 'blob', skipGlobalError: true }
      )
    ).data;
  },
  async previewStagePdf(
    id: string,
    stage: LessonStageType,
    lockVersion?: number,
    versionId?: string
  ): Promise<Blob> {
    return (
      await apiAxios.get<Blob>(`${endpoint}/${id}/stages/${stage}/preview.pdf`, {
        params: {
          ...(lockVersion !== undefined ? { lockVersion } : {}),
          ...(versionId ? { versionId } : {}),
        },
        responseType: 'blob',
        skipGlobalError: true,
      })
    ).data;
  },
  async publishToWeekMaterial(id: string): Promise<LessonPublicationResponse> {
    return (
      await apiAxios.post<LessonPublicationResponse>(`${endpoint}/${id}/publish-week-material`)
    ).data;
  },
  async getPromptPreferences(signal?: AbortSignal, category: LessonCategory = LessonCategory.REGULAR): Promise<AdminPromptPreference[]> {
    return (
      await apiAxios.get<AdminPromptPreference[]>(`${endpoint}/prompt-preferences/me`, { signal, params: { category } })
    ).data;
  },
  async savePromptPreference(
    stage: LessonStageType,
    prompt: string,
    lockVersion: number | null,
    category: LessonCategory = LessonCategory.REGULAR
  ): Promise<AdminPromptPreference> {
    return (
      await apiAxios.patch<AdminPromptPreference>(
        `${endpoint}/prompt-preferences/me`,
        {
          stage,
          prompt,
          lockVersion: lockVersion ?? undefined,
          category,
        },
        { skipGlobalError: true }
      )
    ).data;
  },
  async resetPromptPreference(
    stage: LessonStageType,
    lockVersion?: number | null,
    category: LessonCategory = LessonCategory.REGULAR
  ): Promise<AdminPromptPreference> {
    return (
      await apiAxios.post<AdminPromptPreference>(
        `${endpoint}/prompt-preferences/me/reset`,
        {
          stage,
          lockVersion: lockVersion ?? undefined,
          category,
        },
        { skipGlobalError: true }
      )
    ).data;
  },
};
