import { expect, test } from '@playwright/test';

import type { PlaySubmissionDraft } from '@/features/play/submissions/types';
import {
  buildSubmissionFormData,
  formatFileSize,
  isYouTubeLink,
  validateSubmission,
} from '@/features/play/submissions/utils';

const draft = (overrides: Partial<PlaySubmissionDraft> = {}): PlaySubmissionDraft => ({
  title: 'Meu vídeo',
  description: '',
  mode: 'link',
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  file: null,
  thumbnail: null,
  durationSeconds: null,
  ...overrides,
});
const video = (size = 1000, type = 'video/mp4') => {
  const file = new File(['x'], 'v.mp4', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

test('isYouTubeLink aceita só vídeos do YouTube', () => {
  expect(isYouTubeLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  expect(isYouTubeLink('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  expect(isYouTubeLink('https://vimeo.com/123')).toBe(false);
  expect(isYouTubeLink('https://evil.com/?v=dQw4w9WgXcQ')).toBe(false);
  expect(isYouTubeLink('não é link')).toBe(false);
});

test('validateSubmission cobra título e a fonte do vídeo', () => {
  expect(validateSubmission(draft())).toEqual({});
  expect(validateSubmission(draft({ title: '  ' })).title).toBeTruthy();
  expect(validateSubmission(draft({ url: 'https://vimeo.com/1' })).url).toBeTruthy();
  expect(validateSubmission(draft({ mode: 'upload' })).file).toBeTruthy();
  expect(validateSubmission(draft({ mode: 'upload', file: video(1000, 'image/png') })).file).toBeTruthy();
  expect(validateSubmission(draft({ mode: 'upload', file: video(101 * 1024 * 1024) })).file).toBeTruthy();
  expect(validateSubmission(draft({ mode: 'upload', file: video() }))).toEqual({});
});

test('buildSubmissionFormData de link leva só o JSON', () => {
  const formData = buildSubmissionFormData(draft({ url: ' https://youtu.be/dQw4w9WgXcQ ' }));
  const payload = JSON.parse(String(formData.get('submissionData')));
  expect(payload).toMatchObject({ uploadType: 'link', url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Meu vídeo' });
  expect(formData.get('video')).toBeNull();
});

test('buildSubmissionFormData de upload leva arquivo, miniatura e duração, sem url', () => {
  const thumb = new File(['t'], 'miniatura.jpg', { type: 'image/jpeg' });
  const formData = buildSubmissionFormData(
    draft({ mode: 'upload', url: 'ignorada', file: video(), thumbnail: thumb, durationSeconds: 75 })
  );
  const payload = JSON.parse(String(formData.get('submissionData')));
  expect(payload).toMatchObject({ uploadType: 'upload', durationSeconds: 75 });
  expect(payload).not.toHaveProperty('url');
  expect(formData.get('video')).toBeInstanceOf(File);
  expect(formData.get('thumbnail')).toBeInstanceOf(File);
});

test('formatFileSize', () => {
  expect(formatFileSize(1_572_864)).toBe('1,5 MB');
  expect(formatFileSize(null)).toBe('');
});
