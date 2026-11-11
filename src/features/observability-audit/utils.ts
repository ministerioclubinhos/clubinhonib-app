import { UserRole } from '@/types/shared';

import {
  ACTION_TYPE_LABELS,
  ACTOR_TYPE_LABELS,
  EMPTY_VALUE,
  ID_VISIBLE_LENGTH,
  LEVEL_COLORS,
  LEVEL_LABELS,
  OBSERVABILITY_AUDIT_MESSAGES,
  OUTCOME_COLORS,
  OUTCOME_LABELS,
  RECORDS_DEFAULT_LIMIT,
  WEEK_LAST_DAY_OFFSET,
  ACTION_NAME_PATTERN,
  ACTOR_NAME_MAX_LENGTH,
  ACTOR_NAME_MIN_LENGTH,
  ERROR_CODE_PATTERN,
  UUID_PATTERN,
  RECORDS_MAX_RANGE_DAYS,
  ROLE_LABELS,
  SOURCE_TYPE_LABELS,
  TEXT_MAX_LENGTH,
  UNKNOWN_LABEL,
} from './constants';
import { ActorType, AuditOutcome, DetailSection, ObservabilityLevel, SourceType } from './types';
import type {
  AuditFilters,
  AuditRecordResponse,
  AuditRecordsQuery,
  ChipColor,
  DetailField,
  ObservabilityRecordResponse,
  ObservabilityFilters,
  ObservabilityRecordsQuery,
  PeriodValidation,
  RecordsBaseFilters,
} from './types';

const DAY_MS = 86_400_000;
const pad = (value: number): string => String(value).padStart(2, '0');

/** `Date` -> `YYYY-MM-DD` no fuso local, o formato do `<input type="date">`. */
export function toLocalDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Período inicial: esta semana, de domingo a sábado, em dias inteiros. */
export function defaultPeriod(now: Date = new Date()): Pick<RecordsBaseFilters, 'from' | 'to'> {
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + WEEK_LAST_DAY_OFFSET);
  return { from: toLocalDateInput(sunday), to: toLocalDateInput(saturday) };
}

/**
 * `YYYY-MM-DD` -> o primeiro ou o último instante desse dia no fuso do
 * navegador. O filtro é por dia inteiro: a pessoa não escolhe horário.
 */
export function localDayBoundary(value: string, end: boolean): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = end ? new Date(year, month - 1, day, 23, 59, 59, 999) : new Date(year, month - 1, day);
  // `new Date(2026, 1, 31)` vira março: dia que não existe é inválido.
  return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

/** Valida o período antes de qualquer request (FE-BE-005). */
export function validatePeriod(
  from: string,
  to: string,
  maxDays: number = RECORDS_MAX_RANGE_DAYS,
): PeriodValidation {
  const start = localDayBoundary(from, false);
  const end = localDayBoundary(to, true);
  if (!start || !end) {
    return { ok: false, message: OBSERVABILITY_AUDIT_MESSAGES.invalidPeriod };
  }
  // O mesmo dia nos dois campos é válido: cobre o dia inteiro.
  if (start.getTime() > end.getTime()) return { ok: false, message: OBSERVABILITY_AUDIT_MESSAGES.periodOrder };
  if (end.getTime() - start.getTime() > maxDays * DAY_MS) {
    return { ok: false, message: OBSERVABILITY_AUDIT_MESSAGES.periodTooLong };
  }
  return { ok: true, from: start.toISOString(), to: end.toISOString() };
}

const trimmedOrUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * Valor de filtro pronto para a API, ou `undefined` enquanto está vazio ou
 * incompleto: digitar meio UUID não pode virar um 400 a cada tecla.
 */
export function validUuid(value: string): string | undefined {
  const trimmed = trimmedOrUndefined(value);
  return trimmed && UUID_PATTERN.test(trimmed) ? trimmed.toLowerCase() : undefined;
}
export function validErrorCode(value: string): string | undefined {
  const upper = trimmedOrUndefined(value)?.toUpperCase();
  return upper && ERROR_CODE_PATTERN.test(upper) ? upper : undefined;
}
/** Trecho do nome com o tamanho que a API aceita. */
export function validActorName(value: string): string | undefined {
  const trimmed = trimmedOrUndefined(value);
  return trimmed && trimmed.length >= ACTOR_NAME_MIN_LENGTH && trimmed.length <= ACTOR_NAME_MAX_LENGTH
    ? trimmed
    : undefined;
}
export function validActionName(value: string): string | undefined {
  const trimmed = trimmedOrUndefined(value);
  return trimmed && ACTION_NAME_PATTERN.test(trimmed) ? trimmed : undefined;
}
/** Mensagem para o campo preenchido com valor que a API recusaria. */
export function filterFieldError(value: string, valid: string | undefined, message: string): string {
  return value.trim() !== '' && valid === undefined ? message : '';
}

const isEnumValue = <T extends string>(values: readonly T[], value: string): value is T =>
  (values as readonly string[]).includes(value);

/** Só o que a API aceita, sem filtro vazio. */
export function buildObservabilityQuery(
  period: { from: string; to: string },
  base: Pick<RecordsBaseFilters, 'requestId' | 'limit'>,
  filters: ObservabilityFilters,
  page: number,
): ObservabilityRecordsQuery {
  const query: ObservabilityRecordsQuery = { from: period.from, to: period.to, page, limit: base.limit };
  const requestId = validUuid(base.requestId);
  const errorCode = validErrorCode(filters.errorCode);
  if (requestId) query.requestId = requestId;
  if (isEnumValue(Object.values(ObservabilityLevel), filters.level)) query.level = filters.level;
  if (errorCode) query.errorCode = errorCode;
  if (isEnumValue(Object.values(SourceType), filters.sourceType)) query.sourceType = filters.sourceType;
  return query;
}

export function buildAuditQuery(
  period: { from: string; to: string },
  base: Pick<RecordsBaseFilters, 'requestId' | 'limit'>,
  filters: AuditFilters,
  page: number,
): AuditRecordsQuery {
  const query: AuditRecordsQuery = { from: period.from, to: period.to, page, limit: base.limit };
  const requestId = validUuid(base.requestId);
  const actorId = validUuid(filters.actorId);
  const actionName = validActionName(filters.actionName);
  const actorName = validActorName(filters.actorName);
  if (requestId) query.requestId = requestId;
  if (actorName) query.actorName = actorName;
  if (actorId) query.actorId = actorId;
  if (isEnumValue(Object.values(UserRole), filters.actorRole)) query.actorRole = filters.actorRole;
  if (isEnumValue(Object.values(AuditOutcome), filters.outcome)) query.outcome = filters.outcome;
  if (actionName) query.actionName = actionName;
  if (isEnumValue(Object.values(SourceType), filters.sourceType)) query.sourceType = filters.sourceType;
  return query;
}

/** Instante UTC da API -> `dd/mm/aaaa HH:MM:ss` no fuso do navegador. */
export function formatDateTime(iso: string | null | undefined, timeZone?: string): string {
  if (!iso) return EMPTY_VALUE;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/** Nome do fuso em uso, para a nota da tela. */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** `12 ms`, `1,2 s`, `2,5 min`; unidade sempre explícita. */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0) return EMPTY_VALUE;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} s`;
  return `${(ms / 60_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`;
}

export function valueOrPlaceholder(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  const text = String(value).trim();
  return text ? text : EMPTY_VALUE;
}

/** `8f1c9b44…` para a célula; o valor inteiro vai no nome acessível. */
export function truncateId(id: string | null | undefined, visible: number = ID_VISIBLE_LENGTH): string {
  if (!id) return EMPTY_VALUE;
  return id.length > visible ? `${id.slice(0, visible)}…` : id;
}

export function truncateText(text: string | null | undefined, max: number = TEXT_MAX_LENGTH): string {
  if (!text) return EMPTY_VALUE;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

const labelOf = <T extends string>(labels: Readonly<Record<T, string>>, value: string | null | undefined): string => {
  if (!value) return EMPTY_VALUE;
  const known = (labels as Readonly<Record<string, string>>)[value];
  return known ?? `${UNKNOWN_LABEL} (${value})`;
};

/** Rótulos em português com fallback seguro para valor futuro. */
export const levelLabel = (value: string | null | undefined): string => labelOf(LEVEL_LABELS, value);
export const sourceTypeLabel = (value: string | null | undefined): string => labelOf(SOURCE_TYPE_LABELS, value);
export const actorTypeLabel = (value: string | null | undefined): string => labelOf(ACTOR_TYPE_LABELS, value);
export const outcomeLabel = (value: string | null | undefined): string => labelOf(OUTCOME_LABELS, value);
export const actionTypeLabel = (value: string | null | undefined): string => labelOf(ACTION_TYPE_LABELS, value);
export const roleLabel = (value: string | null | undefined): string => labelOf(ROLE_LABELS, value);

export function levelColor(value: string | null | undefined): ChipColor {
  return value && isEnumValue(Object.values(ObservabilityLevel), value) ? LEVEL_COLORS[value] : 'default';
}

export function outcomeColor(value: string | null | undefined): ChipColor {
  return value && isEnumValue(Object.values(AuditOutcome), value) ? OUTCOME_COLORS[value] : 'default';
}

/** `PATCH 200` ou só o método/status que existir. */
export function formatHttp(method: string | null, statusCode: number | null): string {
  const parts = [method, statusCode === null ? null : String(statusCode)].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length ? parts.join(' ') : EMPTY_VALUE;
}

/** Descrição curta do ator: tipo e papel; o id vai em coluna própria. */
export function describeActor(actorType: string | null, actorRole: string | null): string {
  const type = actorTypeLabel(actorType);
  if (actorType !== (ActorType.User as string)) return type;
  const role = actorRole ? roleLabel(actorRole) : null;
  return [type, role].filter(Boolean).join(' · ');
}

/** Chave estável de uma consulta, para saber quando a paginação reinicia. */
export function queryKeyOf(query: object): string {
  return JSON.stringify(query);
}

/** `1–25 de 240`; `Nenhum item` quando não há nada. */
export function paginationSummary(page: number, limit: number, total: number): string {
  if (total <= 0) return OBSERVABILITY_AUDIT_MESSAGES.noItems;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start.toLocaleString('pt-BR')}–${end.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')}`;
}

/** Quantos filtros opcionais estão preenchidos (para o badge da toolbar). */
export function activeFilterCount(base: Pick<RecordsBaseFilters, 'requestId'>, specific: ObservabilityFilters | AuditFilters): number {
  return [base.requestId, ...Object.values(specific)].filter((value) => value.trim() !== '').length;
}

/** Filtros base iniciais de uma aba. */
export function defaultBaseFilters(now: Date = new Date()): RecordsBaseFilters {
  return { ...defaultPeriod(now), requestId: '', limit: RECORDS_DEFAULT_LIMIT };
}

const field = (
  section: DetailSection,
  key: string,
  label: string,
  value: string | number | null | undefined,
  options: Pick<DetailField, 'monospace' | 'copyable' | 'wide'> = {},
): DetailField => ({ section, key, label, value: valueOrPlaceholder(value), ...options });

const { What, Who, Request, Technical } = DetailSection;

/** Campos comuns aos dois modais. */
function commonDetailFields(record: ObservabilityRecordResponse | AuditRecordResponse): DetailField[] {
  return [
    field(Who, 'actor', 'Ator', describeActor(record.actorType, record.actorRole)),
    field(Who, 'actor-id', 'ID do ator', record.actorId, { monospace: true, copyable: true }),
    field(Request, 'request-id', 'ID da requisição', record.requestId, { monospace: true, copyable: true }),
    field(Request, 'source-type', 'Origem', sourceTypeLabel(record.sourceType)),
    field(Technical, 'occurred-at', 'Data/hora', formatDateTime(record.occurredAt)),
    field(Technical, 'event-id', 'ID do evento', record.eventId, { monospace: true, copyable: true }),
    field(Technical, 'environment', 'Ambiente', record.environment),
    field(Technical, 'service', 'Serviço', record.service),
    field(Technical, 'schema-version', 'Versão do contrato', record.schemaVersion),
  ];
}

/**
 * Detalhes do registro técnico: só o que o DTO público traz. Stack e metadata
 * não existem neste contrato e, por isso, não aparecem.
 */
export function observabilityDetailFields(record: ObservabilityRecordResponse): DetailField[] {
  return [
    field(What, 'level', 'Nível', levelLabel(record.level)),
    field(What, 'message', 'Mensagem', record.message, { wide: true }),
    field(What, 'error-code', 'Código do erro', record.errorCode, { monospace: true }),
    field(What, 'error-name', 'Classe do erro', record.errorName, { monospace: true }),
    field(What, 'error-message', 'Mensagem do erro', record.errorMessage, { wide: true }),
    field(What, 'occurrences', 'Repetições na janela', (record.occurrenceCount ?? 1) > 1 ? record.occurrenceCount : null),
    field(What, 'context', 'Contexto', record.context),
    field(What, 'module', 'Módulo', record.moduleName),
    field(What, 'operation', 'Operação', record.operation),
    field(What, 'provider', 'Integração', record.providerName),
    field(What, 'job', 'Job', record.jobName),
    field(
      What,
      'source-location',
      'Origem no código',
      record.sourceFile ? `${record.sourceFile}${record.sourceLine === null ? '' : `:${record.sourceLine}`}` : null,
      { monospace: true, wide: true },
    ),
    field(Request, 'http', 'HTTP', formatHttp(record.httpMethod, record.statusCode)),
    field(Request, 'route', 'Rota', record.routeTemplate, { monospace: true }),
    field(Request, 'duration', 'Duração', formatDuration(record.durationMs)),
    field(Technical, 'fingerprint', 'Fingerprint', record.errorFingerprint, { monospace: true }),
    ...commonDetailFields(record),
  ];
}

/** Detalhes do evento de auditoria. O nome de quem agiu só aparece aqui. */
export function auditDetailFields(record: AuditRecordResponse): DetailField[] {
  return [
    field(What, 'outcome', 'Resultado', outcomeLabel(record.outcome)),
    field(What, 'action-name', 'Ação', record.actionName, { monospace: true, wide: true }),
    field(What, 'action-type', 'Tipo de ação', actionTypeLabel(record.actionType)),
    field(What, 'module', 'Módulo', record.moduleName),
    field(What, 'controller', 'Controller', record.controllerName),
    field(What, 'handler', 'Handler', record.handlerName),
    field(What, 'resource-type', 'Tipo do recurso', record.resourceType),
    field(What, 'resource-id', 'ID do recurso', record.resourceId, { monospace: true, copyable: true }),
    field(What, 'error-code', 'Código do erro', record.errorCode, { monospace: true }),
    field(What, 'occurrences', 'Ocorrências na janela', record.occurrenceCount > 1 ? record.occurrenceCount : null),
    field(What, 'job', 'Job', record.jobName),
    field(Who, 'actor-name', 'Nome do usuário', record.actorName, { wide: true }),
    field(Request, 'http', 'HTTP', formatHttp(record.httpMethod, record.statusCode)),
    field(Request, 'route', 'Rota', record.routeTemplate, { monospace: true }),
    field(Request, 'duration', 'Duração', formatDuration(record.durationMs)),
    ...commonDetailFields(record),
  ];
}

/** Campos preenchidos de um bloco; valor ausente não ocupa espaço no modal. */
export function detailFieldsOf(fields: DetailField[], section: DetailSection): DetailField[] {
  return fields.filter((item) => item.section === section && item.value !== EMPTY_VALUE);
}
