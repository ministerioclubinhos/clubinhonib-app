import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useAbortController, useDebouncedValue } from '@/hooks';
import type { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import {
  apiCreateInformative,
  apiDeleteInformative,
  apiListInformatives,
  apiUpdateInformative,
} from './api';
import { INFORMATIVES_DEFAULT_LIMIT } from './constants';
import type {
  InformativeFormValues,
  InformativeResponse,
  InformativeSortField,
  InformativeSortOrder,
} from './types';
import { toRequest } from './utils';

/** Filtros que a tela envia à API. */
interface InformativeListFilters {
  /** `''` para todos; `'true'`/`'false'` para o recorte de visibilidade. */
  visibility: string;
  sort: InformativeSortField;
  order: InformativeSortOrder;
}

const INITIAL_FILTERS: InformativeListFilters = {
  visibility: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Página de informativos, com busca e filtros resolvidos pela API. */
export function useInformatives() {
  const [items, setItems] = useState<InformativeResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(INFORMATIVES_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] =
    useState<InformativeListFilters>(INITIAL_FILTERS);
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
        const data = await apiListInformatives(
          {
            page,
            limit: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            public:
              filters.visibility === ''
                ? undefined
                : filters.visibility === 'true',
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar os informativos'));
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

/** Criação, edição e exclusão. Cada ação devolve se deu certo. */
export function useInformativeMutations(refresh: () => void) {
  const dispatch = useDispatch<AppDispatch>();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      setSaving(true);
      setActionError('');
      try {
        await action();
        // Cada informativo tem uma rota pública; o menu do site vem dessas
        // rotas e ficaria desatualizado sem esta recarga.
        await dispatch(fetchRoutes());
        refresh();
        return true;
      } catch (err: unknown) {
        setActionError(extractErrorMessage(err, fallbackMessage));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, refresh],
  );

  const save = useCallback(
    (values: InformativeFormValues, informativeId?: string) =>
      run(async () => {
        const payload = toRequest(values);
        if (informativeId) {
          await apiUpdateInformative(informativeId, payload);
        } else {
          await apiCreateInformative(payload);
        }
      }, 'Erro ao salvar o informativo'),
    [run],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteInformative(id);
      }, 'Erro ao excluir o informativo'),
    [run],
  );

  return { saving, actionError, setActionError, save, remove };
}
