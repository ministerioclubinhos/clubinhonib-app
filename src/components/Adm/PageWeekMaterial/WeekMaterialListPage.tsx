import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '@/config/axiosConfig';
import { AppDispatch } from '@/store/slices';
import {
  setWeekMaterialData,
  WeekMaterialPageData,
} from 'store/slices/week-material/weekMaterialSlice';
import WeekMaterialDetailsModal from './WeekMaterialDetailsModal';
import WeekMaterialCard from './WeekMaterialCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import SetCurrentWeekConfirmDialog from './SetCurrentWeekConfirmDialog';
import { fetchRoutes } from '@/store/slices/route/routeSlice';


export default function WeekMaterialListPage() {
  const [weekMaterials, setWeekMaterials] = useState<WeekMaterialPageData[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<WeekMaterialPageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState('');
  const [materialToDelete, setMaterialToDelete] = useState<WeekMaterialPageData | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<WeekMaterialPageData | null>(null);
  const [materialToSetAsCurrent, setMaterialToSetAsCurrent] = useState<WeekMaterialPageData | null>(
    null
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWeekMaterials();
  }, []);

  const fetchWeekMaterials = async () => {
    setLoading(true);
    try {
      const response = await api.get('/week-material-pages');
      setWeekMaterials(response.data);
      setFilteredMaterials(response.data);
    } catch (err) {
      setError('Erro ao buscar materiais semanais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = weekMaterials.filter((m) => m.title.toLowerCase().includes(term));
      setFilteredMaterials(filtered);
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, weekMaterials]);

  const handleEdit = (material: WeekMaterialPageData) => {
    dispatch(setWeekMaterialData(material));
    navigate('/adm/editar-pagina-semana');
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    setMaterialToDelete(null);
    setLoading(true);
    try {
      await api.delete(`/week-material-pages/${materialToDelete.id}`);
      await fetchWeekMaterials();
    } catch {
      setError('Erro ao deletar material');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAsCurrentWeek = async () => {
    if (!materialToSetAsCurrent) return;
    setLoading(true);
    try {
      await api.post(`/week-material-pages/current-week/${materialToSetAsCurrent.id}`);
      await fetchWeekMaterials();
      await dispatch(fetchRoutes());

    } catch {
      setError('Erro ao definir como material da semana atual.');
    } finally {
      setMaterialToSetAsCurrent(null);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 1, md: 3 },
        py: { xs: 1, md: 2 },
        mt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2.4rem' } }}
      >
        Materiais Semanais
      </Typography>

      <Box maxWidth={500} mx="auto" mb={5}>
        <TextField
          fullWidth
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading || isFiltering ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : filteredMaterials.length === 0 ? (
        <Box textAlign="center" mt={10}>
          <Alert severity="info">Nenhum material encontrado.</Alert>
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {filteredMaterials.map((material) => (
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
