import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiDeleteImagePage, apiListImagePages } from './api';
import { ImagePageData } from 'store/slices/image/imageSlice';

export function useImagePages() {
  const [pages, setPages] = useState<ImagePageData[]>([]);
  const [filtered, setFiltered] = useState<ImagePageData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiListImagePages();
      setPages(data);
      setFiltered(data);
    } catch (e) {
      console.error('Erro ao buscar páginas de imagens:', e);
      setError('Erro ao buscar páginas de imagens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => {
      const term = search.trim().toLowerCase();
      if (!term) {
        setFiltered(pages);
      } else {
        setFiltered(
          pages.filter((p) => (p.title ?? '').toLowerCase().includes(term)),
        );
      }
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, pages]);

  const removePage = useCallback(async (id: string) => {
    await apiDeleteImagePage(id);
    await fetchPages();
  }, [fetchPages]);

  const state = useMemo(() => ({
    pages, filtered, loading, isFiltering, error,
  }), [pages, filtered, loading, isFiltering, error]);

  return { ...state, search, setSearch, setError, fetchPages, removePage };
}
