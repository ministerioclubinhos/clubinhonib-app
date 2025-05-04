import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../../../config/axiosConfig';
import { useDispatch } from 'react-redux';
import {
  setInformativeBanner,
  InformativeBannerData,
} from 'store/slices/informative/informativeBannerSlice';
import DeleteConfirmDialog from 'common/modal/DeleteConfirmDialog';
import InformativeBannerModal from './InformativeBannerModal';

export default function InformativeBannerListPage() {
  const dispatch = useDispatch();
  const [banners, setBanners] = useState<InformativeBannerData[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<InformativeBannerData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<InformativeBannerData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InformativeBannerData | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<InformativeBannerData[]>('/informatives');
      setBanners(res.data);
      setFilteredBanners(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao buscar banners: ${err.message}`
          : 'Erro desconhecido ao buscar banners.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      setFilteredBanners(
        banners.filter((b) => b.title.toLowerCase().includes(term))
      );
      setIsFiltering(false);
    }, 300);

    setIsFiltering(true);
    return () => clearTimeout(timer);
  }, [searchTerm, banners]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/informatives/${deleteTarget.id}`);
      await fetchBanners(); // <- força atualização após deletar
    } catch {
      setError('Erro ao excluir o banner. Tente novamente.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: InformativeBannerData) => {
    dispatch(setInformativeBanner(banner));
    setEditData(banner);
    setModalOpen(true);
  };

  return (
    <Box sx={{ px: { xs: 1, md: 3 }, my: { xs: 0, md: 3 }, py: 2, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        mb={4}
        gap={2}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign={{ xs: 'center', md: 'left' }}
          fontSize={{ xs: '1.6rem', md: '2.25rem' }}
        >
          Banners Informativos
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{
            width: { xs: '100%', md: 'auto' },
            fontSize: { xs: '0.9rem', md: '1rem' },
            py: { xs: 1.2, md: 1 },
          }}
        >
          Criar Banner
        </Button>
      </Box>

      <Box maxWidth={500} mx="auto" mb={4} position="relative">
        <TextField
          fullWidth
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isFiltering && (
          <CircularProgress size={24} sx={{ position: 'absolute', right: 10, top: 10 }} />
        )}
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress />
          <Typography variant="body2" mt={2}>
            Carregando banners informativos...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchBanners} sx={{ ml: 2 }}>
            Tentar novamente
          </Button>
        </Alert>
      ) : filteredBanners.length === 0 ? (
        <Alert severity="info">Nenhum banner encontrado para o termo pesquisado.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredBanners.map((banner) => (
            <Grid item xs={12} sm={6} md={4} key={banner.id}>
              <Box
                p={2}
                border="1px solid #ccc"
                borderRadius={2}
                bgcolor="#fff"
                boxShadow={2}
                position="relative"
                sx={{ transition: '0.2s', '&:hover': { boxShadow: 4 } }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {banner.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {banner.description}
                </Typography>
                <Typography
                  variant="caption"
                  color={banner.public ? 'success.main' : 'warning.main'}
                  display="block"
                  mt={2}
                >
                  {banner.public ? 'Público' : 'Privado'}
                </Typography>
                <Box position="absolute" bottom={8} right={8} display="flex" gap={1}>
                  <IconButton size="small" color="primary" onClick={() => handleOpenEdit(banner)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(banner)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>

              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <InformativeBannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchBanners}
        initialData={editData}
      />


      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.title}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmText="Tem certeza que deseja excluir este banner?"
      />
    </Box>
  );
}
