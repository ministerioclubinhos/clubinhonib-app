import type { UserRole } from '@/types/shared';

/** Discriminador lógico dos dois fluxos. Espelha `LogRecordType` da API. */
export enum RecordType {
  Observability = 'observability',
  Audit = 'audit',
}

/** Fronteira de origem do registro. Espelha `LogSourceType` da API. */
export enum SourceType {
  Http = 'http',
  Job = 'job',
  Provider = 'provider',
  Process = 'process',
  Bootstrap = 'bootstrap',
}

/** Quem executou. Espelha `LogActorType` da API. */
export enum ActorType {
  User = 'user',
  Anonymous = 'anonymous',
  System = 'system',
}

/** Nível do registro técnico. Espelha `LogLevel` da API. */
export enum ObservabilityLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Log = 'log',
  Debug = 'debug',
  Verbose = 'verbose',
}

/** Resultado da ação auditada. Espelha `AuditOutcome` da API. */
export enum AuditOutcome {
  Succeeded = 'succeeded',
  Failed = 'failed',
  Denied = 'denied',
  Rejected = 'rejected',
  NotFound = 'not_found',
}

/** Fronteira da ação auditada. Espelha `AuditActionType` da API. */
export enum AuditActionType {
  HttpRequest = 'http_request',
  ScheduledJob = 'scheduled_job',
  SystemOperation = 'system_operation',
}

/** Campos comuns aos dois DTOs (`LogRecordBase` público). */
export interface LogRecordCommonResponse {
  schemaVersion: string;
  eventId: string;
  recordType: RecordType;
  environment: string;
  service: string;
  /** ISO-8601 em UTC. */
  occurredAt: string;
  requestId: string | null;
  sourceType: SourceType;
  actorType: ActorType;
  actorId: string | null;
  actorRole: UserRole | null;
}

/** `ObservabilityRecordResponseDto` da API. */
export interface ObservabilityRecordResponse extends LogRecordCommonResponse {
  recordType: RecordType.Observability;
  level: ObservabilityLevel;
  context: string;
  moduleName: string;
  operation: string | null;
  message: string;
  errorName: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  errorFingerprint: string | null;
  sourceFile: string | null;
  sourceLine: number | null;
  httpMethod: string | null;
  routeTemplate: string | null;
  statusCode: number | null;
  durationMs: number | null;
  providerName: string | null;
  jobName: string | null;
  /** 1 no registro normal; N no resumo de repetições de uma janela. */
  occurrenceCount?: number;
}

/** `AuditRecordResponseDto` da API. */
export interface AuditRecordResponse extends LogRecordCommonResponse {
  recordType: RecordType.Audit;
  /** Nome de exibição de quem agiu; `null` em eventos anônimos, de sistema ou antigos. */
  actorName?: string | null;
  actionType: AuditActionType;
  actionName: string;
  moduleName: string | null;
  controllerName: string | null;
  handlerName: string | null;
  resourceType: string | null;
  resourceId: string | null;
  outcome: AuditOutcome;
  httpMethod: string | null;
  routeTemplate: string | null;
  statusCode: number | null;
  durationMs: number;
  errorCode: string | null;
  occurrenceCount: number;
  jobName: string | null;
}

/** `Paginated<T>` da API: o mesmo envelope das demais listagens. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** `QueryLogRecordsDto`: comum às duas consultas. */
export interface LogRecordsQueryBase {
  from: string;
  to: string;
  page: number;
  limit: number;
  requestId?: string;
}

/** `QueryObservabilityRecordsDto`. */
export interface ObservabilityRecordsQuery extends LogRecordsQueryBase {
  level?: ObservabilityLevel;
  errorCode?: string;
  sourceType?: SourceType;
}

/** `QueryAuditRecordsDto`. */
export interface AuditRecordsQuery extends LogRecordsQueryBase {
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  outcome?: AuditOutcome;
  actionName?: string;
  sourceType?: SourceType;
}

/** Filtros base de uma aba: período, correlação e tamanho de página. */
export interface RecordsBaseFilters {
  /** `YYYY-MM-DDTHH:mm`, no fuso do navegador (valor do `datetime-local`). */
  from: string;
  to: string;
  requestId: string;
  limit: number;
}

/** Filtros próprios do painel técnico (`''` = sem filtro). */
export interface ObservabilityFilters {
  level: string;
  errorCode: string;
  sourceType: string;
}

/** Filtros próprios do painel de auditoria (`''` = sem filtro). */
export interface AuditFilters {
  actorName: string;
  actorId: string;
  actorRole: string;
  outcome: string;
  actionName: string;
  sourceType: string;
}

/** Período já convertido para o servidor, ou o motivo da recusa. */
export type PeriodValidation =
  | { ok: true; from: string; to: string }
  | { ok: false; message: string };

export type ChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning';

/** Opção de um `Select` de filtro. */
export interface FilterOption {
  value: string;
  label: string;
}

/** Blocos do modal de detalhes, na ordem em que aparecem. */
export enum DetailSection {
  What = 'what',
  Who = 'who',
  Request = 'request',
  Technical = 'technical',
}
/** Um par rótulo/valor do modal de detalhes. */
export interface DetailField {
  section: DetailSection;
  /** Chave estável, em kebab-case, usada no `data-testid`. */
  key: string;
  label: string;
  value: string;
  /** Exibir com fonte monoespaçada (ids, códigos, rotas). */
  monospace?: boolean;
  /** Valor copiável na íntegra (ids). */
  copyable?: boolean;
  /** Ocupa a linha inteira (mensagens longas). */
  wide?: boolean;
}

/** A linha selecionada para o modal, com o fluxo a que pertence. */
export type SelectedRecord =
  | { kind: RecordType.Observability; item: ObservabilityRecordResponse }
  | { kind: RecordType.Audit; item: AuditRecordResponse };

/** Resposta das rotas `DELETE` de `/log-records`. */
export interface DeleteLogRecordsResponse {
  deleted: number;
}

/** Linha de um card no celular: rótulo curto e valor já formatado. */
export interface CardLine {
  label: string;
  value: string;
  monospace?: boolean;
}
