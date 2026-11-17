import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useVisibleRoutes } from '@/features/feature-flags';
import { useDebouncedValue } from '@/hooks';
import type { AppDispatch, RootState } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';

import { filterMaterialGallery, getPublicWeekMaterialRoutes } from './gallery.utils';
import { MaterialGalleryCategory, MaterialGallerySort } from './types';

export function useWeekMaterialsGallery() {
  const dispatch = useDispatch<AppDispatch>();
  const routes = useVisibleRoutes();
  const { loading, error } = useSelector((state: RootState) => state.routes);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(MaterialGalleryCategory.ALL);
  const [sort, setSort] = useState(MaterialGallerySort.NEWEST);
  const debouncedSearch = useDebouncedValue(search);
  const materials = useMemo(() => getPublicWeekMaterialRoutes(routes), [routes]);
  const filteredMaterials = useMemo(
    () => filterMaterialGallery(materials, { search: debouncedSearch, category, sort }),
    [materials, debouncedSearch, category, sort]
  );

  return {
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    sort,
    setSort,
    materials,
    filteredMaterials,
    hasFilters: Boolean(search.trim()) || category !== MaterialGalleryCategory.ALL,
    resetFilters: () => {
      setSearch('');
      setCategory(MaterialGalleryCategory.ALL);
    },
    retry: () => {
      void dispatch(fetchRoutes());
    },
  };
}
