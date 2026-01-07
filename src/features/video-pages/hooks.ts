import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VideoPageData } from 'store/slices/video/videoSlice';
import { apiDeleteVideoPage, apiListVideoPages } from './api';

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDebounced(value), delay) as unknown as number;
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [value, delay]);

  return debounced;
}

export function useVideoPages() {
  const [pages, setPages] = useState<VideoPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 300);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await apiListVideoPages();
      setPages(list);
    } catch {
      setError('Erro ao buscar páginas de vídeos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter((p) => p.title?.toLowerCase().includes(term));
  }, [pages, debouncedSearch]);

  const removePage = useCallback(
    async (id: string) => {
      await apiDeleteVideoPage(id);
      await fetchPages();
    },
    [fetchPages]
  );

  return {
    pages,
    filtered,
    loading,
    error,
    search,
    setSearch,
    fetchPages,
    removePage,
    setError,
  };
}
