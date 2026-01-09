import { useCallback, useEffect, useState } from 'react';
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';
import { listImageSections } from './api';

export function useImageSections() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [filteredSections, setFilteredSections] = useState<SectionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listImageSections();
      setSections(data);
      setFilteredSections(data);
    } catch (e) {
      console.error('Erro ao buscar seções de imagens:', e);
      setError('Erro ao buscar seções de imagens');
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
              (s.caption ?? '').toLowerCase().includes(term) ||
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
