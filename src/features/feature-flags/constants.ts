import type { FeatureFlagAudience } from './types';

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
