import { UserRole } from '@/types/shared';

import {
  ActorType,
  AuditActionType,
  AuditOutcome,
  ObservabilityLevel,
  SourceType,
} from './types';
import type { ChipColor, FilterOption } from './types';

/** Endpoints administrativos, somente `GET`. */
export const OBSERVABILITY_RECORDS_ENDPOINT = '/log-records/observability';
export const AUDIT_RECORDS_ENDPOINT = '/log-records/audit';

/** Código da API quando o storage é `file`: só grava, não lista nem apaga. */
export const LOG_QUERY_UNAVAILABLE_CODE = 'LOG_9101';

/** Rota exclusiva do administrador; não entra no menu nem no painel. */
export const OBSERVABILITY_AUDIT_ROUTE = '/adm/observabilidade-auditoria';

export const RECORDS_DEFAULT_LIMIT = 25;
export const RECORDS_LIMIT_OPTIONS = [10, 25, 50, 100] as const;

/** Limite do servidor (FE-BE-005): acima disso a API responde 422. */
export const RECORDS_MAX_RANGE_DAYS = 31;
/** Período inicial: as últimas 24 horas. */
export const RECORDS_INITIAL_LOOKBACK_HOURS = 24;

/** Placeholder único para valor ausente. */
export const EMPTY_VALUE = '—';

/** Quantos caracteres de um ID longo ficam visíveis. */
export const ID_VISIBLE_LENGTH = 8;
/** Limite visual de textos longos (mensagem, ação). */
export const TEXT_MAX_LENGTH = 160;

/** Largura mínima de cada tabela (só de `sm` para cima; no celular são cards). */
export const OBSERVABILITY_TABLE_MIN_WIDTH = 1040;
export const AUDIT_TABLE_MIN_WIDTH = 1120;

export const UNKNOWN_LABEL = 'Desconhecido';

export const LEVEL_LABELS: Readonly<Record<ObservabilityLevel, string>> = {
  [ObservabilityLevel.Fatal]: 'Fatal',
  [ObservabilityLevel.Error]: 'Erro',
  [ObservabilityLevel.Warn]: 'Aviso',
  [ObservabilityLevel.Log]: 'Info',
  [ObservabilityLevel.Debug]: 'Debug',
  [ObservabilityLevel.Verbose]: 'Detalhe',
};

export const LEVEL_COLORS: Readonly<Record<ObservabilityLevel, ChipColor>> = {
  [ObservabilityLevel.Fatal]: 'error',
  [ObservabilityLevel.Error]: 'error',
  [ObservabilityLevel.Warn]: 'warning',
  [ObservabilityLevel.Log]: 'info',
  [ObservabilityLevel.Debug]: 'default',
  [ObservabilityLevel.Verbose]: 'default',
};

export const SOURCE_TYPE_LABELS: Readonly<Record<SourceType, string>> = {
  [SourceType.Http]: 'HTTP',
  [SourceType.Job]: 'Job agendado',
  [SourceType.Provider]: 'Integração',
  [SourceType.Process]: 'Processo',
  [SourceType.Bootstrap]: 'Inicialização',
};

export const ACTOR_TYPE_LABELS: Readonly<Record<ActorType, string>> = {
  [ActorType.User]: 'Usuário',
  [ActorType.Anonymous]: 'Anônimo',
  [ActorType.System]: 'Sistema',
};

export const OUTCOME_LABELS: Readonly<Record<AuditOutcome, string>> = {
  [AuditOutcome.Succeeded]: 'Sucesso',
  [AuditOutcome.Failed]: 'Falha',
  [AuditOutcome.Denied]: 'Negado',
  [AuditOutcome.Rejected]: 'Rejeitado',
  [AuditOutcome.NotFound]: 'Não encontrado',
};

export const OUTCOME_COLORS: Readonly<Record<AuditOutcome, ChipColor>> = {
  [AuditOutcome.Succeeded]: 'success',
  [AuditOutcome.Failed]: 'error',
  [AuditOutcome.Denied]: 'warning',
  [AuditOutcome.Rejected]: 'warning',
  [AuditOutcome.NotFound]: 'default',
};

export const ACTION_TYPE_LABELS: Readonly<Record<AuditActionType, string>> = {
  [AuditActionType.HttpRequest]: 'Requisição HTTP',
  [AuditActionType.ScheduledJob]: 'Job agendado',
  [AuditActionType.SystemOperation]: 'Operação de sistema',
};

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.COORDINATOR]: 'Coordenador',
  [UserRole.TEACHER]: 'Professor',
};

const ANY_OPTION: FilterOption = { value: '', label: 'Todos' };

export const LEVEL_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  ANY_OPTION,
  ...Object.values(ObservabilityLevel).map((value) => ({ value, label: LEVEL_LABELS[value] })),
];

export const SOURCE_TYPE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  ANY_OPTION,
  ...Object.values(SourceType).map((value) => ({ value, label: SOURCE_TYPE_LABELS[value] })),
];

export const OUTCOME_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  ANY_OPTION,
  ...Object.values(AuditOutcome).map((value) => ({ value, label: OUTCOME_LABELS[value] })),
];

export const ROLE_FILTER_OPTIONS: ReadonlyArray<FilterOption> = [
  ANY_OPTION,
  ...Object.values(UserRole).map((value) => ({ value, label: ROLE_LABELS[value] })),
];

/** Mensagens da tela. */
export const OBSERVABILITY_AUDIT_MESSAGES = {
  pageTitle: 'Observabilidade e auditoria',
  pageDescription:
    'Registros técnicos da API e ações auditadas por usuário. Consulta somente leitura, exclusiva para administradores.',
  observabilityTitle: 'Observabilidade',
  observabilityDescription: 'Erros capturados pela API: exceções, falhas de integração, jobs e processo.',
  auditTitle: 'Auditoria',
  auditDescription: 'Cada ação executada na API, com quem a fez, o recurso e o resultado.',
  empty: 'Nenhum registro encontrado no período selecionado',
  observabilityError: 'Não foi possível carregar os registros técnicos',
  auditError: 'Não foi possível carregar os eventos de auditoria',
  retry: 'Tentar novamente',
  refreshAll: 'Atualizar tudo',
  previous: 'Página anterior',
  next: 'Próxima página',
  clearFilters: 'Limpar filtros',
  moreFilters: 'Mais filtros',
  lessFilters: 'Menos filtros',
  refresh: 'Atualizar',
  itemsPerPage: 'Itens por página',
  noItems: 'Nenhum item',
  deleteRecord: 'Excluir registro',
  deleteRange: 'Excluir período',
  deleteRecordTitle: 'este registro',
  deleteRangeTitle: (from: string, to: string) => `todos os registros desta aba entre ${from} e ${to}`,
  deleted: (count: number) => (count === 1 ? '1 registro excluído.' : `${count.toLocaleString('pt-BR')} registros excluídos.`),
  deleteFailed: 'Não foi possível excluir',
  unavailableTitle: 'Consulta indisponível neste ambiente',
  unavailableBody:
    'A API está gravando em arquivos JSONL (storage "file"), que servem só para análise. Para listar e excluir por aqui, configure OBS_STORAGE/AUDIT_STORAGE=dynamodb.',
  copied: 'Identificador copiado.',
  detailsTitleObservability: 'Detalhes do registro técnico',
  detailsTitleAudit: 'Detalhes do evento de auditoria',
  detailsOpenHint: 'Ver detalhes',
  close: 'Fechar',
  copyFailed: 'Não foi possível copiar o identificador.',
  invalidPeriod: 'Informe início e fim do período',
  periodOrder: 'O início do período precisa ser anterior ao fim',
  periodTooLong: `O período não pode passar de ${RECORDS_MAX_RANGE_DAYS} dias`,
  timezoneNote: 'Datas exibidas no fuso do navegador',
} as const;

/** `data-testid` combinados com a suíte Playwright. */
export const OBSERVABILITY_AUDIT_TEST_IDS = {
  page: 'observability-audit-page',
  observabilityPanel: 'observability-records-panel',
  observabilityToolbar: 'observability-records-toolbar',
  observabilityFilters: 'observability-records-filters',
  observabilityRefresh: 'observability-records-refresh',
  observabilityPeriodError: 'observability-records-period-error',
  observabilityDeleteRange: 'observability-records-delete-range',
  observabilityUnavailable: 'observability-records-unavailable',
  observabilityTable: 'observability-records-table',
  observabilityLoading: 'observability-records-loading',
  observabilityEmpty: 'observability-records-empty',
  observabilityError: 'observability-records-error',
  observabilityPagination: 'observability-records-pagination',
  observabilityRow: 'observability-record-row',
  auditPanel: 'audit-records-panel',
  auditToolbar: 'audit-records-toolbar',
  auditFilters: 'audit-records-filters',
  auditRefresh: 'audit-records-refresh',
  auditPeriodError: 'audit-records-period-error',
  auditDeleteRange: 'audit-records-delete-range',
  auditUnavailable: 'audit-records-unavailable',
  auditTable: 'audit-records-table',
  auditLoading: 'audit-records-loading',
  auditEmpty: 'audit-records-empty',
  auditError: 'audit-records-error',
  auditPagination: 'audit-records-pagination',
  auditRow: 'audit-record-row',
  footerLink: 'footer-observability-audit-link',
  tabs: 'observability-audit-tabs',
  tabObservability: 'observability-audit-tab-observability',
  tabAudit: 'observability-audit-tab-audit',
  detailsDialog: 'record-details-dialog',
  detailsClose: 'record-details-close',
  detailsField: 'record-details-field',
  detailsDelete: 'record-details-delete',
} as const;

/** Qual aba está aberta. */
export enum RecordsTab {
  Observability = 'observability',
  Audit = 'audit',
}
