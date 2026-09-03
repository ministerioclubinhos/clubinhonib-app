import { describe, expect, it } from 'vitest';

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { IMAGE_PAGE_PAYLOAD_FIELD } from './constants';
import {
  ImagePageFormValues,
  ImagePageRequest,
  ImagePageSummary,
  ImageSectionDraft,
} from './types';
import {
  buildImagePageFormData,
  buildMediaFieldKey,
  countMedia,
  formatDate,
  pageInitials,
  parseSortOption,
  toSectionDrafts,
  truncate,
} from './utils';

const values: ImagePageFormValues = {
  title: 'Retiro 2026',
  description: 'Fotos do retiro',
  public: true,
};

const storedImage: MediaItem = {
  id: 'media-1',
  title: 'Foto salva',
  description: 'Descrição',
  mediaType: MediaType.IMAGE,
  uploadType: MediaUploadType.UPLOAD,
  platformType: MediaPlatform.ANY,
  isLocalFile: true,
  url: 'https://s3.amazonaws.com/foto.png',
  originalName: 'foto.png',
  size: 1234,
};

const newImage = (name: string): MediaItem => ({
  title: name,
  description: '',
  mediaType: MediaType.IMAGE,
  uploadType: MediaUploadType.UPLOAD,
  platformType: MediaPlatform.ANY,
  isLocalFile: true,
  url: 'blob:http://localhost/abc',
  originalName: name,
  file: new File(['x'], name),
});

const section = (
  overrides: Partial<ImageSectionDraft> = {},
): ImageSectionDraft => ({
  caption: 'Abertura',
  description: 'Fotos da abertura',
  public: true,
  mediaItems: [],
  ...overrides,
});

const readPayload = (formData: FormData): ImagePageRequest =>
  JSON.parse(formData.get(IMAGE_PAGE_PAYLOAD_FIELD) as string) as ImagePageRequest;

describe('image page utils', () => {
  describe('truncate', () => {
    it('corta o texto no limite informado', () => {
      expect(truncate('abcdef', 3)).toBe('abc...');
    });
  });

  describe('buildMediaFieldKey', () => {
    it('nomeia o campo pela seção e pela posição da imagem', () => {
      expect(buildMediaFieldKey(1, 2)).toBe('file_sec1_mid2');
    });
  });

  describe('countMedia', () => {
    it('soma as imagens de todas as seções', () => {
      expect(
        countMedia([
          section({ mediaItems: [storedImage, storedImage] }),
          section({ mediaItems: [storedImage] }),
        ]),
      ).toBe(3);
    });
  });

  describe('toSectionDrafts', () => {
    it('limpa o arquivo local e preserva os ids ao carregar da API', () => {
      const drafts = toSectionDrafts({
        sections: [
          {
            id: 's1',
            caption: 'Abertura',
            description: '',
            public: true,
            mediaItems: [{ id: 'm1', uploadType: MediaUploadType.UPLOAD }],
          },
        ],
      } as never);

      expect(drafts[0].id).toBe('s1');
      expect(drafts[0].mediaItems[0].id).toBe('m1');
      expect(drafts[0].mediaItems[0].file).toBeUndefined();
    });
  });

  describe('buildImagePageFormData', () => {
    it('envia o id apenas na edição', () => {
      expect(readPayload(buildImagePageFormData(values, [])).id).toBeUndefined();
      expect(readPayload(buildImagePageFormData(values, [], 'p1')).id).toBe('p1');
    });

    it('preserva imagem já salva, sem anexar arquivo', () => {
      const formData = buildImagePageFormData(
        values,
        [section({ id: 's1', mediaItems: [storedImage] })],
        'p1',
      );
      const payload = readPayload(formData);

      expect(Array.from(formData.keys())).toEqual([IMAGE_PAGE_PAYLOAD_FIELD]);
      expect(payload.sections[0].id).toBe('s1');
      expect(payload.sections[0].mediaItems[0]).toMatchObject({
        id: 'media-1',
        url: 'https://s3.amazonaws.com/foto.png',
        isLocalFile: true,
      });
      expect(payload.sections[0].mediaItems[0].fieldKey).toBeUndefined();
    });

    it('anexa arquivos novos com a chave da seção e da posição', () => {
      const formData = buildImagePageFormData(values, [
        section({ mediaItems: [newImage('a.png'), newImage('b.png')] }),
        section({ mediaItems: [newImage('c.png')] }),
      ]);
      const payload = readPayload(formData);

      expect(Array.from(formData.keys()).sort()).toEqual([
        'file_sec0_mid0',
        'file_sec0_mid1',
        'file_sec1_mid0',
        IMAGE_PAGE_PAYLOAD_FIELD,
      ]);
      expect(payload.sections[0].mediaItems[0].fieldKey).toBe('file_sec0_mid0');
      // A URL local de pré-visualização não vai para a API.
      expect(payload.sections[0].mediaItems[0].url).toBe('');
    });

    it('mistura imagem salva e nova na mesma seção', () => {
      const formData = buildImagePageFormData(
        values,
        [section({ id: 's1', mediaItems: [storedImage, newImage('nova.png')] })],
        'p1',
      );
      const payload = readPayload(formData);

      expect(Array.from(formData.keys()).sort()).toEqual([
        'file_sec0_mid1',
        IMAGE_PAGE_PAYLOAD_FIELD,
      ]);
      expect(payload.sections[0].mediaItems[0].id).toBe('media-1');
      expect(payload.sections[0].mediaItems[1].id).toBeUndefined();
    });

    it('seção removida simplesmente não vai no payload', () => {
      const payload = readPayload(
        buildImagePageFormData(values, [section({ id: 's2' })], 'p1'),
      );

      expect(payload.sections).toHaveLength(1);
      expect(payload.sections[0].id).toBe('s2');
    });
  });
});

describe('contrato do resumo de /image-pages', () => {
  const summary: ImagePageSummary = {
    id: 'page-1',
    title: 'Retiro 2026',
    description: 'Fotos do retiro',
    public: true,
    routePath: 'galeria_imagens_retiro_2026',
    sectionCount: 3,
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
      'sectionCount',
      'title',
      'updatedAt',
    ]);
  });

  it('aceita galeria sem rota', () => {
    const semRota: ImagePageSummary = { ...summary, routePath: null };

    expect(semRota.routePath).toBeNull();
  });

  it('formata a data e protege contra valor inválido', () => {
    expect(formatDate(summary.createdAt)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDate('data-quebrada')).toBe('—');
    expect(formatDate(null)).toBe('—');
  });

  it('monta as iniciais do avatar', () => {
    expect(pageInitials('Retiro 2026')).toBe('R2');
    expect(pageInitials('Retiro')).toBe('RE');
    expect(pageInitials('   ')).toBe('?');
  });

  it('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('title:ASC')).toEqual({
      sort: 'title',
      order: 'ASC',
    });
    expect(parseSortOption('qualquer')).toEqual({
      sort: 'createdAt',
      order: 'DESC',
    });
  });
});
