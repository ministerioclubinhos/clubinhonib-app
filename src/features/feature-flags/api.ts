import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';

import { FEATURE_FLAGS_ENDPOINT } from './constants';
import type {
  CreateFeatureFlagRequest,
  FeatureFlagQuery,
  FeatureFlagResponse,
  FeatureFlagStats,
  PaginatedFeatureFlags,
  UpdateFeatureFlagRequest,
} from './types';

/** A chave viaja na URL; escapar evita surpresa com chaves antigas. */
const flagPath = (key: string): string =>
  `${FEATURE_FLAGS_ENDPOINT}/${encodeURIComponent(key)}`;

/**
 * Lista as flags do painel.
 *
 * Busca, situação, público e ordenação são resolvidos pela API: antes a
 * listagem inteira era baixada e peneirada no navegador.
 */
export async function apiListFeatureFlags(
  query: FeatureFlagQuery,
  config?: AxiosRequestConfig,
): Promise<PaginatedFeatureFlags> {
  const { data } = await api.get<PaginatedFeatureFlags>(
    FEATURE_FLAGS_ENDPOINT,
    { ...config, params: query },
  );
  return data;
}

/**
 * As flags que valem para a sessão de quem pediu.
 *
 * O perfil sai do token no servidor: uma flag restrita a outro perfil chega
 * como `false`, e o visitante só recebe as sem restrição.
 */
export async function apiGetFeatureFlagsMap(
  config?: AxiosRequestConfig,
): Promise<Record<string, boolean>> {
  const { data } = await api.get<Record<string, boolean>>(
    `${FEATURE_FLAGS_ENDPOINT}/map`,
    config,
  );
  return data;
}

/** Resumo do acervo, exibido no cabeçalho do painel. */
export async function apiGetFeatureFlagStats(
  config?: AxiosRequestConfig,
): Promise<FeatureFlagStats> {
  const { data } = await api.get<FeatureFlagStats>(
    `${FEATURE_FLAGS_ENDPOINT}/stats`,
    config,
  );
  return data;
}

/** Carrega uma flag pela chave. */
export async function apiGetFeatureFlag(
  key: string,
): Promise<FeatureFlagResponse> {
  const { data } = await api.get<FeatureFlagResponse>(flagPath(key));
  return data;
}

/** Cria uma flag. */
export async function apiCreateFeatureFlag(
  payload: CreateFeatureFlagRequest,
): Promise<FeatureFlagResponse> {
  const { data } = await api.post<FeatureFlagResponse>(
    FEATURE_FLAGS_ENDPOINT,
    payload,
  );
  return data;
}

/** Atualiza uma flag; a chave também pode ser renomeada. */
export async function apiUpdateFeatureFlag(
  key: string,
  payload: UpdateFeatureFlagRequest,
): Promise<FeatureFlagResponse> {
  const { data } = await api.patch<FeatureFlagResponse>(flagPath(key), payload);
  return data;
}

/** Liga ou desliga a flag, sem mexer no resto. */
export async function apiToggleFeatureFlag(
  key: string,
): Promise<FeatureFlagResponse> {
  const { data } = await api.patch<FeatureFlagResponse>(
    `${flagPath(key)}/toggle`,
  );
  return data;
}

/** Exclui a flag. */
export async function apiDeleteFeatureFlag(key: string): Promise<void> {
  await api.delete(flagPath(key));
}

/**
 * Acerta o catálogo: cria as flags de fábrica que faltam e apaga as
 * aposentadas.
 */
export async function apiSyncFeatureFlagCatalog(): Promise<{
  message: string;
  count: number;
  created: FeatureFlagResponse[];
  retired: string[];
}> {
  const { data } = await api.post<{
    message: string;
    count: number;
    created: FeatureFlagResponse[];
    retired: string[];
  }>(`${FEATURE_FLAGS_ENDPOINT}/seed`);
  return data;
}
