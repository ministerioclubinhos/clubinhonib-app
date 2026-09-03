import { useCallback, useEffect, useState } from 'react';

import { useAbortController, useDebouncedValue } from '@/hooks';
import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import {
  apiCreateDocument,
  apiDeleteDocument,
  apiListDocuments,
  apiUpdateDocument,
} from './api';
import { DOCUMENTS_DEFAULT_LIMIT } from './constants';
import type {
  DocumentFormValues,
  DocumentResponse,
  DocumentSortField,
  DocumentSortOrder,
} from './types';
import { buildDocumentFormData } from './utils';

/** Filtros que a tela envia à API. */
interface DocumentListFilters {
  /** `''` para todos; `'true'`/`'false'` para o recorte de anexo. */
  hasMedia: string;
  sort: DocumentSortField;
  order: DocumentSortOrder;
}

const INITIAL_FILTERS: DocumentListFilters = {
  hasMedia: '',
  sort: 'createdAt',
  order: 'DESC',
};

/** Página de documentos, com busca e filtros resolvidos pela API. */
export function useDocuments() {
  const [items, setItems] = useState<DocumentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DOCUMENTS_DEFAULT_LIMIT);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<DocumentListFilters>(INITIAL_FILTERS);
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
        const data = await apiListDocuments(
          {
            page,
            limit: pageSize,
            searchString: debouncedSearch.trim() || undefined,
            hasMedia:
              filters.hasMedia === '' ? undefined : filters.hasMedia === 'true',
            sort: filters.sort,
            order: filters.order,
          },
          { signal: controller.signal },
        );
        setItems(Array.isArray(data?.data) ? data.data : []);
        setTotal(Number(data?.total ?? 0));
      } catch (err: unknown) {
        if (isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, 'Erro ao carregar os documentos'));
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
export function useDocumentMutations(refresh: () => void) {
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      setSaving(true);
      setActionError('');
      try {
        await action();
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
    (values: DocumentFormValues, documentId?: string) =>
      run(async () => {
        const formData = buildDocumentFormData(values, documentId);
        if (documentId) {
          await apiUpdateDocument(documentId, formData);
        } else {
          await apiCreateDocument(formData);
        }
      }, 'Erro ao salvar o documento'),
    [run],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await apiDeleteDocument(id);
      }, 'Erro ao excluir o documento'),
    [run],
  );

  return { saving, actionError, setActionError, save, remove };
}
