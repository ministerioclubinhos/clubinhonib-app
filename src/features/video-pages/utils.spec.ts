import { describe, expect, it } from 'vitest';

import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { VIDEO_PAGE_PAYLOAD_FIELD } from './constants';
import {
  VideoDraft,
  VideoPageFormValues,
  VideoPageRequest,
  VideoPageSummary,
} from './types';
import {
  buildVideoFieldKey,
  buildVideoPageFormData,
  formatDate,
  isUploadedVideo,
  pageInitials,
  parseSortOption,
  toVideoDrafts,
  truncate,
} from './utils';

const values: VideoPageFormValues = {
  title: 'Galeria de vídeos',
  description: 'Vídeos do evento',
  public: true,
};

const linkedVideo: VideoDraft = {
  id: 'video-1',
  title: 'Vídeo publicado',
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://youtube.com/embed/abc',
};

const storedUpload: VideoDraft = {
  id: 'video-2',
  title: 'Vídeo enviado',
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.UPLOAD,
  isLocalFile: true,
  url: 'https://s3.amazonaws.com/video.mp4',
  originalName: 'video.mp4',
};

const readPayload = (formData: FormData): VideoPageRequest =>
  JSON.parse(formData.get(VIDEO_PAGE_PAYLOAD_FIELD) as string) as VideoPageRequest;

describe('video page utils', () => {
  describe('truncate', () => {
    it('corta textos longos e mantém curtos', () => {
      expect(truncate('abcdef', 3)).toBe('abc...');
      expect(truncate('ab', 3)).toBe('ab');
    });
  });

  describe('isUploadedVideo / buildVideoFieldKey', () => {
    it('distingue upload de link e nomeia o campo multipart', () => {
      expect(isUploadedVideo(storedUpload)).toBe(true);
      expect(isUploadedVideo(linkedVideo)).toBe(false);
      expect(buildVideoFieldKey(2)).toBe('video-2');
    });
  });

  describe('toVideoDrafts', () => {
    it('limpa o arquivo local ao carregar da API', () => {
      const drafts = toVideoDrafts({
        videos: [storedUpload],
      } as never);

      expect(drafts[0].file).toBeUndefined();
      expect(drafts[0].id).toBe('video-2');
    });
  });

  describe('buildVideoPageFormData', () => {
    it('envia o id apenas na edição', () => {
      expect(readPayload(buildVideoPageFormData(values, [])).id).toBeUndefined();
      expect(readPayload(buildVideoPageFormData(values, [], 'p1')).id).toBe('p1');
    });

    it('mantém link com a plataforma escolhida', () => {
      const payload = readPayload(
        buildVideoPageFormData(values, [linkedVideo], 'p1'),
      );

      expect(payload.videos[0]).toMatchObject({
        id: 'video-1',
        uploadType: MediaUploadType.LINK,
        isLocalFile: false,
        url: 'https://youtube.com/embed/abc',
        platformType: MediaPlatform.YOUTUBE,
      });
      expect(payload.videos[0].fieldKey).toBeUndefined();
    });

    it('preserva o upload já salvo, sem anexar arquivo', () => {
      const formData = buildVideoPageFormData(values, [storedUpload], 'p1');
      const payload = readPayload(formData);

      expect(Array.from(formData.keys())).toEqual([VIDEO_PAGE_PAYLOAD_FIELD]);
      expect(payload.videos[0]).toMatchObject({
        id: 'video-2',
        isLocalFile: true,
        url: 'https://s3.amazonaws.com/video.mp4',
      });
      expect(payload.videos[0].fieldKey).toBeUndefined();
    });

    it('anexa o arquivo de um upload novo e omite a URL local', () => {
      const file = new File(['x'], 'novo.mp4', { type: 'video/mp4' });
      const novo: VideoDraft = {
        title: 'Novo',
        description: 'Descrição',
        mediaType: MediaType.VIDEO,
        uploadType: MediaUploadType.UPLOAD,
        url: 'blob:http://localhost/abc',
        file,
      };

      const formData = buildVideoPageFormData(values, [novo]);
      const payload = readPayload(formData);

      expect(formData.get('video-0')).toBeInstanceOf(File);
      expect(payload.videos[0]).toMatchObject({
        fieldKey: 'video-0',
        isLocalFile: true,
        originalName: 'novo.mp4',
      });
      expect(payload.videos[0].url).toBeUndefined();
      expect(payload.videos[0].id).toBeUndefined();
    });

    it('numera os campos multipart pelo índice do vídeo', () => {
      const file = (name: string) => new File(['x'], name);
      const formData = buildVideoPageFormData(values, [
        linkedVideo,
        {
          title: 'Novo',
          description: 'd',
          mediaType: MediaType.VIDEO,
          uploadType: MediaUploadType.UPLOAD,
          url: 'blob:x',
          file: file('b.mp4'),
        },
      ]);

      expect(Array.from(formData.keys()).sort()).toEqual([
        'video-1',
        VIDEO_PAGE_PAYLOAD_FIELD,
      ]);
    });
  });
});

describe('contrato do resumo de /video-pages', () => {
  const summary: VideoPageSummary = {
    id: 'page-1',
    title: 'Louvores 2026',
    description: 'Vídeos do louvor',
    public: true,
    routePath: 'galeria_videos_louvores_2026',
    videoCount: 4,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-11T12:00:00.000Z',
  };

  it('tem exatamente os campos que a listagem usa', () => {
    expect(Object.keys(summary).sort()).toEqual([
      'createdAt',
      'description',
      'id',
      'public',
      'routePath',
      'title',
      'updatedAt',
      'videoCount',
    ]);
  });

  it('aceita página sem rota', () => {
    const semRota: VideoPageSummary = { ...summary, routePath: null };

    expect(semRota.routePath).toBeNull();
  });

  it('formata a data e protege contra valor inválido', () => {
    expect(formatDate(summary.createdAt)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('monta as iniciais do avatar', () => {
    expect(pageInitials('Louvores 2026')).toBe('L2');
    expect(pageInitials('Louvores')).toBe('LO');
    expect(pageInitials('   ')).toBe('?');
  });

  it('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('title:DESC')).toEqual({
      sort: 'title',
      order: 'DESC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'createdAt',
      order: 'DESC',
    });
  });
});
