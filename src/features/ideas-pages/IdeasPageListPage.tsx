import React from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';
import { IdeasPageData } from 'store/slices/ideas/ideasSlice';
import IdeasPageCard from './components/IdeasPageCard';
import IdeasPageDetailsModal from './components/IdeasPageDetailsModal';
import IdeasToolbar from './components/IdeasToolbar';
import { useIdeasMutations, useIdeasPages, useIdeasSearch } from './hooks';
import BackHeader from '@/components/common/header/BackHeader';

export default function IdeasPageListPage() {
  const { pages, loading, error, setError, fetchPages } = useIdeasPages();
  const { filtered, searchTerm, setSearchTerm, isFiltering } = useIdeasSearch(pages);
  const { mutError, setMutError, deletePage } = useIdeasMutations(fetchPages);

  const [pageToDelete, setPageToDelete] = React.useState<IdeasPageData | null>(null);
  const [selectedPage, setSelectedPage] = React.useState<IdeasPageData | null>(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;
    try {
      await deletePage(pageToDelete.id || '');
      setError(null);
      setMutError(null);
    } catch {
      // erro já tratado em hook
    } finally {
      setPageToDelete(null);
    }
  };

  const anyError = error || mutError;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        pt: { xs: 0, md: 4 },
        bgcolor: '#f5f7fa',
        minHeight: '100vh',
      }}
    >
      <BackHeader title="Páginas de Ideias" />

      <IdeasToolbar
        search={searchTerm}
        onSearch={setSearchTerm}
        onRefresh={fetchPages}
        isFiltering={isFiltering}
      />

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress aria-label="Carregando páginas" />
          <Typography variant="body2" mt={2}>
            Carregando páginas de ideias...
          </Typography>
        </Box>
      ) : anyError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {anyError}
          <Button onClick={fetchPages} sx={{ ml: 2 }}>
            Tentar novamente
          </Button>
        </Alert>
      ) : filtered.length === 0 ? (
        <Alert severity="info">
          Nenhuma página encontrada para o termo pesquisado.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((page) => (
            <IdeasPageCard
              key={page.id}
              page={page}
              onView={() => setSelectedPage(page)}
              onDelete={() => setPageToDelete(page)}
            />
          ))}
        </Grid>
      )}

      <IdeasPageDetailsModal
        page={selectedPage}
        open={!!selectedPage}
        onClose={() => setSelectedPage(null)}
      />

      <DeleteConfirmDialog
        open={!!pageToDelete}
        title={pageToDelete?.title}
        onClose={() => setPageToDelete(null)}
        onConfirm={handleDeleteConfirm}
        confirmText="Tem certeza que deseja excluir esta página?"
      />
    </Box>
  );
}
