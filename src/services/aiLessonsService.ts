import apiAxios from '@/config/axiosConfig';
import {
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
} from '@/features/ai-lessons/types';
import { parseSseChunk } from '@/features/ai-lessons/utils';
import { AI_LESSON_EVENTS_STALE_TIMEOUT_MS } from '@/features/ai-lessons/constants';

export {
  LessonStageStatus,
  LessonStageType,
  LessonVisualOrientation,
  LessonVisualType,
} from '@/features/ai-lessons/types';
export type TiptapDocument = { type: 'doc'; content?: Array<Record<string, unknown>> };
export type LessonVersion = {
  id: string;
  versionNumber: number;
  tiptapAstJson: TiptapDocument;
  structuredDataJson: Record<string, unknown>;
  changeSummary: string;
  createdAt: string;
};
export type LessonStage = {
  id: string;
  type: LessonStageType;
  status: LessonStageStatus;
  currentVersionId: string | null;
  lockVersion: number;
  failureMessage: string | null;
  versions: LessonVersion[];
};
export type Lesson = {
  id: string;
  theme: string;
  biblicalReference: string;
  weekNumber: number;
  status: string;
  weekMaterialId: string | null;
  createdAt: string;
  updatedAt: string;
  stages: LessonStage[];
  comments: LessonComment[];
};
export type LessonComment = {
  id: string;
  sectionKey: string;
  commentText: string;
  isResolved: boolean;
  authorId: string;
  createdAt: string;
};
export type LessonDashboard = { total: number; byStatus: Record<string, number>; recent: Lesson[] };
export type GenerateLessonPayload = {
  theme: string;
  biblicalReference: string;
  weekNumber: number;
};
export type SaveTiptapPayload = {
  stage: LessonStageType;
  lockVersion: number;
  tiptapAstJson: TiptapDocument;
  structuredDataJson?: Record<string, unknown>;
  changeSummary?: string;
};
export type RegenerateSectionPayload = {
  stage: LessonStageType;
  revisionInstructions?: string;
  visualType?: LessonVisualType;
  visualOrientation?: LessonVisualOrientation;
  visualQuantity?: number;
};
export type AdminPromptPreference = {
  stage: LessonStageType;
  basePrompt: string;
  customPrompt: string | null;
  effectivePrompt: string;
  lockVersion: number | null;
};
export type GetLessonDraftsParams = {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
};
const endpoint = '/api/v1/lessons';
export const aiLessonsService = {
  async generateDraft(payload: GenerateLessonPayload): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(endpoint, payload)).data;
  },
  async getDrafts(
    params?: GetLessonDraftsParams | string,
    page = 1,
    limit = 10
  ): Promise<{ items: Lesson[]; total: number }> {
    let queryParams: Record<string, unknown> = {};
    if (typeof params === 'object' && params !== null) {
      queryParams = { ...params };
    } else if (typeof params === 'string') {
      queryParams = { status: params, page, limit };
    } else {
      queryParams = { page, limit };
    }
    return (await apiAxios.get(endpoint, { params: queryParams })).data;
  },
  async getDraftById(id: string): Promise<Lesson> {
    return (await apiAxios.get<Lesson>(`${endpoint}/${id}`)).data;
  },
  subscribeToLessonEvents(
    id: string,
    onLesson: (lesson: Lesson) => void,
    onDisconnect: () => void
  ): () => void {
    const controller = new AbortController();
    let consumedLength = 0;
    let pending = '';
    let closed = false;
    let staleTimer: ReturnType<typeof setTimeout>;
    const notifyDisconnect = () => {
      if (closed) return;
      closed = true;
      controller.abort();
      onDisconnect();
    };
    const resetWatchdog = () => {
      clearTimeout(staleTimer);
      staleTimer = setTimeout(notifyDisconnect, AI_LESSON_EVENTS_STALE_TIMEOUT_MS);
    };
    resetWatchdog();
    void apiAxios
      .get<string>(`${endpoint}/${id}/events`, {
        signal: controller.signal,
        responseType: 'text',
        skipGlobalError: true,
        onDownloadProgress: ({ event }) => {
          resetWatchdog();
          const request = event.target as XMLHttpRequest | null;
          const responseText = request?.responseText ?? '';
          pending += responseText.slice(consumedLength);
          consumedLength = responseText.length;
          const parsed = parseSseChunk(pending);
          pending = parsed.remainder;
          try {
            for (const data of parsed.messages) onLesson(JSON.parse(data) as Lesson);
          } catch {
            notifyDisconnect();
          }
        },
      })
      .catch(() => {
        notifyDisconnect();
      });
    return () => {
      closed = true;
      clearTimeout(staleTimer);
      controller.abort();
    };
  },
  async deleteDraft(id: string): Promise<{ success: boolean; message: string }> {
    return (await apiAxios.delete(`${endpoint}/${id}`)).data;
  },
  async getDashboard(): Promise<LessonDashboard> {
    return (await apiAxios.get<LessonDashboard>(`${endpoint}/dashboard`)).data;
  },
  async generateStage(id: string, payload: RegenerateSectionPayload): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/generate`, payload)).data;
  },
  async updateContent(id: string, payload: SaveTiptapPayload): Promise<Lesson> {
    return (await apiAxios.patch<Lesson>(`${endpoint}/${id}/stages/content`, payload)).data;
  },
  async completeProductionStage(id: string, stage: LessonStageType): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/complete-production`, { stage }))
      .data;
  },
  async submitPackageReview(id: string): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/package/submit-review`)).data;
  },
  async approveStage(id: string, stage: LessonStageType): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/approve`, { stage })).data;
  },
  async requestChanges(id: string, stage: LessonStageType, note: string): Promise<Lesson> {
    return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/request-changes`, { stage, note }))
      .data;
  },
  async exportPdf(id: string): Promise<Blob> {
    return (await apiAxios.post(`${endpoint}/${id}/export/pdf`, {}, { responseType: 'blob' })).data;
  },
  async previewStagePdf(id: string, stage: LessonStageType): Promise<Blob> {
    return (
      await apiAxios.get(`${endpoint}/${id}/stages/${stage}/preview.pdf`, { responseType: 'blob' })
    ).data;
  },
  async publishToWeekMaterial(id: string): Promise<{ lesson: Lesson; weekMaterialId: string }> {
    return (await apiAxios.post(`${endpoint}/${id}/publish-week-material`)).data;
  },
  async getPromptPreferences(): Promise<AdminPromptPreference[]> {
    return (await apiAxios.get(`${endpoint}/prompt-preferences/me`)).data;
  },
  async savePromptPreference(
    stage: LessonStageType,
    prompt: string,
    lockVersion: number | null
  ): Promise<AdminPromptPreference> {
    return (
      await apiAxios.patch(`${endpoint}/prompt-preferences/me`, {
        stage,
        prompt,
        lockVersion: lockVersion ?? undefined,
      })
    ).data;
  },
  async resetPromptPreference(stage: LessonStageType): Promise<AdminPromptPreference> {
    return (await apiAxios.post(`${endpoint}/prompt-preferences/me/reset`, { stage })).data;
  },
};
