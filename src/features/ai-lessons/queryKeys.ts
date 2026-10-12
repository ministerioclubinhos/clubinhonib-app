import type { GetLessonDraftsParams } from './types';

export const aiLessonsKeys = {
  all: ['ai-lessons'] as const,
  lists: ['ai-lessons', 'lists'] as const,
  drafts: (params: GetLessonDraftsParams = {}) => ['ai-lessons', 'lists', params] as const,
  detail: (id: string) => ['ai-lessons', 'detail', id] as const,
  dashboard: ['ai-lessons', 'dashboard'] as const,
  preferences: ['ai-lessons', 'prompt-preferences'] as const,
};
