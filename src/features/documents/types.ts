import type {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

export { MediaPlatform, MediaUploadType, MediaType } from '@/store/slices/types';
export type { MediaItem } from '@/store/slices/types';

/**
 * Mídia do documento exatamente como a API devolve.
 *
 * Os campos que podem faltar chegam como `null`, e não ausentes: é assim que o
 * `DocumentMediaResponseDto` do back os declara.
 */
export interface DocumentMediaResponse {
  id: string;
  title: string | null;
  description: string | null;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  platformType: MediaPlatform | null;
  url: string;
  isLocalFile: boolean;
  originalName: string | null;
  size: number | null;
}

/** Contrato de resposta de `/documents`. */
export interface DocumentResponse {
  id: string;
  name: string;
  /** `null` quando o documento não tem descrição. */
  description: string | null;
  /** `null` quando o documento ainda não tem arquivo nem link. */
  media: DocumentMediaResponse | null;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedDocuments {
  data: DocumentResponse[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type DocumentSortField = 'createdAt' | 'name';

/** Direção da ordenação. */
export type DocumentSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface DocumentQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  /** `true` só com anexo, `false` só sem anexo, ausente para todos. */
  hasMedia?: boolean;
  sort?: DocumentSortField;
  order?: DocumentSortOrder;
}

/** Campos do documento editados no formulário. */
export interface DocumentFormValues {
  name: string;
  description: string;
  uploadType: MediaUploadType;
  url: string;
  platformType: MediaPlatform;
  file: File | null;
  /**
   * Mídia já gravada, quando o documento veio da API. É ela que permite manter
   * o arquivo no S3 numa edição que não troca o arquivo.
   */
  storedMedia: DocumentMediaResponse | null;
}

/** Mídia enviada no corpo da requisição. */
export interface DocumentMediaRequest {
  /** Presente apenas quando a mídia já veio da API. */
  id?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  isLocalFile: boolean;
  url: string;
  platformType?: MediaPlatform;
  originalName?: string;
  size?: number;
  /** Nome do campo multipart que carrega o arquivo. */
  fileField?: string;
}

/** JSON enviado no campo multipart `documentData`. */
export interface DocumentRequest {
  /** Presente apenas na edição. */
  id?: string;
  name: string;
  description: string;
  media: DocumentMediaRequest;
}

/** Quais campos obrigatórios do formulário estão pendentes. */
export interface DocumentFormErrors {
  name: boolean;
  description: boolean;
  media: boolean;
}
