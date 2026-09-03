import type { UserRole } from '@/types/shared';

/**
 * Contratos das feature flags.
 *
 * Espelham `src/core/feature-flags/dto` da API, campo a campo.
 */

/**
 * As combinações de público de uma flag.
 *
 * `EVERYONE` e `ALL_ROLES` não são a mesma coisa: sem nenhum perfil alvo a
 * flag vale até para quem não fez login, enquanto os três perfis juntos
 * exigem uma sessão.
 */
export type FeatureFlagAudience =
  | 'EVERYONE'
  | 'ADMIN'
  | 'COORDINATOR'
  | 'TEACHER'
  | 'ADMIN_COORDINATOR'
  | 'ADMIN_TEACHER'
  | 'COORDINATOR_TEACHER'
  | 'ALL_ROLES';

/** Contrato de resposta de `/feature-flags`. */
export interface FeatureFlagResponse {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  /** Perfis que enxergam a flag; vazio significa todos, inclusive visitantes. */
  targetRoles: UserRole[];
  /** O nome da combinação de `targetRoles`, resolvido pela API. */
  audience: FeatureFlagAudience;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedFeatureFlags {
  data: FeatureFlagResponse[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Resumo do acervo (`GET /feature-flags/stats`). */
export interface FeatureFlagStats {
  total: number;
  enabled: number;
  disabled: number;
  byAudience: Record<FeatureFlagAudience, number>;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type FeatureFlagSortField = 'name' | 'key' | 'createdAt' | 'updatedAt';

/** Direção da ordenação. */
export type FeatureFlagSortOrder = 'ASC' | 'DESC';

/** Filtros aplicados pela API, não pela tela. */
export interface FeatureFlagQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  enabled?: boolean;
  audience?: FeatureFlagAudience;
  sort?: FeatureFlagSortField;
  order?: FeatureFlagSortOrder;
}

/** Corpo de criação (`CreateFeatureFlagDto`). */
export interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  targetRoles?: UserRole[];
  metadata?: Record<string, unknown>;
}

/** Corpo de edição; a chave também pode mudar. */
export interface UpdateFeatureFlagRequest {
  key?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  targetRoles?: UserRole[];
  metadata?: Record<string, unknown>;
}

/** Campos editados no formulário. */
export interface FeatureFlagFormValues {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  /** O público é escolhido pela combinação, não perfil a perfil. */
  audience: FeatureFlagAudience;
  /** JSON livre; vazio significa sem metadata. */
  metadataJson: string;
}

/** Quais campos do formulário estão pendentes ou inválidos. */
export interface FeatureFlagFormErrors {
  key: boolean;
  name: boolean;
  metadataJson: boolean;
}
