import { UserRole } from '@/types/shared';

import {
  FeatureProfileRuleKind,
  type FeatureFlagAudience,
  type FeatureProfileRule,
} from './types';

/** Caminho base dos endpoints de feature flags. */
export const FEATURE_FLAGS_ENDPOINT = '/feature-flags';

/** Rota do painel administrativo. */
export const FEATURE_FLAGS_ROUTE = '/adm/feature-flags';

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const FEATURE_FLAGS_DEFAULT_LIMIT = 12;
export const FEATURE_FLAGS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/**
 * As oito combinações de público, na ordem em que aparecem.
 *
 * `EVERYONE` alcança quem nem fez login; `ALL_ROLES` exige uma sessão de
 * qualquer um dos três perfis.
 */
export const FEATURE_FLAG_AUDIENCE_OPTIONS: ReadonlyArray<{
  value: FeatureFlagAudience;
  label: string;
  description: string;
  color: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning';
}> = [
  {
    value: 'EVERYONE',
    label: 'Para todos',
    description: 'Vale para qualquer visitante, mesmo sem login.',
    color: 'default',
  },
  {
    value: 'ALL_ROLES',
    label: 'Todos os perfis',
    description: 'Admin, coordenador e professor — exige estar logado.',
    color: 'info',
  },
  {
    value: 'ADMIN',
    label: 'Só admin',
    description: 'Apenas administradores.',
    color: 'primary',
  },
  {
    value: 'COORDINATOR',
    label: 'Só coordenador',
    description: 'Apenas coordenadores.',
    color: 'warning',
  },
  {
    value: 'TEACHER',
    label: 'Só professor',
    description: 'Apenas professores.',
    color: 'success',
  },
  {
    value: 'ADMIN_COORDINATOR',
    label: 'Admin e coordenador',
    description: 'Administradores e coordenadores.',
    color: 'secondary',
  },
  {
    value: 'ADMIN_TEACHER',
    label: 'Admin e professor',
    description: 'Administradores e professores.',
    color: 'secondary',
  },
  {
    value: 'COORDINATOR_TEACHER',
    label: 'Coordenador e professor',
    description: 'Coordenadores e professores.',
    color: 'secondary',
  },
];

/** Opções do filtro de público: todas, mais as oito combinações. */
export const FEATURE_FLAG_AUDIENCE_FILTER_OPTIONS = [
  { value: '', label: 'Todos os públicos' },
  ...FEATURE_FLAG_AUDIENCE_OPTIONS.map(({ value, label }) => ({
    value,
    label,
  })),
];

/** Opções do filtro de situação, na ordem em que aparecem. */
export const FEATURE_FLAG_STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Ligadas' },
  { value: 'false', label: 'Desligadas' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const FEATURE_FLAG_SORT_OPTIONS = [
  { value: 'name:ASC', label: 'Nome (A–Z)' },
  { value: 'name:DESC', label: 'Nome (Z–A)' },
  { value: 'key:ASC', label: 'Chave (A–Z)' },
  { value: 'key:DESC', label: 'Chave (Z–A)' },
  { value: 'updatedAt:DESC', label: 'Alteradas recentemente' },
  { value: 'createdAt:DESC', label: 'Mais recentes' },
  { value: 'createdAt:ASC', label: 'Mais antigas' },
] as const;

const PROFILE_ALL_ROLES = [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER];
const PROFILE_ADMIN_COORDINATOR = [UserRole.ADMIN, UserRole.COORDINATOR];

/**
 * A regra de perfil (regra de negócio) de cada flag que a aplicação consulta.
 *
 * Espelha o que o código exige hoje — as rotas de `App.tsx` e os guards de
 * papel da API — e serve para o painel mostrar a regra ao lado do público da
 * flag. Uma chave fora deste mapa não tem regra de perfil própria no código: o
 * público da flag é o único recorte que ela recebe.
 *
 * Mudar a regra de perfil é mudar o código (rota e guard), nunca o painel.
 */
export const FEATURE_PROFILE_RULES: Readonly<Record<string, FeatureProfileRule>> = {
  // Rotas abertas, fora de `ProtectedRoute`.
  contact_form: { kind: FeatureProfileRuleKind.Public },
  events_section: { kind: FeatureProfileRuleKind.Public },
  clubinho_feed: { kind: FeatureProfileRuleKind.Public },
  password_recovery: { kind: FeatureProfileRuleKind.Public },
  public_registration: { kind: FeatureProfileRuleKind.Public },
  google_login: { kind: FeatureProfileRuleKind.Public },
  special_family_day: { kind: FeatureProfileRuleKind.Public },
  home_comments: { kind: FeatureProfileRuleKind.Public },
  public_galleries: { kind: FeatureProfileRuleKind.Public },
  public_videos: { kind: FeatureProfileRuleKind.Public },

  // `ProtectedRoute` sem perfil exigido: qualquer sessão.
  children_area: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ALL_ROLES },
  club_photo_upload: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ALL_ROLES },
  weekly_materials: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ALL_ROLES },
  site_feedback: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ALL_ROLES },
  idea_submission: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ALL_ROLES },

  // Painel `/adm`: administrador e coordenador.
  pagelas: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ADMIN_COORDINATOR },
  photo_moderation: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ADMIN_COORDINATOR },
  idea_moderation: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ADMIN_COORDINATOR },
  comment_moderation: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ADMIN_COORDINATOR },
  club_weekly_summary: { kind: FeatureProfileRuleKind.Roles, roles: PROFILE_ADMIN_COORDINATOR },

  // Bloco exclusivo do administrador.
  statistics: { kind: FeatureProfileRuleKind.Roles, roles: [UserRole.ADMIN] },
  club_control: { kind: FeatureProfileRuleKind.Roles, roles: [UserRole.ADMIN] },

  // Lido só pela API, sem sessão.
  idea_ai_enhancement: { kind: FeatureProfileRuleKind.Switch },
};

/** Prefixo das flags de e-mail: disparos do sistema, sem sessão. */
export const EMAIL_FLAG_PREFIX = 'email_';

/** Nome de cada perfil nas mensagens do painel. */
export const PROFILE_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  [UserRole.ADMIN]: 'admin',
  [UserRole.COORDINATOR]: 'coordenador',
  [UserRole.TEACHER]: 'professor',
};
