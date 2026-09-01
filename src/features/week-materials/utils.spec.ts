import { describe, expect, it } from 'vitest';

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { WEEK_MATERIAL_PAYLOAD_FIELD } from './constants';
import {
  WeekMaterialFormValues,
  WeekMaterialMediaDraft,
  WeekMaterialPageRequest,
  WeekMaterialResponse,
} from './types';
import {
  buildFileFieldName,
  buildWeekMaterialFormData,
  filterByTitle,
  formatDate,
  selectMediaByType,
  sortByCreationDesc,
  toMediaRequest,
  truncate,
} from './utils';

const linkedVideo: MediaItem = {
  id: 'video-1',
  title: 'Vídeo publicado',
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://youtube.com/embed/abc',
};

const storedUpload: MediaItem = {
  id: 'doc-1',
  title: 'Documento enviado',
  description: 'Descrição',
  mediaType: MediaType.DOCUMENT,
  uploadType: MediaUploadType.UPLOAD,
  isLocalFile: true,
  url: 'https://s3.amazonaws.com/doc.pdf',
  originalName: 'doc.pdf',
  size: 1234,
};

const values: WeekMaterialFormValues = {
  pageTitle: 'Semana 12',
  pageSubtitle: 'Tema',
  pageDescription: 'Descrição',
  currentWeek: false,
};

const emptyMedia: WeekMaterialMediaDraft = {
  videos: [],
  documents: [],
  images: [],
  audios: [],
};

const readPayload = (formData: FormData): WeekMaterialPageRequest =>
  JSON.parse(formData.get(WEEK_MATERIAL_PAYLOAD_FIELD) as string) as WeekMaterialPageRequest;

const material = (
  overrides: Partial<WeekMaterialResponse> = {},
): WeekMaterialResponse =>
  ({
    id: 'page-1',
    title: 'Semana 12',
    subtitle: 'Tema',
    description: 'Descrição',
    currentWeek: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    route: {
      id: 'route-1',
      path: 'materiais_semanal_semana_12',
      title: 'Semana 12',
      subtitle: 'Tema',
      description: 'Descrição',
      type: 'page',
      public: true,
    },
    videos: [],
    documents: [],
    images: [],
    audios: [],
    ...overrides,
  }) as WeekMaterialResponse;

describe('week material utils', () => {
  describe('truncate', () => {
    it('keeps short texts untouched', () => {
      expect(truncate('curto', 10)).toBe('curto');
    });

    it('cuts long texts and marks the cut', () => {
      expect(truncate('abcdef', 3)).toBe('abc...');
    });
  });

  describe('formatDate', () => {
    it('falls back when there is no date', () => {
      expect(formatDate()).toBe('Não disponível');
    });

    it('formats an ISO date for pt-BR', () => {
      expect(formatDate('2026-01-01T12:00:00.000Z')).toContain('2026');
    });
  });

  describe('filterByTitle', () => {
    const list = [material({ title: 'Semana 1' }), material({ title: 'Páscoa' })];

    it('returns everything for an empty term', () => {
      expect(filterByTitle(list, '   ')).toHaveLength(2);
    });

    it('matches case-insensitively', () => {
      expect(filterByTitle(list, 'páSCOa').map((m) => m.title)).toEqual(['Páscoa']);
    });
  });

  describe('sortByCreationDesc', () => {
    it('puts the newest page first without mutating the input', () => {
      const list = [
        material({ id: 'old', createdAt: '2025-01-01T00:00:00.000Z' }),
        material({ id: 'new', createdAt: '2026-01-01T00:00:00.000Z' }),
      ];

      expect(sortByCreationDesc(list).map((m) => m.id)).toEqual(['new', 'old']);
      expect(list.map((m) => m.id)).toEqual(['old', 'new']);
    });
  });

  describe('selectMediaByType', () => {
    it('reads the list matching the media type', () => {
      const page = material({
        videos: [{ ...linkedVideo, id: 'v' }] as WeekMaterialResponse['videos'],
      });

      expect(selectMediaByType(page, MediaType.VIDEO)).toHaveLength(1);
      expect(selectMediaByType(page, MediaType.AUDIO)).toHaveLength(0);
    });
  });

  describe('buildFileFieldName', () => {
    it('keeps the original extension', () => {
      expect(buildFileFieldName(MediaType.VIDEO, 2, 'aula.final.mp4')).toBe(
        'video_2.mp4',
      );
    });

    it('falls back when the file has no extension', () => {
      expect(buildFileFieldName(MediaType.AUDIO, 0, 'audio')).toBe('audio_0.audio');
    });
  });

  describe('toMediaRequest', () => {
    it('keeps a linked item pointing at its URL', () => {
      const formData = new FormData();
      const request = toMediaRequest(linkedVideo, 0, MediaType.VIDEO, formData);

      expect(request).toMatchObject({
        id: 'video-1',
        mediaType: MediaType.VIDEO,
        uploadType: MediaUploadType.LINK,
        isLocalFile: false,
        url: 'https://youtube.com/embed/abc',
        platformType: MediaPlatform.YOUTUBE,
      });
      expect(request.fieldKey).toBeUndefined();
      expect(Array.from(formData.keys())).toHaveLength(0);
    });

    it('keeps a stored upload untouched when no new file was chosen', () => {
      const formData = new FormData();
      const request = toMediaRequest(storedUpload, 0, MediaType.DOCUMENT, formData);

      expect(request).toMatchObject({
        id: 'doc-1',
        isLocalFile: true,
        url: 'https://s3.amazonaws.com/doc.pdf',
        platformType: null,
        size: 1234,
      });
      expect(request.fieldKey).toBeUndefined();
      expect(Array.from(formData.keys())).toHaveLength(0);
    });

    it('attaches a newly chosen file and drops its local blob URL', () => {
      const formData = new FormData();
      const file = new File(['x'], 'novo.mp4', { type: 'video/mp4' });
      const request = toMediaRequest(
        {
          ...linkedVideo,
          id: undefined,
          uploadType: MediaUploadType.UPLOAD,
          platformType: undefined,
          url: 'blob:http://localhost/abc',
          file,
        },
        1,
        MediaType.VIDEO,
        formData,
      );

      expect(request.fieldKey).toBe('video_1.mp4');
      expect(request.url).toBeUndefined();
      expect(request.isLocalFile).toBe(true);
      expect(request.platformType).toBeNull();
      expect(request.id).toBeUndefined();
      expect(formData.get('video_1.mp4')).toBeInstanceOf(File);
    });
  });

  describe('edição de uma página existente', () => {
    // Cenário que historicamente quebrou: o admin abre um material salvo, mexe
    // em parte das mídias e salva. O payload precisa preservar os ids, manter
    // intactas as mídias não tocadas e anexar só os arquivos realmente novos.
    it('preserva o que não foi tocado e envia só o que mudou', () => {
      const videoIntocado: MediaItem = { ...linkedVideo };
      const documentoComArquivoNovo: MediaItem = {
        ...storedUpload,
        file: new File(['novo'], 'atualizado.pdf'),
        url: 'blob:http://localhost/novo',
      };
      const audioNovo: MediaItem = {
        title: 'Áudio novo',
        description: 'Descrição',
        mediaType: MediaType.AUDIO,
        uploadType: MediaUploadType.LINK,
        platformType: MediaPlatform.GOOGLE_DRIVE,
        url: 'https://drive.google.com/file/d/1/preview',
      };

      const formData = buildWeekMaterialFormData(
        values,
        {
          videos: [videoIntocado],
          documents: [documentoComArquivoNovo],
          // A imagem que existia na página foi removida pelo admin.
          images: [],
          audios: [audioNovo],
        },
        'page-1',
      );
      const payload = readPayload(formData);

      expect(payload.id).toBe('page-1');

      // Vídeo intocado: mesmo id, mesma URL, nenhum arquivo anexado.
      expect(payload.videos).toEqual([
        expect.objectContaining({
          id: 'video-1',
          url: 'https://youtube.com/embed/abc',
          isLocalFile: false,
        }),
      ]);
      expect(payload.videos[0].fieldKey).toBeUndefined();

      // Documento com arquivo novo: mantém o id, perde a URL local e ganha o
      // fieldKey do arquivo anexado ao FormData.
      expect(payload.documents).toEqual([
        expect.objectContaining({
          id: 'doc-1',
          isLocalFile: true,
          fieldKey: 'document_0.pdf',
        }),
      ]);
      expect(payload.documents[0].url).toBeUndefined();
      expect(formData.get('document_0.pdf')).toBeInstanceOf(File);

      // A imagem removida simplesmente não vai no payload: é assim que a API
      // sabe que deve apagá-la.
      expect(payload.images).toEqual([]);

      // Mídia nova entra sem id, para a API criar.
      expect(payload.audios).toHaveLength(1);
      expect(payload.audios[0].id).toBeUndefined();
      expect(payload.audios[0].mediaType).toBe(MediaType.AUDIO);
    });

    it('não anexa arquivo para upload existente que o admin não trocou', () => {
      const formData = buildWeekMaterialFormData(
        values,
        { ...emptyMedia, documents: [storedUpload] },
        'page-1',
      );
      const payload = readPayload(formData);

      expect(Array.from(formData.keys())).toEqual([WEEK_MATERIAL_PAYLOAD_FIELD]);
      expect(payload.documents[0]).toMatchObject({
        id: 'doc-1',
        url: 'https://s3.amazonaws.com/doc.pdf',
        isLocalFile: true,
      });
      expect(payload.documents[0].fieldKey).toBeUndefined();
    });
  });

  describe('buildWeekMaterialFormData', () => {
    it('sends the page id only when editing', () => {
      expect(readPayload(buildWeekMaterialFormData(values, emptyMedia)).id).toBeUndefined();
      expect(
        readPayload(buildWeekMaterialFormData(values, emptyMedia, 'page-1')).id,
      ).toBe('page-1');
    });

    it('carries the four media groups and the page fields', () => {
      const payload = readPayload(
        buildWeekMaterialFormData(
          values,
          { ...emptyMedia, videos: [linkedVideo], documents: [storedUpload] },
          'page-1',
        ),
      );

      expect(payload).toMatchObject({
        pageTitle: 'Semana 12',
        pageSubtitle: 'Tema',
        pageDescription: 'Descrição',
        currentWeek: false,
      });
      expect(payload.videos).toHaveLength(1);
      expect(payload.documents).toHaveLength(1);
      expect(payload.images).toEqual([]);
      expect(payload.audios).toEqual([]);
    });

    it('numbers the uploaded files per media group', () => {
      const media: WeekMaterialMediaDraft = {
        videos: [
          {
            ...linkedVideo,
            id: undefined,
            uploadType: MediaUploadType.UPLOAD,
            file: new File(['a'], 'a.mp4'),
          },
          {
            ...linkedVideo,
            id: undefined,
            uploadType: MediaUploadType.UPLOAD,
            file: new File(['b'], 'b.mp4'),
          },
        ],
        documents: [],
        images: [
          {
            ...linkedVideo,
            id: undefined,
            mediaType: MediaType.IMAGE,
            uploadType: MediaUploadType.UPLOAD,
            file: new File(['c'], 'c.png'),
          },
        ],
        audios: [],
      };

      const formData = buildWeekMaterialFormData(values, media, 'page-1');

      expect(Array.from(formData.keys()).sort()).toEqual([
        'image_0.png',
        'video_0.mp4',
        'video_1.mp4',
        WEEK_MATERIAL_PAYLOAD_FIELD,
      ]);
    });
  });
});
