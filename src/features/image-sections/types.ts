/**
 * Contratos de fotos do clubinho.
 *
 * Espelham `src/modules/pages/image-section/dto` da API, campo a campo.
 */

/** Uma foto da publicação (`ImageSectionMediaResponseDto`). */
export interface ImageSectionMedia {
  id: string;
  title: string | null;
  description: string | null;
  uploadType: string;
  mediaType: string;
  isLocalFile: boolean;
  url: string;
  platformType: string | null;
  originalName: string | null;
  size: number | null;
}

/** Publicação de fotos (`ImageSectionResponseDto`). */
export interface ImageSectionResponse {
  id: string;
  caption: string;
  description: string;
  /** Visível no feed do clubinho. */
  public: boolean;
  /** Página do feed onde entrou; `null` enquanto aguarda aprovação. */
  pageId: string | null;
  mediaItems: ImageSectionMedia[];
  createdAt: string;
  updatedAt: string;
}

/** Página devolvida por `GET /image-sections`. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo de ordenação aceito pela API. */
export type ImageSectionSortField = "createdAt" | "caption";
export type ImageSectionSortOrder = "ASC" | "DESC";

/** Filtros da fila de revisão. */
export interface ImageSectionFilters {
  searchString?: string;
  /** `false` traz a fila; `true`, as já publicadas. */
  approved?: boolean;
  /** Só as que têm foto, ou só as que ficaram sem. */
  hasMedia?: boolean;
}

/** Query string de `GET /image-sections` (`QueryImageSectionsDto`). */
export interface ImageSectionsQueryParams {
  page: number;
  limit: number;
  searchString?: string;
  approved?: boolean;
  hasMedia?: boolean;
  sort: ImageSectionSortField;
  order: ImageSectionSortOrder;
}

/** Plataformas aceitas em uma mídia de link (`PlatformType`). */
export type ImageSectionPlatform =
  | "youtube"
  | "googledrive"
  | "onedrive"
  | "dropbox"
  | "ANY";

/** Uma mídia na entrada (`MediaItemDto`). */
export interface ImageSectionMediaInput {
  /** Presente só quando a mídia já existe e está sendo editada. */
  id?: string;
  title?: string;
  description?: string;
  uploadType: "upload" | "link";
  mediaType: "image" | "video" | "document";
  isLocalFile: boolean;
  url?: string;
  platformType?: ImageSectionPlatform;
  originalName?: string;
  /** Nome do campo do multipart que carrega o arquivo desta mídia. */
  fieldKey?: string;
  size?: number;
}

/** Corpo do JSON que viaja no multipart, em `sectionData`. */
export interface ImageSectionPayload {
  caption: string;
  description: string;
  /** Só na edição; a criação não aceita este campo. */
  public?: boolean;
  mediaItems: ImageSectionMediaInput[];
}

/** Arquivo a enviar, com o campo que o liga à sua mídia. */
export interface ImageSectionUpload {
  fieldKey: string;
  file: File;
}

/** Resposta das rotas que só confirmam a operação. */
export interface ApiMessage {
  message: string;
}
