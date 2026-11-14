import { API_URL } from './env';
import type { Page, Route } from '@playwright/test';
import {
  IdeaAiDecision,
  IdeaAiMediaStatus,
  IdeaAiScope,
  IdeaAiSnapshotSource,
  IdeaAiStatus,
  type IdeaAiAttempt,
  type IdeasSectionResponse,
} from '../../src/features/ideas-sections/types';
export const IDEA_ID = '5c096a29-2e77-4973-8b51-390e3e893a43';
export const PAGE_ID = 'e4beee3f-e7ca-49ba-8095-24538a2d20a1';
export const AI_ID = 'f8beee3f-e7ca-49ba-8095-24538a2d20a1';
export const originalIdea: IdeasSectionResponse = {
  id: IDEA_ID,
  title: 'Gincana do Bom Pastor',
  description: 'Separe 3 bolas e forme 2 equipes. Leia João 3:16 antes da atividade.',
  public: false,
  pageId: null,
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
  medias: [
    {
      id: 'f1beee3f-e7ca-49ba-8095-24538a2d20a1',
      title: 'Documento 1 — Gincana',
      description: '',
      mediaType: 'document',
      uploadType: 'upload',
      url: '/test-assets/original.pdf',
      originalName: 'Roteiro da atividade.pdf',
      size: 1000,
      isLocalFile: true,
      platformType: null,
    },
    {
      id: 'f2beee3f-e7ca-49ba-8095-24538a2d20a1',
      title: 'Imagem 1 — Gincana',
      description: '',
      mediaType: 'image',
      uploadType: 'upload',
      url: '/test-assets/original.png',
      originalName: 'Materiais da gincana.png',
      size: 1000,
      isLocalFile: true,
      platformType: null,
    },
  ],
};
export function completedAttempt(): IdeaAiAttempt {
  return {
    id: AI_ID,
    attempt: 1,
    status: IdeaAiStatus.COMPLETED,
    requestedAt: originalIdea.createdAt,
    startedAt: originalIdea.createdAt,
    finishedAt: originalIdea.createdAt,
    errorCode: null,
    scope: IdeaAiScope.FULL,
    includeText: true,
    targetMediaIds: null,
    baseAttempt: null,
    instructions: null,
    progressDone: 3,
    progressTotal: 3,
    countsTowardLimit: true,
    enhancedTitle: 'Gincana do Bom Pastor',
    enhancedDescription: 'Forme 2 equipes e separe 3 bolas. Antes da atividade, leia João 3:16.',
    textGuard: { approved: true, violations: [] },
    titleDecision: IdeaAiDecision.PENDING,
    descriptionDecision: IdeaAiDecision.PENDING,
    medias: originalIdea.medias.map((media) => ({
      sourceMediaId: media.id,
      status: IdeaAiMediaStatus.ENHANCED,
      decision: IdeaAiDecision.PENDING,
      guard: { approved: true, violations: [] },
      skipReason: null,
      errorCode: null,
      carriedOver: false,
      enhancedMedia: {
        ...media,
        id: `enhanced-${media.id}`,
        url: media.url.replace('original', 'enhanced'),
      },
      editableMedia:
        media.mediaType === 'document'
          ? {
              ...media,
              id: 'docx',
              url: '/test-assets/editable.docx',
              originalName: 'editavel.docx',
            }
          : null,
    })),
  };
}
export function ideaWithAi(): IdeasSectionResponse {
  const currentResult = completedAttempt();
  return {
    ...originalIdea,
    aiStatus: IdeaAiStatus.COMPLETED,
    aiEnhancement: {
      snapshot: {
        title: originalIdea.title,
        description: originalIdea.description,
        submittedAt: originalIdea.createdAt,
        source: IdeaAiSnapshotSource.SUBMISSION,
        medias: originalIdea.medias,
      },
      maxAttempts: 5,
      attemptsUsed: 1,
      providerReady: true,
      enabled: true,
      activeAttempt: null,
      currentResult,
      attemptHistory: [currentResult],
    },
  };
}
export async function mockIdeasApp(
  page: Page,
  handle?: (route: Route, path: string) => Promise<boolean>
): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'ideas-mock-token');
    localStorage.setItem('refreshToken', 'ideas-mock-refresh');
  });
  await page.route('**/test-assets/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aR1sAAAAASUVORK5CYII=',
        'base64'
      ),
    })
  );
  await page.route(
    (url) => url.origin === new URL(API_URL).origin,
    async (route) => {
      const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
      if (handle && (await handle(route, path))) return;
      if (path === '/routes') return route.fulfill({ json: [] });
      if (path === '/auth/me')
        return route.fulfill({
          json: {
            id: 'mock-admin',
            name: 'Coordenação',
            email: 'admin@example.test',
            role: 'admin',
            active: true,
            completed: true,
            commonUser: false,
            emailVerified: true,
            createdAt: originalIdea.createdAt,
            updatedAt: originalIdea.updatedAt,
          },
        });
      if (path.includes('feature-flags'))
        return route.fulfill({
          json: { idea_submission: true, idea_moderation: true, idea_ai_enhancement: false },
        });
      if (path === '/ideas-pages')
        return route.fulfill({
          json: {
            data: [{ id: PAGE_ID, title: 'Atividades do Clubinho', public: true, sectionCount: 0 }],
            total: 1,
            page: 1,
            limit: 100,
            pageCount: 1,
          },
        });
      if (path === `/ideas-sections/${IDEA_ID}`) return route.fulfill({ json: ideaWithAi() });
      if (path === '/ideas-sections')
        return route.fulfill({
          json: { data: [ideaWithAi()], total: 1, page: 1, limit: 10, pageCount: 1 },
        });
      if (path.endsWith('/pending-count')) return route.fulfill({ json: { pending: 0 } });
      return route.fulfill({ json: { data: [], total: 0, items: [], unreadCount: 0 } });
    }
  );
}
