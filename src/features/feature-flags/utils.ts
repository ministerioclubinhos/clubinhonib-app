import { UserRole } from '@/types/shared';

import {
  EMAIL_FLAG_PREFIX,
  FEATURE_FLAG_AUDIENCE_OPTIONS,
  FEATURE_PROFILE_RULES,
  PROFILE_ROLE_LABELS,
} from './constants';
import { FEATURE } from './features';
import {
  AudienceRuleStatus,
  FeatureProfileRuleKind,
  type AudienceRuleCheck,
  type FeatureProfileRule,
} from './types';
import type {
  CreateFeatureFlagRequest,
  FeatureFlagAudience,
  FeatureFlagFormErrors,
  FeatureFlagFormValues,
  FeatureFlagResponse,
  FeatureFlagSortField,
  FeatureFlagSortOrder,
  UpdateFeatureFlagRequest,
} from './types';

/**
 * Perfis de cada combinação.
 *
 * Espelha `FEATURE_FLAG_AUDIENCE_ROLES` da API: é o formulário que traduz a
 * escolha do público na lista de perfis que o corpo carrega.
 */
export const AUDIENCE_ROLES: Record<FeatureFlagAudience, UserRole[]> = {
  EVERYONE: [],
  ADMIN: [UserRole.ADMIN],
  COORDINATOR: [UserRole.COORDINATOR],
  TEACHER: [UserRole.TEACHER],
  ADMIN_COORDINATOR: [UserRole.ADMIN, UserRole.COORDINATOR],
  ADMIN_TEACHER: [UserRole.ADMIN, UserRole.TEACHER],
  COORDINATOR_TEACHER: [UserRole.COORDINATOR, UserRole.TEACHER],
  ALL_ROLES: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER],
};

/** Ordem canônica dos perfis, a mesma que a API grava. */
const ROLE_ORDER: UserRole[] = [
  UserRole.ADMIN,
  UserRole.COORDINATOR,
  UserRole.TEACHER,
];

/** Os perfis de uma combinação. */
export function rolesOfAudience(audience: FeatureFlagAudience): UserRole[] {
  return [...AUDIENCE_ROLES[audience]];
}

/**
 * A combinação correspondente aos perfis informados.
 *
 * A API já devolve `audience` pronto; isto cobre o caminho inverso, quando a
 * tela precisa nomear uma lista de perfis que ela mesma montou.
 */
export function audienceOfRoles(roles: UserRole[]): FeatureFlagAudience {
  const signature = ROLE_ORDER.filter((role) => roles.includes(role)).join(',');

  const match = (Object.keys(AUDIENCE_ROLES) as FeatureFlagAudience[]).find(
    (audience) => AUDIENCE_ROLES[audience].join(',') === signature,
  );

  return match ?? 'EVERYONE';
}

/** Rótulo, explicação e cor de uma combinação. */
export function audienceInfo(audience: FeatureFlagAudience) {
  return (
    FEATURE_FLAG_AUDIENCE_OPTIONS.find((option) => option.value === audience) ??
    FEATURE_FLAG_AUDIENCE_OPTIONS[0]
  );
}

/**
 * Formata a data que a API devolve em ISO.
 *
 * Uma data inválida vira travessão em vez de "Invalid Date" no card.
 */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

/** Duas letras da chave, para o avatar do card. */
export function flagInitials(key: string): string {
  const parts = key.trim().split(/[_\-\s]+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** True quando o texto é um objeto JSON válido, ou está vazio. */
export function isValidMetadataJson(json: string): boolean {
  const trimmed = json.trim();
  if (!trimmed) return true;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    return (
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    );
  } catch {
    return false;
  }
}

/** O metadata do corpo; `undefined` quando o campo está vazio. */
export function parseMetadataJson(
  json: string,
): Record<string, unknown> | undefined {
  const trimmed = json.trim();
  if (!trimmed) return undefined;

  return JSON.parse(trimmed) as Record<string, unknown>;
}

/** Estado inicial do formulário, para criação ou a partir da flag. */
export function toFormValues(
  flag: FeatureFlagResponse | null,
): FeatureFlagFormValues {
  return {
    key: flag?.key ?? '',
    name: flag?.name ?? '',
    description: flag?.description ?? '',
    // Uma flag nova nasce desligada: quem cria decide quando ela entra no ar.
    enabled: flag?.enabled ?? false,
    audience: flag?.audience ?? 'EVERYONE',
    metadataJson: flag?.metadata ? JSON.stringify(flag.metadata, null, 2) : '',
  };
}

/** Quais campos do formulário estão pendentes ou inválidos. */
export function validateForm(
  values: FeatureFlagFormValues,
): FeatureFlagFormErrors {
  return {
    // A chave é o que o código consulta, e o hífen fica de fora: com as duas
    // formas circulando, a mesma flag acabava escrita de dois jeitos.
    key: !/^[a-z0-9][a-z0-9_]*$/.test(values.key.trim()),
    name: !values.name.trim(),
    metadataJson: !isValidMetadataJson(values.metadataJson),
  };
}

/** True quando algum campo está pendente ou inválido. */
export function hasErrors(errors: FeatureFlagFormErrors): boolean {
  return errors.key || errors.name || errors.metadataJson;
}

/** Corpo de criação a partir do formulário. */
export function toCreateRequest(
  values: FeatureFlagFormValues,
): CreateFeatureFlagRequest {
  return {
    key: values.key.trim().toLowerCase(),
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    enabled: values.enabled,
    targetRoles: rolesOfAudience(values.audience),
    metadata: parseMetadataJson(values.metadataJson),
  };
}

/**
 * Corpo de edição a partir do formulário.
 *
 * A chave vai junto: ela é editável, e a API cuida de recusar uma que já
 * exista.
 */
export function toUpdateRequest(
  values: FeatureFlagFormValues,
): UpdateFeatureFlagRequest {
  return {
    key: values.key.trim().toLowerCase(),
    name: values.name.trim(),
    description: values.description.trim(),
    enabled: values.enabled,
    targetRoles: rolesOfAudience(values.audience),
    metadata: parseMetadataJson(values.metadataJson),
  };
}

/**
 * True quando a chave é uma das que a aplicação procura.
 *
 * Renomear uma delas desliga o recurso na tela até o código apontar para a
 * chave nova — vale avisar antes.
 */
export function isKeyUsedByApp(key: string): boolean {
  return (Object.values(FEATURE) as string[]).includes(key.trim());
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: FeatureFlagSortField;
  order: FeatureFlagSortOrder;
} {
  const [sort, order] = value.split(':');
  const field: FeatureFlagSortField =
    sort === 'key' || sort === 'createdAt' || sort === 'updatedAt'
      ? sort
      : 'name';

  return { sort: field, order: order === 'DESC' ? 'DESC' : 'ASC' };
}

/** A regra de perfil da flag, ou `null` quando o código não define uma. */
export function profileRuleOf(key: string): FeatureProfileRule | null {
  const trimmed = key.trim();
  if (trimmed.startsWith(EMAIL_FLAG_PREFIX)) {
    return { kind: FeatureProfileRuleKind.Switch };
  }
  return FEATURE_PROFILE_RULES[trimmed] ?? null;
}

/** Lista legível de perfis: "admin, coordenador e professor". */
export function formatRoles(roles: UserRole[]): string {
  const labels = ROLE_ORDER.filter((role) => roles.includes(role)).map(
    (role) => PROFILE_ROLE_LABELS[role],
  );
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
}

/** Texto curto da regra de perfil, para o card e o formulário. */
export function profileRuleLabel(rule: FeatureProfileRule | null): string {
  if (!rule) return 'Sem regra de perfil no código';
  if (rule.kind === FeatureProfileRuleKind.Public) {
    return 'Regra de perfil: aberto, sem login';
  }
  if (rule.kind === FeatureProfileRuleKind.Switch) {
    return 'Interruptor do sistema (sem perfil)';
  }
  if (rule.roles.length === ROLE_ORDER.length) {
    return 'Regra de perfil: qualquer perfil logado';
  }
  return `Regra de perfil: só ${formatRoles(rule.roles)}`;
}

/**
 * Compara o público escolhido com a regra de perfil do recurso.
 *
 * O público só restringe: um perfil que ele inclui e a regra não aceita
 * continua sem acesso. "Para todos" alcança também o visitante, que fica de
 * fora sempre que a regra exige login.
 */
export function checkAudienceAgainstRule(
  key: string,
  audience: FeatureFlagAudience,
): AudienceRuleCheck {
  const rule = profileRuleOf(key);
  if (!rule || rule.kind === FeatureProfileRuleKind.Public) {
    return { status: AudienceRuleStatus.Ok };
  }
  if (rule.kind === FeatureProfileRuleKind.Switch) {
    return { status: AudienceRuleStatus.Ignored };
  }

  const audienceRoles = AUDIENCE_ROLES[audience];
  const visitor = audienceRoles.length === 0;
  const reached = visitor ? ROLE_ORDER : audienceRoles;
  const roles = reached.filter((role) => !rule.roles.includes(role));

  return roles.length === 0 && !visitor
    ? { status: AudienceRuleStatus.Ok }
    : { status: AudienceRuleStatus.Outside, roles, visitor };
}

/** Aviso para o formulário, ou `null` quando não há o que avisar. */
export function audienceRuleWarning(
  key: string,
  audience: FeatureFlagAudience,
): string | null {
  const check = checkAudienceAgainstRule(key, audience);

  if (check.status === AudienceRuleStatus.Ignored) {
    return 'Esta flag é lida pelo sistema, sem sessão: o público escolhido não tem efeito. Só "Ligada/Desligada" conta.';
  }
  if (check.status !== AudienceRuleStatus.Outside) return null;

  const parts: string[] = [];
  if (check.visitor) parts.push('visitantes sem login');
  if (check.roles.length > 0) parts.push(formatRoles(check.roles));
  const plural = check.visitor || check.roles.length > 1;

  return `A flag não amplia acesso: ${parts.join(' e ')} continua${plural ? 'm' : ''} sem acesso, porque a regra de perfil do código não permite. O público só restringe dentro dessa regra.`;
}
