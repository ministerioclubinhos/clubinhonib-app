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

/**
 * Regra de perfil × feature flag.
 *
 * São duas condições diferentes, e usar um recurso exige as duas:
 *
 *   pode usar = regra de perfil (código) E flag ligada para o perfil (painel)
 *
 * - A **regra de perfil** é regra de negócio: quem o sistema permite usar o
 *   recurso. Ela mora no código — `ProtectedRoute requiredRole`, os guards de
 *   papel da API, a lista de rotas do coordenador — e não muda pelo painel.
 * - A **feature flag** liga ou desliga o recurso sem deploy e, pelo público
 *   ("Para todos", "Só professor"...), escolhe para quem ele está ligado.
 *
 * O público da flag só **restringe** dentro da regra; nunca concede acesso que
 * a regra de perfil não dá.
 */
export enum FeatureProfileRuleKind {
  /** O recurso funciona sem login. */
  Public = 'public',
  /** Exige login, e só os perfis listados passam. */
  Roles = 'roles',
  /**
   * Interruptor lido pelo sistema (e-mails, processamento automático): não há
   * sessão do outro lado, então o público da flag não é consultado.
   */
  Switch = 'switch',
}

/** A regra de perfil que o código aplica a um recurso. */
export type FeatureProfileRule =
  | { kind: FeatureProfileRuleKind.Public }
  | { kind: FeatureProfileRuleKind.Roles; roles: UserRole[] }
  | { kind: FeatureProfileRuleKind.Switch };

/** Como o público escolhido se encaixa na regra de perfil. */
export enum AudienceRuleStatus {
  /** O público cabe dentro da regra. */
  Ok = 'ok',
  /** Interruptor do sistema: o público não tem efeito. */
  Ignored = 'ignored',
  /** Há perfis (ou visitantes) no público que a regra não aceita. */
  Outside = 'outside',
}

/** Resultado da comparação entre público e regra de perfil. */
export type AudienceRuleCheck =
  | { status: AudienceRuleStatus.Ok }
  | { status: AudienceRuleStatus.Ignored }
  | { status: AudienceRuleStatus.Outside; roles: UserRole[]; visitor: boolean };
