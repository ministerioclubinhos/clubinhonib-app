import apiAxios from '@/config/axiosConfig';

export enum LessonStageType { LESSON = 'LESSON', LESSON_VISUALS = 'LESSON_VISUALS', STANDARD_GAME = 'STANDARD_GAME', VERSE_VISUALS = 'VERSE_VISUALS', VERSE_FIXATION = 'VERSE_FIXATION', MEDITATION_YOUNGER = 'MEDITATION_YOUNGER', MEDITATION_OLDER = 'MEDITATION_OLDER', MANUAL_WORK = 'MANUAL_WORK' }
export enum LessonStageStatus { NOT_STARTED = 'NOT_STARTED', GENERATING = 'GENERATING', DRAFT = 'DRAFT', PRODUCER_APPROVED = 'PRODUCER_APPROVED', IN_REVIEW = 'IN_REVIEW', CHANGES_REQUESTED = 'CHANGES_REQUESTED', APPROVED = 'APPROVED', FAILED = 'FAILED', STALE = 'STALE' }
export enum LessonVisualType { STORY_SEQUENCE = 'STORY_SEQUENCE', CHARACTER_AND_EMOTION = 'CHARACTER_AND_EMOTION', VISUAL_ANCHORS = 'VISUAL_ANCHORS', INTERACTIVE_COLORING = 'INTERACTIVE_COLORING' }
export enum LessonVisualOrientation { LANDSCAPE = 'LANDSCAPE', PORTRAIT = 'PORTRAIT' }
export type TiptapDocument = { type: 'doc'; content?: Array<Record<string, unknown>> };
export type LessonVersion = { id: string; versionNumber: number; tiptapAstJson: TiptapDocument; structuredDataJson: Record<string, unknown>; changeSummary: string; createdAt: string };
export type LessonStage = { id: string; type: LessonStageType; status: LessonStageStatus; currentVersionId: string | null; lockVersion: number; failureMessage: string | null; versions: LessonVersion[] };
export type Lesson = { id: string; theme: string; biblicalReference: string; weekNumber: number; status: string; weekMaterialId: string | null; createdAt: string; updatedAt: string; stages: LessonStage[] };
export type LessonDashboard = { total: number; byStatus: Record<string, number>; recent: Lesson[] };
export type GenerateLessonPayload = { theme: string; biblicalReference: string; weekNumber?: number };
export type SaveTiptapPayload = { stage: LessonStageType; lockVersion: number; tiptapAstJson: TiptapDocument; structuredDataJson?: Record<string, unknown>; changeSummary?: string };
export type RegenerateSectionPayload = { stage: LessonStageType; revisionInstructions?: string; visualType?: LessonVisualType; visualOrientation?: LessonVisualOrientation; visualQuantity?: number };
export type AdminPromptPreference = { stage: LessonStageType; basePrompt: string; customPrompt: string | null; effectivePrompt: string; lockVersion: number | null };
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
  async generateDraft(payload: GenerateLessonPayload): Promise<Lesson> { return (await apiAxios.post<Lesson>(endpoint, payload)).data; },
  async getDrafts(params?: GetLessonDraftsParams | string, page = 1, limit = 10): Promise<{ items: Lesson[]; total: number }> {
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
  async getDraftById(id: string): Promise<Lesson> { return (await apiAxios.get<Lesson>(`${endpoint}/${id}`)).data; },
  async deleteDraft(id: string): Promise<{ success: boolean; message: string }> { return (await apiAxios.delete(`${endpoint}/${id}`)).data; },
  async getDashboard(): Promise<LessonDashboard> { return (await apiAxios.get<LessonDashboard>(`${endpoint}/dashboard`)).data; },
  async generateStage(id: string, payload: RegenerateSectionPayload): Promise<Lesson> { return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/generate`, payload)).data; },
  async updateContent(id: string, payload: SaveTiptapPayload): Promise<Lesson> { return (await apiAxios.patch<Lesson>(`${endpoint}/${id}/stages/content`, payload)).data; },
  async completeProductionStage(id: string, stage: LessonStageType): Promise<Lesson> { return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/complete-production`, { stage })).data; },
  async submitPackageReview(id: string): Promise<Lesson> { return (await apiAxios.post<Lesson>(`${endpoint}/${id}/package/submit-review`)).data; },
  async approveStage(id: string, stage: LessonStageType): Promise<Lesson> { return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/approve`, { stage })).data; },
  async requestChanges(id: string, stage: LessonStageType): Promise<Lesson> { return (await apiAxios.post<Lesson>(`${endpoint}/${id}/stages/request-changes`, { stage })).data; },
  async exportPdf(id: string): Promise<Blob> { return (await apiAxios.post(`${endpoint}/${id}/export/pdf`, {}, { responseType: 'blob' })).data; },
  async previewStagePdf(id: string, stage: LessonStageType): Promise<Blob> { return (await apiAxios.get(`${endpoint}/${id}/stages/${stage}/preview.pdf`, { responseType: 'blob' })).data; },
  async publishToWeekMaterial(id: string): Promise<{ lesson: Lesson; weekMaterialId: string }> { return (await apiAxios.post(`${endpoint}/${id}/publish-week-material`)).data; },
  async getPromptPreferences(): Promise<AdminPromptPreference[]> { return (await apiAxios.get(`${endpoint}/prompt-preferences/me`)).data; },
  async savePromptPreference(stage: LessonStageType, prompt: string, lockVersion: number | null): Promise<AdminPromptPreference> { return (await apiAxios.patch(`${endpoint}/prompt-preferences/me`, { stage, prompt, lockVersion: lockVersion ?? undefined })).data; },
  async resetPromptPreference(stage: LessonStageType): Promise<AdminPromptPreference> { return (await apiAxios.post(`${endpoint}/prompt-preferences/me/reset`, { stage })).data; },
};
