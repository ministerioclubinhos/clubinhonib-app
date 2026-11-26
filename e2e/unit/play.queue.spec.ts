import { expect, test } from '@playwright/test';

import { MediaUploadType } from '@/store/slices/types';
import type { PlayVideo } from '@/features/play/types';
import {
  buildOrder,
  createQueue,
  nextInQueue,
  previousInQueue,
  shuffled,
  upcoming,
  withShuffle,
} from '@/features/play/queue';

const video = (id: string): PlayVideo => ({
  id,
  title: `Vídeo ${id}`,
  description: '',
  uploadType: MediaUploadType.LINK,
  url: 'https://youtu.be/abc',
  isLocalFile: false,
  galleryId: 'g',
  galleryTitle: 'G',
  featured: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  thumbnailUrl: null,
  durationSeconds: null,
  categoryId: null,
  categoryName: null,
  viewCount: 0,
  favorite: false,
  progress: null,
});

const videos = ['a', 'b', 'c', 'd'].map(video);
/** Gerador previsível: sempre o último índice, que inverte a lista. */
const lastIndex = () => 0.999;

test('shuffled não altera a lista original e mantém os mesmos itens', () => {
  const original = ['a', 'b', 'c', 'd'];
  const result = shuffled(original, lastIndex);
  expect(original).toEqual(['a', 'b', 'c', 'd']);
  expect([...result].sort()).toEqual(original);
});

test('buildOrder em sequência começa do vídeo escolhido e volta ao início', () => {
  expect(buildOrder(videos, false)).toEqual(['a', 'b', 'c', 'd']);
  expect(buildOrder(videos, false, 'c')).toEqual(['c', 'd', 'a', 'b']);
});

test('buildOrder aleatório põe o vídeo atual primeiro e não repete nem perde ninguém', () => {
  const order = buildOrder(videos, true, 'c', lastIndex);
  expect(order[0]).toBe('c');
  expect([...order].sort()).toEqual(['a', 'b', 'c', 'd']);
});

test('próximo e anterior seguem a ordem da fila e acabam nas pontas', () => {
  const queue = { ...createQueue(videos, false, 'Todos'), order: ['b', 'c', 'a'] };
  expect(nextInQueue(queue, 'b')).toBe('c');
  expect(nextInQueue(queue, 'a')).toBeNull();
  expect(previousInQueue(queue, 'b')).toBeNull();
  expect(previousInQueue(queue, 'a')).toBe('c');
  expect(nextInQueue(queue, 'zzz')).toBeNull();
});

test('upcoming lista só o que falta tocar, com os dados dos vídeos', () => {
  const queue = { ...createQueue(videos, false, 'Todos'), order: ['b', 'c', 'a'] };
  expect(upcoming(queue, 'b').map((item) => item.id)).toEqual(['c', 'a']);
  expect(upcoming(queue, 'a')).toEqual([]);
  expect(upcoming(queue, 'zzz')).toEqual([]);
});

test('withShuffle mantém o vídeo atual e troca o modo', () => {
  const queue = createQueue(videos, false, 'Todos');
  const shuffledQueue = withShuffle(queue, true, 'b');
  expect(shuffledQueue.shuffle).toBe(true);
  expect(shuffledQueue.order[0]).toBe('b');
  expect(withShuffle(shuffledQueue, false, 'b').order).toEqual(['b', 'c', 'd', 'a']);
});
