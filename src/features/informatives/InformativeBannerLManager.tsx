import React, { useState } from 'react';
import { Box, CircularProgress, Alert, Typography, Stack, Container } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store/slices';
import { setInformativeBanner, InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';
import { useInformativeBanners } from './hooks';
import { deleteBannerApi } from './api';

import BannerToolbar from './components/BannerToolbar';
import BannerSearch from './components/BannerSearch';
import BannerGrid from './components/BannerGrid';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import InformativeBannerModal from './components/InformativeBannerModal';
import BackHeader from '@/components/common/header/BackHeader';

export default function InformativeBannerLManager() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    filtered,
    searchTerm,
    setSearchTerm,
    isFiltering,
    loading,
    error,
    setError,
    fetchBanners,
  } = useInformativeBanners();

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<InformativeBannerData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InformativeBannerData | null>(null);

  const handleOpenCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (banner: InformativeBannerData) => {
    dispatch(setInformativeBanner(banner));
    setEditData(banner);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBannerApi(deleteTarget.id || '');
      await fetchBanners();
    } catch {
      setError('Erro ao excluir o banner. Tente novamente.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Container sx={{ maxWidth: { xs: '100%', md: '100%' }, px: { xs: 2, md: 3 }, pt: { xs: 0, md: 4 }, pb: 4 }}>
        <BackHeader title="Banners Informativos" />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mt: 2, mb: 2 }}
        >
          <BannerSearch value={searchTerm} onChange={setSearchTerm} loading={isFiltering} />
          <BannerToolbar onCreate={handleOpenCreate} />
        </Stack>

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
            <Box component="span" sx={{ ml: 2, textDecoration: 'underline', cursor: 'pointer' }} onClick={fetchBanners}>
              Tentar novamente
            </Box>
          </Alert>
        ) : filtered.length === 0 ? (
          <Alert severity="info">Nenhum banner encontrado para o termo pesquisado.</Alert>
        ) : (
          <BannerGrid items={filtered} onEdit={handleOpenEdit} onDeleteAsk={setDeleteTarget} />
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
        />
      </Container>
    </Box>
  );
}
