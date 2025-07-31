import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';
import { fetchBannersApi } from './api';

export function useInformativeBanners() {
  const [banners, setBanners] = useState<InformativeBannerData[]>([]);
  const [filtered, setFiltered] = useState<InformativeBannerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBannersApi();
      setBanners(data);
      setFiltered(data);
    } catch (err: any) {
      setError(
        err instanceof Error
          ? `Erro ao buscar banners: ${err.message}`
          : 'Erro desconhecido ao buscar banners.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    setIsFiltering(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        setFiltered(banners);
      } else {
        setFiltered(banners.filter((b) => b.title.toLowerCase().includes(term)));
      }
      setIsFiltering(false);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [searchTerm, banners]);

  return {
    banners,
    filtered,
    searchTerm,
    setSearchTerm,
    isFiltering,
    loading,
    error,
    setError,
    fetchBanners,
    setBanners,  // expõe caso queira otimizar localmente após criar/editar
  };
}
