import React, { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { useDispatch } from 'react-redux';


import { AppDispatch } from 'store/slices';
import {
  setInformativeBanner,
  InformativeBannerData,
} from 'store/slices/informative/informativeBannerSlice';

import { useInformativeBanners } from './hooks';
import { deleteBannerApi } from './api';

import BannerToolbar from './components/BannerToolbar';
import BannerSearch from './components/BannerSearch';
import BannerGrid from './components/BannerGrid';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import InformativeBannerModal from './components/InformativeBannerModal';
import BackHeader from '@/components/common/header/BackHeader';

export default function InformativeBannerListPage() {
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
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      {/* Header reutilizável: arrow no mobile + título */}
      <BackHeader title="Banners Informativos" />

      {/* Toolbar (mantida) */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          mb: 4,
        }}
      >
        <BannerToolbar onCreate={handleOpenCreate} />
      </Box>

      <BannerSearch value={searchTerm} onChange={setSearchTerm} loading={isFiltering} />

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
      ) : filtered.length === 0 ? (
        <Alert severity="info">Nenhum banner encontrado para o termo pesquisado.</Alert>
      ) : (
        <BannerGrid
          items={filtered}
          onEdit={handleOpenEdit}
          onDeleteAsk={setDeleteTarget}
        />
      )}

      {/* Modal de criar/editar */}
      <InformativeBannerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchBanners}
        initialData={editData}
      />

      {/* Confirmação de exclusão */}
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
