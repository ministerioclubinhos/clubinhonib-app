import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDeleteIdeasPage, apiListIdeasPages } from './api';
import { IdeasPageData } from 'store/slices/ideas/ideasSlice';

export function useIdeasPages() {
  const [pages, setPages] = useState<IdeasPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiListIdeasPages();
      setPages(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao buscar páginas: ${err.message}. Tente novamente mais tarde.`
          : 'Erro desconhecido ao buscar páginas.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return { pages, setPages, loading, error, setError, fetchPages };
}

export function useIdeasSearch(pages: IdeasPageData[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(term));
  }, [pages, searchTerm]);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => setIsFiltering(false), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return { filtered, searchTerm, setSearchTerm, isFiltering };
}

export function useIdeasMutations(fetchPages: () => Promise<void> | void) {
  const [mutError, setMutError] = useState<string | null>(null);

  const deletePage = useCallback(
    async (id: string) => {
      setMutError(null);
      try {
        await apiDeleteIdeasPage(id);
        await fetchPages();
      } catch {
        setMutError('Erro ao excluir a página. Tente novamente.');
        throw new Error('delete failed');
      }
    },
    [fetchPages]
  );

  return { mutError, setMutError, deletePage };
}
