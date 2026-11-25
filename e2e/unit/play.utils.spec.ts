import { expect, test } from '@playwright/test';

import { MediaUploadType } from '@/store/slices/types';
import type { PlayVideo } from '@/features/play/types';
import {
  formatDuration,
  formatViews,
  progressPercent,
  resumeAt,
  timeAgo,
} from '@/features/play/utils';

const video = (overrides: Partial<PlayVideo> = {}): PlayVideo => ({
  id: 'v1',
  title: 'Vídeo',
  description: '',
  uploadType: MediaUploadType.LINK,
  url: 'https://youtu.be/abc',
  isLocalFile: false,
  galleryId: 'g1',
  galleryTitle: 'Galeria',
  featured: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  thumbnailUrl: null,
  durationSeconds: 200,
  categoryId: null,
  categoryName: null,
  viewCount: 0,
  favorite: false,
  progress: null,
  ...overrides,
});

test('formatDuration', () => {
  expect(formatDuration(75)).toBe('1:15');
  expect(formatDuration(3725)).toBe('1:02:05');
  expect(formatDuration(null)).toBe('');
});

test('formatViews', () => {
  expect(formatViews(0)).toBe('0 visualizações');
  expect(formatViews(1)).toBe('1 visualização');
  expect(formatViews(1200)).toBe('1,2 mil visualizações');
});

test('timeAgo', () => {
  const now = new Date('2026-06-10T00:00:00.000Z');
  expect(timeAgo('2026-06-09T00:00:00.000Z', now)).toBe('há 1 dia');
  expect(timeAgo('2026-04-10T00:00:00.000Z', now)).toBe('há 2 meses');
  expect(timeAgo('2026-06-09T23:50:00.000Z', now)).toBe('agora há pouco');
});

test('progressPercent usa a duração do progresso ou do vídeo e fecha em 100 quando concluído', () => {
  expect(progressPercent(video())).toBe(0);
  expect(
    progressPercent(video({ progress: { positionSeconds: 50, durationSeconds: 200, completed: false } }))
  ).toBe(25);
  expect(
    progressPercent(video({ progress: { positionSeconds: 50, durationSeconds: null, completed: false } }))
  ).toBe(25);
  expect(
    progressPercent(video({ progress: { positionSeconds: 0, durationSeconds: 200, completed: true } }))
  ).toBe(100);
});

test('resumeAt só retoma quando há progresso útil e o vídeo não está no fim', () => {
  const at = (positionSeconds: number, completed = false) =>
    resumeAt(video({ progress: { positionSeconds, durationSeconds: 200, completed } }), 5);
  expect(resumeAt(video(), 5)).toBe(0);
  expect(at(3)).toBe(0);
  expect(at(60)).toBe(60);
  expect(at(198)).toBe(0);
  expect(at(60, true)).toBe(0);
});
