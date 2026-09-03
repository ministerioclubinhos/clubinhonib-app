import { describe, expect, it } from 'vitest';

import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import type { DocumentFormValues, DocumentResponse } from './types';
import {
  buildDocumentFormData,
  documentInitials,
  formatFileSize,
  parseSortOption,
  toFormValues,
  toMediaItem,
  toMediaRequest,
  validateForm,
} from './utils';

const buildResponse = (
  overrides: Partial<DocumentResponse> = {},
): DocumentResponse => ({
  id: 'doc-1',
  name: 'Manual do professor',
  description: 'Guia completo',
  media: {
    id: 'media-1',
    title: 'Manual do professor',
    description: 'Guia completo',
    mediaType: MediaType.DOCUMENT,
    uploadType: MediaUploadType.UPLOAD,
    platformType: null,
    url: 'https://s3/manual.pdf',
    isLocalFile: true,
    originalName: 'manual.pdf',
    size: 2048,
  },
  createdAt: '2026-01-10T12:00:00.000Z',
  updatedAt: '2026-01-11T12:00:00.000Z',
  ...overrides,
});

const linkValues = (): DocumentFormValues => ({
  name: 'Regulamento',
  description: 'Normas do clubinho',
  uploadType: MediaUploadType.LINK,
  url: 'https://exemplo.com/regulamento.pdf',
  platformType: MediaPlatform.GOOGLE_DRIVE,
  file: null,
  storedMedia: null,
});

describe('contrato de /documents', () => {
  it('lê exatamente os campos que a API devolve', () => {
    const values = toFormValues(buildResponse());

    expect(values.name).toBe('Manual do professor');
    expect(values.description).toBe('Guia completo');
    expect(values.uploadType).toBe(MediaUploadType.UPLOAD);
    // Num upload a url guardada não volta para o campo de link.
    expect(values.url).toBe('');
    expect(values.storedMedia?.id).toBe('media-1');
  });

  it('aceita descrição nula sem quebrar o formulário', () => {
    const values = toFormValues(buildResponse({ description: null }));

    expect(values.description).toBe('');
  });

  it('trata documento sem mídia', () => {
    const values = toFormValues(buildResponse({ media: null }));

    expect(values.storedMedia).toBeNull();
    expect(values.uploadType).toBe(MediaUploadType.LINK);
  });

  it('envia a mídia no formato que o back valida', () => {
    const media = toMediaRequest(linkValues());

    expect(Object.keys(media).sort()).toEqual([
      'description',
      'isLocalFile',
      'mediaType',
      'platformType',
      'title',
      'uploadType',
      'url',
    ]);
    expect(media.isLocalFile).toBe(false);
  });

  it('mantém o id da mídia guardada, para preservar o arquivo no S3', () => {
    const stored = buildResponse().media;
    const file = new File(['x'], 'novo.pdf');

    const media = toMediaRequest({
      ...linkValues(),
      uploadType: MediaUploadType.UPLOAD,
      file,
      storedMedia: stored,
    });

    expect(media.id).toBe('media-1');
    expect(media.fileField).toBe('file');
    expect(media.originalName).toBe('novo.pdf');
    // O servidor reaproveita o objeto guardado pelo id; a url volta vazia.
    expect(media.url).toBe('');
  });

  it('monta o corpo multipart com o arquivo e o payload', () => {
    const file = new File(['x'], 'novo.pdf');

    const formData = buildDocumentFormData(
      {
        ...linkValues(),
        uploadType: MediaUploadType.UPLOAD,
        file,
        storedMedia: null,
      },
      'doc-1',
    );

    expect(formData.get('file')).toBe(file);
    const payload = JSON.parse(String(formData.get('documentData'))) as {
      id: string;
      name: string;
    };
    expect(payload.id).toBe('doc-1');
    expect(payload.name).toBe('Regulamento');
  });

  it('não envia id no corpo quando está criando', () => {
    const formData = buildDocumentFormData(linkValues());
    const payload = JSON.parse(String(formData.get('documentData'))) as Record<
      string,
      unknown
    >;

    expect(payload).not.toHaveProperty('id');
    expect(formData.get('file')).toBeNull();
  });
});

describe('validação do formulário', () => {
  it('exige nome, descrição e mídia', () => {
    const errors = validateForm({
      ...linkValues(),
      name: '  ',
      description: '',
      url: '',
    });

    expect(errors).toEqual({ name: true, description: true, media: true });
  });

  it('aceita upload sem arquivo novo quando já existe arquivo guardado', () => {
    const errors = validateForm({
      ...linkValues(),
      uploadType: MediaUploadType.UPLOAD,
      url: '',
      file: null,
      storedMedia: buildResponse().media,
    });

    expect(errors.media).toBe(false);
  });
});

describe('apresentação', () => {
  it('formata o tamanho do arquivo', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(undefined)).toBe('—');
  });

  it('monta as iniciais do avatar', () => {
    expect(documentInitials('Manual do professor')).toBe('MD');
    expect(documentInitials('Regulamento')).toBe('RE');
    expect(documentInitials('   ')).toBe('?');
  });

  it('divide a opção de ordenação em campo e direção', () => {
    expect(parseSortOption('name:ASC')).toEqual({ sort: 'name', order: 'ASC' });
    expect(parseSortOption('lixo')).toEqual({
      sort: 'createdAt',
      order: 'DESC',
    });
  });
});

describe('tradução para os componentes de mídia', () => {
  it('troca os nulos do contrato por campos ausentes', () => {
    const media = toMediaItem({
      id: 'media-1',
      title: null,
      description: null,
      mediaType: MediaType.DOCUMENT,
      uploadType: MediaUploadType.LINK,
      platformType: null,
      url: 'https://exemplo.com/a.pdf',
      isLocalFile: false,
      originalName: null,
      size: null,
    });

    // `MediaItem` usa campos opcionais; passar `null` adiante quebraria os
    // componentes compartilhados de pré-visualização.
    expect(media).toEqual({
      id: 'media-1',
      title: '',
      description: '',
      mediaType: MediaType.DOCUMENT,
      uploadType: MediaUploadType.LINK,
      platformType: undefined,
      url: 'https://exemplo.com/a.pdf',
      isLocalFile: false,
      originalName: undefined,
      size: undefined,
    });
  });

  it('devolve nulo quando o documento não tem mídia', () => {
    expect(toMediaItem(null)).toBeNull();
  });
});
