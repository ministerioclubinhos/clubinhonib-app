import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deleteWeekMaterial, listWeekMaterials, setCurrentWeek } from './api';
import { WeekMaterialPageData } from '@/store/slices/week-material/weekMaterialSlice';

export function useWeekMaterials() {
  const [materials, setMaterials] = useState<WeekMaterialPageData[]>([]);
  const [filtered, setFiltered] = useState<WeekMaterialPageData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const debounceRef = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listWeekMaterials();
      setMaterials(data);
      setFiltered(data);
    } catch (e) {
      setError('Erro ao buscar materiais semanais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const term = search.toLowerCase();
      setFiltered(
        materials.filter((m) => (m.title || '').toLowerCase().includes(term)),
      );
      setIsFiltering(false);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, materials]);

  const remove = useCallback(async (id: string) => {
    await deleteWeekMaterial(id);
    await fetchAll();
  }, [fetchAll]);

  const markAsCurrent = useCallback(async (id: string) => {
    await setCurrentWeek(id);
    await fetchAll();
  }, [fetchAll]);

  return {
    materials,
    filtered,
    search,
    setSearch,
    loading,
    isFiltering,
    error,
    setError,
    fetchAll,
    remove,
    markAsCurrent,
  };
}
