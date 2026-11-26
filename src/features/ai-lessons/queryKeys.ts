import { LessonCategory, type GetLessonDraftsParams } from './types';

export const aiLessonsKeys = {
  all: ['ai-lessons'] as const,
  lists: ['ai-lessons', 'lists'] as const,
  drafts: (params: GetLessonDraftsParams = {}) => ['ai-lessons', 'lists', params] as const,
  detail: (id: string) => ['ai-lessons', 'detail', id] as const,
  dashboard: ['ai-lessons', 'dashboard'] as const,
  activeGenerations: ['ai-lessons', 'generations', 'active'] as const,
  publicationPreviews: (id: string) => ['ai-lessons', 'publication-preview', id] as const,
  /** The status is part of the key: every lesson transition asks the API again. */
  publicationPreview: (id: string, status?: string) =>
    ['ai-lessons', 'publication-preview', id, status ?? 'unknown'] as const,
  preferencesByUser: (userId?: string | null, category: LessonCategory = LessonCategory.REGULAR) =>
    ['ai-lessons', 'prompt-preferences', userId ?? 'anonymous', category] as const,
};
