import { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, Alert, TextField, Button } from '@mui/material';
import api from '@/config/axiosConfig';
import { IdeasPageData } from 'store/slices/ideas/ideasSlice';
import IdeasPageCard from './IdeasPageCard';
import IdeasPageDetailsModal from './IdeasPageDetailsModal';
import DeleteConfirmDialog from 'common/modal/DeleteConfirmDialog';

export default function IdeasPageListPage() {
  const [ideasPages, setIdeasPages] = useState<IdeasPageData[]>([]);
  const [filteredPages, setFilteredPages] = useState<IdeasPageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageToDelete, setPageToDelete] = useState<IdeasPageData | null>(null);
  const [selectedPage, setSelectedPage] = useState<IdeasPageData | null>(null);

  useEffect(() => {
    fetchIdeasPages();
  }, []);

  const fetchIdeasPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<IdeasPageData[]>('/ideas-pages');
      setIdeasPages(res.data);
      setFilteredPages(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao buscar páginas: ${err.message}. Tente novamente mais tarde.`
          : 'Erro desconhecido ao buscar páginas.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      setFilteredPages(ideasPages.filter((p) => p.title.toLowerCase().includes(term)));
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, ideasPages]);

  const handleDelete = async () => {
    if (!pageToDelete) return;
    try {
      await api.delete(`/ideas-pages/${pageToDelete.id}`);
      await fetchIdeasPages();
      setError(null);
    } catch {
      setError('Erro ao excluir a página. Tente novamente.');
    } finally {
      setPageToDelete(null);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, md: 3 }, py: 2, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight="bold"
        sx={{ mb: 4 }}
        aria-label="Lista de Páginas de Ideias"
      >
        Páginas de Ideias
      </Typography>

      <Box maxWidth={500} mx="auto" mb={4} position="relative">
        <TextField
          fullWidth
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Campo de busca por título"
          inputProps={{ 'aria-label': 'Buscar por título' }}
        />
        {isFiltering && (
          <CircularProgress
            size={24}
            sx={{ position: 'absolute', right: 10, top: 10 }}
            aria-label="Filtrando páginas"
          />
        )}
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress aria-label="Carregando páginas" />
          <Typography variant="body2" mt={2}>
            Carregando páginas de ideias...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchIdeasPages} sx={{ ml: 2 }}>
            Tentar novamente
          </Button>
        </Alert>
      ) : filteredPages.length === 0 ? (
        <Alert severity="info">Nenhuma página encontrada para o termo pesquisado.</Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPages.map((page) => (
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
        onConfirm={handleDelete}
        confirmText="Tem certeza que deseja excluir esta página?"
      />
    </Box>
  );
}
