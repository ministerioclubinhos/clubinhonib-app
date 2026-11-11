import { expect, test } from '@playwright/test';

import { UserRole } from '@/types/shared';

import {
  EMPTY_VALUE,
  RECORDS_MAX_RANGE_DAYS,
  UNKNOWN_LABEL,
} from '@/features/observability-audit/constants';
import {
  ActorType,
  AuditOutcome,
  ObservabilityLevel,
  SourceType,
} from '@/features/observability-audit/types';
import type { AuditRecordResponse } from '@/features/observability-audit/types';
import { ActorType as ActorTypeEnum, AuditActionType, RecordType } from '@/features/observability-audit/types';
import {
  actionTypeLabel,
  activeFilterCount,
  actorTypeLabel,
  auditDetailFields,
  defaultBaseFilters,
  paginationSummary,
  observabilityDetailFields,
  buildAuditQuery,
  buildObservabilityQuery,
  defaultPeriod,
  describeActor,
  formatDateTime,
  formatDuration,
  formatHttp,
  levelColor,
  levelLabel,
  localDayBoundary,
  validUuid,
  validErrorCode,
  validActionName,
  filterFieldError,
  outcomeColor,
  outcomeLabel,
  queryKeyOf,
  roleLabel,
  sourceTypeLabel,
  toLocalDateInput,
  truncateId,
  truncateText,
  validatePeriod,
  valueOrPlaceholder,
} from '@/features/observability-audit/utils';

const period = { from: '2026-09-04T12:00:00.000Z', to: '2026-09-05T12:00:00.000Z' };
const shared = { requestId: '', limit: 25 };

test.describe('período', () => {
  test('defaultPeriod é esta semana, de domingo a sábado, no fuso local', () => {
    // 05/09/2026 é sábado; 09/09/2026 é quarta; 06/09/2026 é domingo.
    expect(defaultPeriod(new Date(2026, 8, 5, 15, 30))).toEqual({ from: '2026-08-30', to: '2026-09-05' });
    expect(defaultPeriod(new Date(2026, 8, 9, 0, 5))).toEqual({ from: '2026-09-06', to: '2026-09-12' });
    expect(defaultPeriod(new Date(2026, 8, 6, 23, 59))).toEqual({ from: '2026-09-06', to: '2026-09-12' });
  });

  test('toLocalDateInput e localDayBoundary cobrem o dia inteiro sem deslocamento', () => {
    expect(toLocalDateInput(new Date(2026, 8, 5, 23, 59))).toBe('2026-09-05');
    expect(localDayBoundary('2026-09-05', false)).toEqual(new Date(2026, 8, 5));
    expect(localDayBoundary('2026-09-05', true)).toEqual(new Date(2026, 8, 5, 23, 59, 59, 999));
    expect(localDayBoundary('2026-02-31', false)).toBeNull();
    expect(localDayBoundary('05/09/2026', false)).toBeNull();
    expect(localDayBoundary('2026-09-05T10:00', false)).toBeNull();
    expect(localDayBoundary('', true)).toBeNull();
  });

  test('validatePeriod aceita dias inteiros (inclusive o mesmo dia) e rejeita vazio, invertido e longo', () => {
    const ok = validatePeriod('2026-09-04', '2026-09-05');
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.from).toBe(new Date(2026, 8, 4).toISOString());
      expect(ok.to).toBe(new Date(2026, 8, 5, 23, 59, 59, 999).toISOString());
    }
    expect(validatePeriod('2026-09-05', '2026-09-05')).toMatchObject({ ok: true });
    expect(validatePeriod('', '2026-09-05')).toMatchObject({ ok: false, message: 'Informe o dia inicial e o dia final' });
    expect(validatePeriod('2026-09-06', '2026-09-05')).toMatchObject({
      ok: false,
      message: 'O dia inicial não pode ser depois do dia final',
    });
    // 31 dias inteiros cabem; 32 não.
    expect(validatePeriod('2026-08-06', '2026-09-05')).toMatchObject({ ok: true });
    expect(validatePeriod('2026-08-05', '2026-09-05')).toMatchObject({
      ok: false,
      message: `O período não pode passar de ${RECORDS_MAX_RANGE_DAYS} dias`,
    });
  });
});

test.describe('query builders', () => {
  test('observabilidade: from, to, page, limit e só filtros preenchidos', () => {
    expect(buildObservabilityQuery(period, shared, { level: '', errorCode: '  ', sourceType: '' }, 1)).toEqual({
      from: period.from,
      to: period.to,
      page: 1,
      limit: 25,
    });
    expect(
      buildObservabilityQuery(
        period,
        { requestId: ' 7C9E6679-7425-40de-944b-e07fc1f90ae7 ', limit: 50 },
        { level: ObservabilityLevel.Error, errorCode: 'int_9001', sourceType: SourceType.Job },
        3,
      ),
    ).toEqual({
      from: period.from,
      to: period.to,
      page: 3,
      limit: 50,
      requestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      level: ObservabilityLevel.Error,
      errorCode: 'INT_9001',
      sourceType: SourceType.Job,
    });
  });

  test('observabilidade: valor fora do enum não é enviado', () => {
    const query = buildObservabilityQuery(period, shared, { level: 'trace', errorCode: '', sourceType: 'ftp' }, 1);
    expect(query).not.toHaveProperty('level');
    expect(query).not.toHaveProperty('sourceType');
  });

  test('auditoria: filtros allowlisted, sem vazio, com a página pedida', () => {
    expect(buildAuditQuery(period, shared, { actorName: '', actorId: '', actorRole: '', outcome: '', actionName: '', sourceType: '' }, 1)).toEqual({
      from: period.from,
      to: period.to,
      page: 1,
      limit: 25,
    });
    expect(
      buildAuditQuery(
        period,
        { requestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7', limit: 10 },
        { actorName: ' Maria ', actorId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301', actorRole: UserRole.ADMIN, outcome: AuditOutcome.Denied, actionName: ' ClubsModule.ClubsController.create ', sourceType: SourceType.Http },
        2,
      ),
    ).toEqual({
      from: period.from,
      to: period.to,
      page: 2,
      limit: 10,
      requestId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      actorName: 'Maria',
      actorId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      actorRole: UserRole.ADMIN,
      outcome: AuditOutcome.Denied,
      actionName: 'ClubsModule.ClubsController.create',
      sourceType: SourceType.Http,
    });
    expect(buildAuditQuery(period, shared, { actorName: '', actorId: '', actorRole: 'chefe', outcome: 'meh', actionName: '', sourceType: '' }, 1)).toEqual({
      from: period.from,
      to: period.to,
      page: 1,
      limit: 25,
    });
  });

  test('queryKeyOf muda quando qualquer campo muda', () => {
    const a = buildAuditQuery(period, shared, { actorName: '', actorId: '', actorRole: '', outcome: '', actionName: '', sourceType: '' }, 1);
    const b = { ...a, limit: 50 };
    expect(queryKeyOf(a)).not.toBe(queryKeyOf(b));
    expect(queryKeyOf(a)).toBe(queryKeyOf({ ...a }));
  });
});

test.describe('paginação e toolbar', () => {
  test('paginationSummary conta itens da página e trata vazio', () => {
    expect(paginationSummary(1, 25, 240)).toBe('1–25 de 240');
    expect(paginationSummary(10, 25, 240)).toBe('226–240 de 240');
    expect(paginationSummary(1, 25, 0)).toBe('Nenhum item');
    expect(paginationSummary(1, 25, 1500)).toBe('1–25 de 1.500');
  });

  test('activeFilterCount conta só o preenchido e defaultBaseFilters começa limpo', () => {
    expect(activeFilterCount({ requestId: '' }, { level: '', errorCode: '', sourceType: '' })).toBe(0);
    expect(activeFilterCount({ requestId: 'r' }, { level: 'error', errorCode: ' ', sourceType: '' })).toBe(2);
    const base = defaultBaseFilters(new Date(2026, 8, 5, 15, 30));
    expect(base).toEqual({ from: '2026-08-30', to: '2026-09-05', requestId: '', limit: 25 });
  });
});

test.describe('formatadores', () => {
  test('data/hora em pt-BR com data, hora e segundos', () => {
    expect(formatDateTime('2026-09-05T12:34:56.000Z', 'UTC')).toBe('05/09/2026, 12:34:56');
    expect(formatDateTime('2026-09-05T12:34:56.000Z', 'America/Sao_Paulo')).toBe('05/09/2026, 09:34:56');
    expect(formatDateTime(null)).toBe(EMPTY_VALUE);
    expect(formatDateTime('nada')).toBe(EMPTY_VALUE);
  });

  test('duração com unidade explícita', () => {
    expect(formatDuration(12)).toBe('12 ms');
    expect(formatDuration(1250)).toBe('1,3 s');
    expect(formatDuration(150_000)).toBe('2,5 min');
    expect(formatDuration(null)).toBe(EMPTY_VALUE);
    expect(formatDuration(-1)).toBe(EMPTY_VALUE);
  });

  test('placeholder único, ids e textos truncados', () => {
    expect(valueOrPlaceholder(null)).toBe(EMPTY_VALUE);
    expect(valueOrPlaceholder('  ')).toBe(EMPTY_VALUE);
    expect(valueOrPlaceholder(0)).toBe('0');
    expect(truncateId('8f1c9b44-1111-4222-8333-944455556666')).toBe('8f1c9b44…');
    expect(truncateId('curto')).toBe('curto');
    expect(truncateId(null)).toBe(EMPTY_VALUE);
    expect(truncateText('x'.repeat(200), 10)).toBe(`${'x'.repeat(9)}…`);
    expect(truncateText(null)).toBe(EMPTY_VALUE);
  });

  test('HTTP e ator', () => {
    expect(formatHttp('PATCH', 200)).toBe('PATCH 200');
    expect(formatHttp(null, 404)).toBe('404');
    expect(formatHttp(null, null)).toBe(EMPTY_VALUE);
    expect(describeActor(ActorType.User, UserRole.COORDINATOR)).toBe('Usuário · Coordenador');
    expect(describeActor(ActorType.Anonymous, null)).toBe('Anônimo');
    expect(describeActor(ActorType.System, null)).toBe('Sistema');
  });
});

test.describe('rótulos de enums', () => {
  test('cada valor conhecido recebe rótulo', () => {
    for (const level of Object.values(ObservabilityLevel)) expect(levelLabel(level)).not.toContain(UNKNOWN_LABEL);
    for (const source of Object.values(SourceType)) expect(sourceTypeLabel(source)).not.toContain(UNKNOWN_LABEL);
    for (const actor of Object.values(ActorType)) expect(actorTypeLabel(actor)).not.toContain(UNKNOWN_LABEL);
    for (const outcome of Object.values(AuditOutcome)) expect(outcomeLabel(outcome)).not.toContain(UNKNOWN_LABEL);
    for (const role of Object.values(UserRole)) expect(roleLabel(role)).not.toContain(UNKNOWN_LABEL);
    expect(actionTypeLabel('http_request')).toBe('Requisição HTTP');
    expect(levelLabel(ObservabilityLevel.Error)).toBe('Erro');
    expect(outcomeLabel(AuditOutcome.NotFound)).toBe('Não encontrado');
  });

  test('valor futuro recebe fallback seguro e cor neutra, sem quebrar', () => {
    expect(levelLabel('trace')).toBe(`${UNKNOWN_LABEL} (trace)`);
    expect(outcomeLabel('timeout')).toBe(`${UNKNOWN_LABEL} (timeout)`);
    expect(levelLabel(null)).toBe(EMPTY_VALUE);
    expect(levelColor('trace')).toBe('default');
    expect(levelColor(ObservabilityLevel.Error)).toBe('error');
    expect(outcomeColor('timeout')).toBe('default');
    expect(outcomeColor(AuditOutcome.Succeeded)).toBe('success');
  });

  test('formatadores não incluem o objeto bruto nem campos sensíveis', () => {
    const record = {
      actionName: 'x',
      actorType: ActorType.User,
      actorRole: UserRole.ADMIN,
      email: 'nao@deveria.estar',
      token: 'segredo',
    } as unknown as AuditRecordResponse;
    const rendered = [describeActor(record.actorType, record.actorRole), truncateText(record.actionName)].join(' ');
    expect(rendered).not.toContain('nao@deveria.estar');
    expect(rendered).not.toContain('segredo');
  });
});

test.describe('campos do modal de detalhes', () => {
  const common = {
    schemaVersion: '1',
    eventId: 'evt-1',
    environment: 'local',
    service: 'clubinhonib-api',
    occurredAt: '2026-09-05T12:00:00.000Z',
    requestId: 'req-1',
    sourceType: SourceType.Http,
    actorType: ActorTypeEnum.User,
    actorId: 'user-1',
    actorRole: UserRole.ADMIN,
  };

  test('observabilidade: só campos do DTO, rótulos traduzidos, ids copiáveis e placeholder no que falta', () => {
    const fields = observabilityDetailFields({
      ...common,
      recordType: RecordType.Observability,
      level: ObservabilityLevel.Error,
      context: 'ClubsService',
      moduleName: 'ClubsModule',
      operation: null,
      message: 'Falha',
      errorName: 'AppInternalException',
      errorCode: 'INT_9002',
      errorMessage: null,
      errorFingerprint: 'abc',
      sourceFile: 'src/x.ts',
      sourceLine: 42,
      httpMethod: 'POST',
      routeTemplate: '/clubs',
      statusCode: 500,
      durationMs: 12,
      providerName: null,
      jobName: null,
    });
    const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));
    expect(byKey.level.value).toBe('Erro');
    expect(byKey.operation.value).toBe(EMPTY_VALUE);
    expect(byKey['source-location'].value).toBe('src/x.ts:42');
    expect(byKey.http.value).toBe('POST 500');
    expect(byKey.duration.value).toBe('12 ms');
    expect(byKey['request-id']).toMatchObject({ value: 'req-1', copyable: true, monospace: true });
    expect(byKey.actor.value).toBe('Usuário · Administrador');
    expect(fields.map((f) => f.key)).not.toContain('stack');
    expect(fields.map((f) => f.key)).not.toContain('metadata');
    expect(new Set(fields.map((f) => f.key)).size).toBe(fields.length);
  });

  test('auditoria: ação, resultado, recurso e ocorrências', () => {
    const fields = auditDetailFields({
      ...common,
      recordType: RecordType.Audit,
      actionType: AuditActionType.HttpRequest,
      actionName: 'ClubsModule.ClubsController.create',
      moduleName: 'ClubsModule',
      controllerName: 'ClubsController',
      handlerName: 'create',
      resourceType: 'clubs',
      resourceId: 'club-1',
      outcome: AuditOutcome.Denied,
      httpMethod: 'POST',
      routeTemplate: '/clubs',
      statusCode: 403,
      durationMs: 1500,
      errorCode: 'PERM_3004',
      occurrenceCount: 3,
      jobName: null,
    });
    const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));
    expect(byKey.outcome.value).toBe('Negado');
    expect(byKey['action-name']).toMatchObject({ value: 'ClubsModule.ClubsController.create', wide: true });
    expect(byKey['action-type'].value).toBe('Requisição HTTP');
    expect(byKey['resource-id']).toMatchObject({ value: 'club-1', copyable: true });
    expect(byKey.duration.value).toBe('1,5 s');
    expect(byKey.occurrences.value).toBe('3');
    expect(byKey['error-code'].value).toBe('PERM_3004');
    expect(new Set(fields.map((f) => f.key)).size).toBe(fields.length);
  });
});

test.describe('filtros de texto', () => {
  test('valor incompleto ou inválido não vira request e o campo explica', () => {
    const uuid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
    expect(validUuid(` ${uuid.toUpperCase()} `)).toBe(uuid);
    expect(validUuid('7c9e6679-7425')).toBeUndefined();
    expect(validUuid('')).toBeUndefined();
    expect(validErrorCode(' er_data_too_long ')).toBe('ER_DATA_TOO_LONG');
    expect(validErrorCode('int_9001')).toBe('INT_9001');
    expect(validErrorCode('int 9001')).toBeUndefined();
    expect(validActionName(' ClubsController ')).toBe('ClubsController');
    expect(validActionName('<script>')).toBeUndefined();
    expect(filterFieldError('', undefined, 'msg')).toBe('');
    expect(filterFieldError('7c9e', validUuid('7c9e'), 'msg')).toBe('msg');
    expect(filterFieldError(uuid, validUuid(uuid), 'msg')).toBe('');

    const query = buildAuditQuery(
      period,
      { requestId: 'meio-uuid', limit: 25 },
      { actorName: 'M', actorId: '7c9e', actorRole: '', outcome: '', actionName: '<x>', sourceType: '' },
      1,
    );
    expect(query).toEqual({ from: period.from, to: period.to, page: 1, limit: 25 });
  });
});
