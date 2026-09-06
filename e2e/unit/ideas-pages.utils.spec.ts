import { expect, test } from '@playwright/test';

import {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

import { IDEAS_PAGE_PAYLOAD_FIELD } from '@/features/ideas-pages/constants';
import { IdeasPageResponse, IdeasSectionDraft } from '@/features/ideas-pages/types';
import {
  buildIdeasPageFormData,
  buildIdeasPagePayload,
  buildMediaFieldKey,
  countMedia,
  fileExtensionOf,
  isUploadedMedia,
  mediasOfType,
  replaceMediasOfType,
  toFormValues,
  toSectionDrafts,
  truncate,
} from '@/features/ideas-pages/utils';

const linkedVideo = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  id: 'media-1',
  title: 'Vídeo',
  description: 'Descrição',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: 'https://youtube.com/watch?v=abc',
  ...overrides,
});

const uploadedImage = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  title: 'Foto',
  description: '',
  mediaType: MediaType.IMAGE,
  uploadType: MediaUploadType.UPLOAD,
  url: 'blob:preview',
  isLocalFile: true,
  file: new File(['x'], 'foto.png', { type: 'image/png' }),
  ...overrides,
});

const section = (
  overrides: Partial<IdeasSectionDraft> = {},
): IdeasSectionDraft => ({
  title: 'Abertura',
  description: 'Materiais',
  public: false,
  medias: [],
  ...overrides,
});

const values = { title: '  Ideias  ', description: '  Descrição  ' };

test.describe('utils da página de ideias', () => {
  test.describe('truncate', () => {
    test('corta textos longos e mantém os curtos', () => {
      expect(truncate('a'.repeat(120), 10)).toBe(`${'a'.repeat(10)}...`);
      expect(truncate('curto', 10)).toBe('curto');
      expect(truncate(undefined, 10)).toBe('');
    });
  });

  test.describe('fileExtensionOf', () => {
    test('devolve a extensão do arquivo', () => {
      expect(fileExtensionOf('foto.PNG')).toBe('PNG');
    });

    test('usa a extensão de reserva quando não há uma', () => {
      expect(fileExtensionOf('arquivo')).toBe('bin');
    });
  });

  test.describe('buildMediaFieldKey', () => {
    test('inclui tipo, seção e posição para não repetir chave na página', () => {
      expect(buildMediaFieldKey(MediaType.IMAGE, 1, 2, 'foto.png')).toBe(
        'image_1_2.png',
      );
      expect(buildMediaFieldKey(MediaType.IMAGE, 2, 1, 'foto.png')).not.toBe(
        buildMediaFieldKey(MediaType.IMAGE, 1, 2, 'foto.png'),
      );
    });
  });

  test.describe('isUploadedMedia', () => {
    test('reconhece arquivo enviado e link', () => {
      expect(isUploadedMedia(uploadedImage())).toBe(true);
      expect(isUploadedMedia(linkedVideo())).toBe(false);
    });
  });

  test.describe('buildIdeasPagePayload', () => {
    test('envia título e descrição sem espaços em volta', () => {
      const payload = buildIdeasPagePayload(values, [], new FormData());

      expect(payload.title).toBe('Ideias');
      expect(payload.description).toBe('Descrição');
    });

    test('inclui o id da página apenas na edição', () => {
      expect(
        buildIdeasPagePayload(values, [], new FormData()).id,
      ).toBeUndefined();
      expect(
        buildIdeasPagePayload(values, [], new FormData(), 'page-1').id,
      ).toBe('page-1');
    });

    test('anexa o arquivo e a chave de uma mídia nova', () => {
      const formData = new FormData();
      const payload = buildIdeasPagePayload(
        values,
        [section({ medias: [uploadedImage()] })],
        formData,
      );

      const media = payload.sections[0].medias[0];
      expect(media.fieldKey).toBe('image_0_0.png');
      expect(formData.get('image_0_0.png')).toBeInstanceOf(File);
      // A URL de pré-visualização é local e não pode virar a URL salva.
      expect(media.url).toBe('');
      expect(media.isLocalFile).toBe(true);
    });

    test('reenvia a mídia já gravada pelo id e pela URL, sem arquivo', () => {
      const formData = new FormData();
      const stored = uploadedImage({
        id: 'media-9',
        url: 'https://s3/foto.png',
        file: undefined,
      });

      const payload = buildIdeasPagePayload(
        values,
        [section({ id: 'section-1', medias: [stored] })],
        formData,
      );

      const media = payload.sections[0].medias[0];
      expect(media.id).toBe('media-9');
      expect(media.url).toBe('https://s3/foto.png');
      expect(media.fieldKey).toBeUndefined();
      expect(Array.from(formData.keys())).toHaveLength(0);
    });

    test('mantém chaves distintas para arquivos em seções diferentes', () => {
      const formData = new FormData();
      const payload = buildIdeasPagePayload(
        values,
        [
          section({ medias: [uploadedImage()] }),
          section({ medias: [uploadedImage()] }),
        ],
        formData,
      );

      expect(payload.sections[0].medias[0].fieldKey).toBe('image_0_0.png');
      expect(payload.sections[1].medias[0].fieldKey).toBe('image_1_0.png');
      expect(Array.from(formData.keys())).toHaveLength(2);
    });

    test('preserva a visibilidade e o id de cada seção', () => {
      const payload = buildIdeasPagePayload(
        values,
        [section({ id: 'section-1', public: true })],
        new FormData(),
      );

      expect(payload.sections[0]).toMatchObject({
        id: 'section-1',
        public: true,
      });
    });

    test('usa a plataforma "Outro" quando a mídia não tem uma', () => {
      const payload = buildIdeasPagePayload(
        values,
        [section({ medias: [linkedVideo({ platformType: undefined })] })],
        new FormData(),
      );

      expect(payload.sections[0].medias[0].platformType).toBe(
        MediaPlatform.ANY,
      );
    });
  });

  test.describe('buildIdeasPageFormData', () => {
    test('coloca o JSON no campo multipart esperado pela API', () => {
      const formData = buildIdeasPageFormData(values, [section()]);
      const raw = formData.get(IDEAS_PAGE_PAYLOAD_FIELD);

      expect(typeof raw).toBe('string');
      expect(JSON.parse(raw as string).sections).toHaveLength(1);
    });
  });

  test.describe('toFormValues e toSectionDrafts', () => {
    const page = {
      id: 'page-1',
      title: 'Ideias',
      subtitle: '',
      description: 'Descrição',
      public: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      route: {
        title: 'Ideias',
        public: false,
        subtitle: '',
        image: '',
        idToFetch: 'page-1',
        path: 'galeria_ideias_ideias',
        entityType: 'IdeasPage',
        description: '',
        entityId: 'page-1',
        type: 'page',
      },
      sections: [
        {
          id: 'section-1',
          title: 'Abertura',
          description: 'Materiais',
          public: true,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          medias: [
            {
              id: 'media-1',
              title: 'Foto',
              description: '',
              mediaType: MediaType.IMAGE,
              uploadType: MediaUploadType.UPLOAD,
              url: 'https://s3/foto.png',
              isLocalFile: true,
              originalName: 'foto.png',
              size: 10,
              createdAt: '2026-01-01T00:00:00.000Z',
              updatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      ],
    } as unknown as IdeasPageResponse;

    test('devolve valores vazios na criação', () => {
      expect(toFormValues(null)).toEqual({ title: '', description: '' });
      expect(toSectionDrafts(null)).toEqual([]);
    });

    test('carrega as seções da página sem arquivo local', () => {
      const drafts = toSectionDrafts(page);

      expect(drafts[0]).toMatchObject({ id: 'section-1', public: true });
      expect(drafts[0].medias[0]).toMatchObject({
        id: 'media-1',
        url: 'https://s3/foto.png',
        file: undefined,
      });
    });
  });

  test.describe('mediasOfType e replaceMediasOfType', () => {
    test('filtra por tipo', () => {
      const medias = [linkedVideo(), uploadedImage()];

      expect(mediasOfType(medias, MediaType.VIDEO)).toHaveLength(1);
      expect(mediasOfType(medias, MediaType.DOCUMENT)).toHaveLength(0);
    });

    test('troca apenas as mídias do tipo informado', () => {
      const video = linkedVideo();
      const next = replaceMediasOfType(
        [video, uploadedImage()],
        MediaType.IMAGE,
        [],
      );

      expect(next).toEqual([video]);
    });
  });

  test.describe('countMedia', () => {
    test('soma as mídias de todas as seções', () => {
      expect(
        countMedia([
          section({ medias: [linkedVideo()] }),
          section({ medias: [linkedVideo(), uploadedImage()] }),
        ]),
      ).toBe(3);
    });
  });
});
