import { useCallback, useEffect, useState } from 'react';
import { IdeasSection, IdeasPage } from './types';
import { listIdeasSections, listIdeasPages } from './api';

export function useIdeasSections() {
  const [sections, setSections] = useState<IdeasSection[]>([]);
  const [filteredSections, setFilteredSections] = useState<IdeasSection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listIdeasSections();
      setSections(data);
      setFilteredSections(data);
    } catch (e) {
      console.error('Erro ao buscar Ideias compartilhadas:', e);
      setError('Erro ao buscar Ideias compartilhadas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        setFilteredSections(sections);
      } else {
        setFilteredSections(
          sections.filter(
            (s) =>
              (s.title ?? '').toLowerCase().includes(term) ||
              (s.description ?? '').toLowerCase().includes(term)
          )
        );
      }
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, sections]);

  return {
    sections,
    filteredSections,
    searchTerm,
    setSearchTerm,
    loading,
    isFiltering,
    error,
    setError,
    fetchSections,
  };
}

export function useIdeasPages() {
  const [pages, setPages] = useState<IdeasPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listIdeasPages();
      setPages(data);
    } catch (e) {
      console.error('Erro ao buscar páginas de ideias:', e);
      setError('Erro ao buscar páginas de ideias');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pages,
    loading,
    error,
    setError,
    fetchPages,
  };
}
