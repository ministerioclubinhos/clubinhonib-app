import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';

import { AUDIT_RECORDS_ENDPOINT, OBSERVABILITY_RECORDS_ENDPOINT } from './constants';
import type {
  AuditRecordResponse,
  AuditRecordsQuery,
  DeleteLogRecordsResponse,
  PaginatedResponse,
  ObservabilityRecordResponse,
  ObservabilityRecordsQuery,
} from './types';

/**
 * Registros técnicos. O painel mostra a falha e oferece retry, por isso o
 * toast global fica desligado; `401` continua no fluxo do interceptor.
 */
export async function apiListObservabilityRecords(
  query: ObservabilityRecordsQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<ObservabilityRecordResponse>> {
  const { data } = await api.get<PaginatedResponse<ObservabilityRecordResponse>>(
    OBSERVABILITY_RECORDS_ENDPOINT,
    { ...config, params: query, skipGlobalError: true },
  );
  return data;
}

/** Eventos de auditoria, paginados por página. */
export async function apiListAuditRecords(
  query: AuditRecordsQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<AuditRecordResponse>> {
  const { data } = await api.get<PaginatedResponse<AuditRecordResponse>>(
    AUDIT_RECORDS_ENDPOINT,
    { ...config, params: query, skipGlobalError: true },
  );
  return data;
}

const itemPath = (endpoint: string, eventId: string): string => `${endpoint}/${encodeURIComponent(eventId)}`;

/** Apaga um registro técnico; `occurredAt` faz parte da chave física na API. */
export async function apiDeleteObservabilityRecord(
  eventId: string,
  occurredAt: string,
): Promise<DeleteLogRecordsResponse> {
  const { data } = await api.delete<DeleteLogRecordsResponse>(itemPath(OBSERVABILITY_RECORDS_ENDPOINT, eventId), {
    params: { occurredAt },
    skipGlobalError: true,
  });
  return data;
}

/** Apaga um evento de auditoria. */
export async function apiDeleteAuditRecord(eventId: string, occurredAt: string): Promise<DeleteLogRecordsResponse> {
  const { data } = await api.delete<DeleteLogRecordsResponse>(itemPath(AUDIT_RECORDS_ENDPOINT, eventId), {
    params: { occurredAt },
    skipGlobalError: true,
  });
  return data;
}

/** Apaga todos os registros técnicos do intervalo (ISO-8601 UTC). */
export async function apiDeleteObservabilityRange(from: string, to: string): Promise<DeleteLogRecordsResponse> {
  const { data } = await api.delete<DeleteLogRecordsResponse>(OBSERVABILITY_RECORDS_ENDPOINT, {
    params: { from, to },
    skipGlobalError: true,
  });
  return data;
}

/** Apaga todos os eventos de auditoria do intervalo (ISO-8601 UTC). */
export async function apiDeleteAuditRange(from: string, to: string): Promise<DeleteLogRecordsResponse> {
  const { data } = await api.delete<DeleteLogRecordsResponse>(AUDIT_RECORDS_ENDPOINT, {
    params: { from, to },
    skipGlobalError: true,
  });
  return data;
}
