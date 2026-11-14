/** Contrato de resposta de `/informatives`. */
export interface InformativeResponse {
  id: string;
  title: string;
  description: string;
  /** Visível para quem não está autenticado. */
  public: boolean;
  /** Endereço público do informativo; `null` quando não tem rota. */
  routePath: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedInformatives {
  data: InformativeResponse[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type InformativeSortField = 'createdAt' | 'title';

/** Direção da ordenação. */
export type InformativeSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface InformativeQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  public?: boolean;
  sort?: InformativeSortField;
  order?: InformativeSortOrder;
}

/**
 * Corpo de criação e de edição.
 *
 * O id vai só na URL: repeti-lo no corpo fazia o `PATCH` responder 400.
 */
export interface InformativeRequest {
  title: string;
  description: string;
  public: boolean;
}

/** Campos editados no formulário. */
export interface InformativeFormValues {
  title: string;
  description: string;
  public: boolean;
}

/** Quais campos obrigatórios do formulário estão pendentes. */
export interface InformativeFormErrors {
  title: boolean;
  description: boolean;
}
