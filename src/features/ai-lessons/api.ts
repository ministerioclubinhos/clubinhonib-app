import { subscribeLessonStream } from './stream';
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
  LessonPublicationPreview,
  LessonPublicationResponse,
  LessonStreamCallbacks,
} from './types';
import apiAxios from '@/config/axiosConfig';
import { LessonCategory, LessonStageType } from './types';
import { buildLessonListParams } from './utils';
import { AI_LESSON_DETAIL_VIEW, AI_LESSONS_ENDPOINT } from './constants';

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
    return (
      await apiAxios.get<Lesson>(`${endpoint}/${id}`, {
        signal,
        params: { view: AI_LESSON_DETAIL_VIEW },
      })
    ).data;
  },
  subscribeToLessonEvents(id: string, callbacks: LessonStreamCallbacks): () => void {
    return subscribeLessonStream(
      id,
      (config) =>
        apiAxios.get<string>(`${endpoint}/${id}/events`, {
          ...config,
          params: { view: AI_LESSON_DETAIL_VIEW },
        }),
      callbacks
    );
  },
  async deleteDraft(id: string): Promise<LessonDeleteResponse> {
    return (
      await apiAxios.delete<LessonDeleteResponse>(`${endpoint}/${id}`, {
        // Delete dialogs render the failure next to the action.
        skipGlobalError: true,
      })
    ).data;
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
    lockVersion: number,
    acknowledgeStale?: boolean
  ): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(
        `${endpoint}/${id}/stages/complete-production`,
        { stage, lockVersion, ...(acknowledgeStale ? { acknowledgeStale: true } : {}) },
        // The production screen explains conflicts and the outdated-item confirmation itself.
        { skipGlobalError: true }
      )
    ).data;
  },
  async reopenStage(
    id: string,
    stage: LessonStageType,
    note: string,
    lockVersion: number
  ): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(
        `${endpoint}/${id}/stages/reopen`,
        { stage, note, lockVersion },
        { skipGlobalError: true }
      )
    ).data;
  },
  async archive(id: string): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/archive`, undefined, {
        skipGlobalError: true,
      })
    ).data;
  },
  async unarchive(id: string): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/unarchive`, undefined, {
        skipGlobalError: true,
      })
    ).data;
  },
  async resolveComment(id: string, commentId: string): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(`${endpoint}/${id}/comments/${commentId}/resolve`)
    ).data;
  },
  async submitPackageReview(id: string): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/package/submit-review`)).data;
  },
  async approveStage(id: string, stage: LessonStageType, lockVersion: number): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(
        `${endpoint}/${id}/stages/approve`,
        { stage, lockVersion },
        { skipGlobalError: true }
      )
    ).data;
  },
  async requestChanges(
    id: string,
    stage: LessonStageType,
    note: string,
    lockVersion: number
  ): Promise<Lesson> {
    return (
      await apiAxios.post<Lesson>(
        `${endpoint}/${id}/stages/request-changes`,
        { stage, note, lockVersion },
        { skipGlobalError: true }
      )
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
      await apiAxios.post<LessonPublicationResponse>(
        `${endpoint}/${id}/publish-week-material`,
        undefined,
        // The review screen owns publication feedback (state banner + retry guidance).
        { skipGlobalError: true }
      )
    ).data;
  },
  async getPublicationPreview(id: string, signal?: AbortSignal): Promise<LessonPublicationPreview> {
    return (
      await apiAxios.get<LessonPublicationPreview>(`${endpoint}/${id}/publication-preview`, {
        signal,
        // Informative only: the publish dialog shows its own note when this fails.
        skipGlobalError: true,
      })
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
