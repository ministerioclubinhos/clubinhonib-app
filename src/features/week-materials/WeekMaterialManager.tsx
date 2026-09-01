import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Grid2,
  TextField,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import BackHeader from '@/components/common/header/BackHeader';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { setWeekMaterialData } from '@/store/slices/week-material/weekMaterialSlice';

import SetCurrentWeekConfirmDialog from './components/SetCurrentWeekConfirmDialog';
import WeekMaterialCard from './components/WeekMaterialCard';
import WeekMaterialDetailsModal from './components/WeekMaterialDetailsModal';
import { WEEK_MATERIAL_ROUTES } from './constants';
import { useWeekMaterials } from './hooks';
import { WeekMaterialResponse } from './types';

/** Admin screen listing every week material page. */
export default function WeekMaterialManager() {
  const {
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
  } = useWeekMaterials();

  const [materialToDelete, setMaterialToDelete] =
    useState<WeekMaterialResponse | null>(null);
  const [selectedMaterial, setSelectedMaterial] =
    useState<WeekMaterialResponse | null>(null);
  const [materialToSetAsCurrent, setMaterialToSetAsCurrent] =
    useState<WeekMaterialResponse | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleEdit = (material: WeekMaterialResponse) => {
    dispatch(setWeekMaterialData(material));
    navigate(WEEK_MATERIAL_ROUTES.EDIT_PAGE);
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    await remove(materialToDelete.id);
    setMaterialToDelete(null);
  };

  const handleSetAsCurrentWeek = async () => {
    if (!materialToSetAsCurrent) return;
    await markAsCurrent(materialToSetAsCurrent.id);
    setMaterialToSetAsCurrent(null);
    await dispatch(fetchRoutes());
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Materiais Semanais" />

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          label="Buscar por título"
          placeholder="Buscar por título..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Box>

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress aria-label="Carregando materiais" />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhum material encontrado.</Alert>
        </Box>
      ) : (
        <Grid2 container spacing={4} justifyContent="center">
          {filtered.map((material) => (
            <WeekMaterialCard
              key={material.id}
              material={material}
              onView={() => setSelectedMaterial(material)}
              onEdit={() => handleEdit(material)}
              onDelete={() => setMaterialToDelete(material)}
              onSetAsCurrent={() => setMaterialToSetAsCurrent(material)}
            />
          ))}
        </Grid2>
      )}

      <DeleteConfirmDialog
        open={Boolean(materialToDelete)}
        title={materialToDelete?.title}
        onClose={() => setMaterialToDelete(null)}
        onConfirm={handleDelete}
      />

      <WeekMaterialDetailsModal
        material={selectedMaterial}
        open={Boolean(selectedMaterial)}
        onClose={() => setSelectedMaterial(null)}
      />

      <SetCurrentWeekConfirmDialog
        open={Boolean(materialToSetAsCurrent)}
        materialTitle={materialToSetAsCurrent?.title ?? ''}
        onClose={() => setMaterialToSetAsCurrent(null)}
        onConfirm={handleSetAsCurrentWeek}
      />
    </Box>
  );
}
