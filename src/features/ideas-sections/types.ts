import type { IdeasPageSummary } from "@/features/ideas-pages/types";
import type { MediaItem } from "@/store/slices/types";

/**
 * Contratos de ideias compartilhadas.
 *
 * Espelham `src/modules/pages/ideas-section/dto` da API, campo a campo.
 */

/** Uma mídia da ideia (`IdeasSectionMediaResponseDto`). */
export interface IdeasSectionMedia {
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

/** Ideia compartilhada (`IdeasSectionResponseDto`). */
export interface IdeasSectionResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  /** Página onde foi publicada; `null` enquanto aguarda decisão. */
  pageId: string | null;
  medias: IdeasSectionMedia[];
  createdAt: string;
  updatedAt: string;
}

/** Página devolvida por `GET /ideas-sections`. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo de ordenação aceito pela API. */
export type IdeasSectionSortField = "createdAt" | "title";
export type IdeasSectionSortOrder = "ASC" | "DESC";

/** Filtros da fila. */
export interface IdeasSectionFilters {
  searchString?: string;
}

/** Query string de `GET /ideas-sections` (`QueryIdeasSectionsDto`). */
export interface IdeasSectionsQueryParams {
  page: number;
  limit: number;
  searchString?: string;
  sort: IdeasSectionSortField;
  order: IdeasSectionSortOrder;
}

/**
 * Corpo do JSON que viaja no multipart, em `sectionData`.
 *
 * Os arquivos vão em campos separados, cada um endereçado pelo `fieldKey` da
 * mídia correspondente.
 */
export interface IdeasSectionPayload {
  title: string;
  description: string;
  public: boolean;
  medias: IdeasSectionMediaInput[];
}

/** Plataformas aceitas pela API em uma mídia de link (`PlatformType`). */
export type IdeasSectionPlatform =
  | "youtube"
  | "googledrive"
  | "onedrive"
  | "dropbox"
  | "ANY";

/** Uma mídia na entrada (`IdeasSectionMediaItemDto`). */
export interface IdeasSectionMediaInput {
  /** Presente só quando a mídia já existe e está sendo editada. */
  id?: string;
  title?: string;
  description?: string;
  uploadType: "upload" | "link";
  mediaType: "image" | "video" | "document";
  isLocalFile: boolean;
  url?: string;
  platformType?: IdeasSectionPlatform;
  originalName?: string;
  /** Nome do campo do multipart que carrega o arquivo desta mídia. */
  fieldKey?: string;
  size?: number;
}

/** Arquivo a enviar, com o campo que o liga à sua mídia. */
export interface IdeasSectionUpload {
  fieldKey: string;
  file: File;
}

/**
 * Página de ideias onde a administração pode publicar.
 *
 * O seletor usa o resumo da listagem: ele traz o título sem carregar as seções
 * e as mídias de cada página.
 */
export type IdeasPage = IdeasPageSummary;

/** Resposta das rotas que só confirmam a operação. */
export interface ApiMessage {
  message: string;
}

/**
 * A ideia em revisão: os campos editáveis mais as mídias.
 *
 * As mídias usam `MediaItem`, o formato dos editores compartilhados: um
 * arquivo escolhido no navegador viaja em `file` e ainda não tem `url`.
 */
export interface IdeasSectionDraft {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  medias: MediaItem[];
}

/** O que sobe numa publicação: o JSON e os arquivos que ele endereça. */
export interface IdeasSectionSubmission {
  payload: IdeasSectionPayload;
  uploads: IdeasSectionUpload[];
}
