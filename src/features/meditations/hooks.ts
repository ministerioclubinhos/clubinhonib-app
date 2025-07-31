import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MeditationData } from '@/store/slices/meditation/meditationSlice';
import { listMeditations, deleteMeditation } from './api';

export function useMeditationsList() {
  const [all, setAll] = useState<MeditationData[]>([]);
  const [items, setItems] = useState<MeditationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMeditations();
      setAll(data);
      setItems(data);
    } catch {
      setError('Erro ao buscar meditações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // busca por tema (debounced)
  useEffect(() => {
    setFiltering(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const q = search.trim().toLowerCase();
      const filtered = !q ? all : all.filter(m => m.topic.toLowerCase().includes(q));
      setItems(filtered);
      setFiltering(false);
    }, 300);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [search, all]);

  const remove = useCallback(async (m: MeditationData) => {
    setLoading(true);
    try {
      await deleteMeditation(m.id);
      await load();
    } catch {
      setError('Erro ao deletar meditação.');
    } finally {
      setLoading(false);
    }
  }, [load]);

  return {
    meditations: items,
    allMeditations: all,
    loading,
    filtering,
    error,
    setError,
    search,
    setSearch,
    reload: load,
    removeMeditation: remove,
  };
}

// helper para data amigável (opcional)
export const formatPtBrDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
