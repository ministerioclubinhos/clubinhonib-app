import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { AppDispatch } from '@/store/slices';
import { setWeekMaterialData, WeekMaterialPageData } from 'store/slices/week-material/weekMaterialSlice';
import { fetchRoutes } from '@/store/slices/route/routeSlice';

import { useWeekMaterials } from './hooks';
import WeekMaterialDetailsModal from './components/WeekMaterialDetailsModal';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import SetCurrentWeekConfirmDialog from './components/SetCurrentWeekConfirmDialog';
import WeekMaterialCard from './components/WeekMaterialCard';
import BackHeader from '@/components/common/header/BackHeader';

export default function WeekMaterialListPage() {
  const { filtered, search, setSearch, loading, isFiltering, error, setError, fetchAll, remove, markAsCurrent } =
    useWeekMaterials();

  const [materialToDelete, setMaterialToDelete] = useState<WeekMaterialPageData | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<WeekMaterialPageData | null>(null);
  const [materialToSetAsCurrent, setMaterialToSetAsCurrent] = useState<WeekMaterialPageData | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleEdit = (material: WeekMaterialPageData) => {
    dispatch(setWeekMaterialData(material));
    navigate('/adm/editar-pagina-semana');
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
        pt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Materiais Semanais" />

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}><CircularProgress /></Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" mt={10}><Alert severity="info">Nenhum material encontrado.</Alert></Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
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
        </Grid>
      )}

      <DeleteConfirmDialog
        open={!!materialToDelete}
        title={materialToDelete?.title}
        onClose={() => setMaterialToDelete(null)}
        onConfirm={handleDelete}
      />

      <WeekMaterialDetailsModal
        material={selectedMaterial}
        open={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />

      <SetCurrentWeekConfirmDialog
        open={!!materialToSetAsCurrent}
        materialTitle={materialToSetAsCurrent?.title || ''}
        onClose={() => setMaterialToSetAsCurrent(null)}
        onConfirm={handleSetAsCurrentWeek}
      />
    </Box>
  );
}
