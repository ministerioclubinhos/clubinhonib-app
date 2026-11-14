import { useCallback, useEffect, useState } from 'react';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import { apiCreateFeatureFlag, apiDeleteFeatureFlag, apiGetFeatureFlagStats, apiListFeatureFlags, apiSyncFeatureFlagCatalog, apiToggleFeatureFlag, apiUpdateFeatureFlag } from './api';
import { FEATURE_FLAGS_DEFAULT_LIMIT } from './constants';
import type {
  FeatureFlagAudience,
  FeatureFlagFormValues,
  FeatureFlagResponse,
  FeatureFlagSortField,
  FeatureFlagSortOrder,
  FeatureFlagStats,
} from './types';
import { toCreateRequest, toUpdateRequest } from './utils';

/** Filtros que a tela envia à API. */
interface FeatureFlagListFilters {
  /** `''` para todas; `'true'`/`'false'` para o recorte de situação. */
  status: string;
  /** `''` para todos os públicos; senão uma das oito combinações. */
  audience: string;
  sort: FeatureFlagSortField;
  order: FeatureFlagSortOrder;
}

const INITIAL_FILTERS: FeatureFlagListFilters = {
  status: '',
  audience: '',
  sort: 'name',
  order: 'ASC',
};

const EMPTY_STATS: FeatureFlagStats = {
  total: 0,
  enabled: 0,
  disabled: 0,
  byAudience: {
    EVERYONE: 0,
    ADMIN: 0,
    COORDINATOR: 0,
    TEACHER: 0,
    ADMIN_COORDINATOR: 0,
    ADMIN_TEACHER: 0,
    COORDINATOR_TEACHER: 0,
    ALL_ROLES: 0,
  },
};

/** Página de feature flags, com busca e filtros resolvidos pela API. */
export function useFeatureFlagsList() {
  const [items, setItems] = useState<FeatureFlagResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<FeatureFlagStats>(EMPTY_STATS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(FEATURE_FLAGS_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] =
    useState<FeatureFlagListFilters>(INITIAL_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const debouncedSearch = useDebouncedValue(search);
  const nextController = useAbortController();

  // Trocar busca ou filtro recomeça da primeira página: a página 5 do
  // resultado anterior quase nunca existe no novo.
  useEffect(() => setPage(1), [debouncedSearch, filters, pageSize]);

  useEffect(() => {
    const controller = nextController();

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        // O resumo do cabeçalho conta o acervo inteiro, não a página; por isso
        // ele vem de um endpoint próprio, junto da listagem.
        const [data, summary] = await Promise.all([
          apiListFeatureFlags(
            {
              page,
              limit: pageSize,
              searchString: debouncedSearch.trim() || undefined,
              enabled:
                filters.status === '' ? undefined : filters.status === 'true',
              audience:
                (filters.audience || undefined) as
                  | FeatureFlagAudience
                  | undefined,
              sort: filters.sort,
              order: filters.order,
            },
            { signal: controller.signal },
          ),
          apiGetFeatureFlagStats({ signal: controller.signal }),
        ]);

        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
        setStats(summary);
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar as feature flags'));
        setItems([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
  }, [page, pageSize, debouncedSearch, filters, reloadToken, nextController]);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  return {
    items,
    total,
    stats,
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilters,
    loading,
    error,
    setError,
    refresh,
  };
}

/** Criação, edição, chaveamento, exclusão e carga de fábrica. */
export function useFeatureFlagMutations(refresh: () => void) {
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const run = useCallback(
    async (action: () => Promise<string | void>, fallbackMessage: string) => {
      setSaving(true);
      setActionError('');
      try {
        const message = await action();
        if (message) setActionMessage(message);
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, fallbackMessage));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const save = useCallback(
    (values: FeatureFlagFormValues, editingKey?: string) =>
      run(async () => {
        if (editingKey) {
          await apiUpdateFeatureFlag(editingKey, toUpdateRequest(values));
          return 'Feature flag atualizada.';
        }

        await apiCreateFeatureFlag(toCreateRequest(values));
        return 'Feature flag criada.';
      }, 'Erro ao salvar a feature flag'),
    [run],
  );

  const toggle = useCallback(
    (key: string) =>
      run(async () => {
        const flag = await apiToggleFeatureFlag(key);
        return `"${flag.name}" ${flag.enabled ? 'ligada' : 'desligada'}.`;
      }, 'Erro ao alterar a situação da feature flag'),
    [run],
  );

  const remove = useCallback(
    (key: string) =>
      run(async () => {
        await apiDeleteFeatureFlag(key);
        return 'Feature flag removida.';
      }, 'Erro ao excluir a feature flag'),
    [run],
  );

  const syncCatalog = useCallback(
    () =>
      run(async () => {
        const { count, retired } = await apiSyncFeatureFlagCatalog();

        const partes: string[] = [];
        if (count > 0) partes.push(`${count} criada(s)`);
        if (retired.length > 0) partes.push(`${retired.length} aposentada(s)`);

        return partes.length === 0
          ? 'O catálogo já estava em dia.'
          : `Catálogo conferido: ${partes.join(' e ')}.`;
      }, 'Erro ao conferir o catálogo de flags'),
    [run],
  );

  return {
    saving,
    actionError,
    setActionError,
    actionMessage,
    setActionMessage,
    save,
    toggle,
    remove,
    syncCatalog,
  };
}
