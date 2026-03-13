import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Button, Paper, Grid, Stack, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, IconButton, TextField,
  CircularProgress, useMediaQuery, useTheme,
  Typography, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useDispatch } from 'react-redux';
import { clearDocumentData, clearMedia, setDocumentData, setMedia } from 'store/slices/documents/documentSlice';
import { AppDispatch } from 'store/slices';

import DocumentForm from './components/DocumentForm';
import DocumentCard from './components/DocumentCard';
import DocumentDetailsModal from './components/DocumentDetailsModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import MediaDocumentPreviewModal from '@/utils/MediaDocumentPreviewModal';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import { DocumentItem } from './types';
import { deleteDocument, listDocuments } from './api';
import BackHeader from '@/components/common/header/BackHeader';

const DocumentsManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [detailsModalOpen, setDetailsModalOpen] = useState<DocumentItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<DocumentItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<DocumentItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<Pick<DocumentItem, 'id' | 'name'> | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchDocuments = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const data = await listDocuments(search);
      setDocuments(data);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao carregar documentos.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchDocuments(searchTerm.trim() || undefined);
      return;
    }
    const t = setTimeout(() => {
      fetchDocuments(searchTerm.trim() || undefined);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, fetchDocuments]);

  const handleCreate = () => {
    dispatch(clearDocumentData());
    dispatch(clearMedia());
    setIsEditing(false);
    setFormOpen(true);
  };

  const handleEdit = (doc: any) => {
    dispatch(setDocumentData(doc));
    if (doc.media) dispatch(setMedia(doc.media));
    setIsEditing(true);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchDocuments(searchTerm.trim() || undefined);
    setSnackbar({
      open: true,
      message: isEditing ? 'Documento atualizado com sucesso!' : 'Documento criado com sucesso!',
      severity: 'success',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalOpen) return;
    try {
      await deleteDocument(deleteModalOpen.id);
      setSnackbar({ open: true, message: 'Documento excluído com sucesso!', severity: 'success' });
      fetchDocuments(searchTerm.trim() || undefined);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir documento.', severity: 'error' });
    } finally {
      setDeleteModalOpen(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const isEmpty = !loading && documents.length === 0;
  const hasSearch = searchTerm.length > 0;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 1, md: 2 },
        pb: { xs: 6, md: 4 },
        maxWidth: 1400,
        mx: 'auto',
      }}
    >
      <BackHeader title="Gerenciar Documentos" />

      {/* Barra de ações e busca */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nome do documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: 'grey.50',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            fullWidth={isXs}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 1.25 },
              minHeight: { xs: 48, sm: 'auto' },
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '0.9375rem' },
              textTransform: 'none',
              bgcolor: '#81d742',
              boxShadow: (t) => t.shadows[2],
              '&:hover': {
                bgcolor: '#6bb83a',
                boxShadow: (t) => t.shadows[4],
              },
              '& .MuiButton-startIcon': { mr: 1 },
            }}
          >
            Novo documento
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={280}>
          <CircularProgress size={40} sx={{ color: '#81d742' }} />
        </Box>
      ) : isEmpty ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>
            {hasSearch ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}>
            {hasSearch
              ? 'Tente outro termo de busca.'
              : 'Crie o primeiro documento para professores e alunos acessarem.'}
          </Typography>
          {!hasSearch && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                minHeight: 48,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#81d742',
                '&:hover': { bgcolor: '#6bb83a' },
              }}
            >
              Criar documento
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <DocumentCard
                document={doc}
                onEdit={handleEdit}
                onDelete={(d) => setDeleteModalOpen({ id: d.id, name: d.name })}
                onViewDetails={setDetailsModalOpen}
                onPreviewFile={setViewModalOpen}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isXs}
        PaperProps={{
          sx: {
            borderRadius: isXs ? 0 : 3,
            boxShadow: 24,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
            py: 2,
            px: 3,
            bgcolor: '#81d742',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
          }}
        >
          {isEditing ? 'Editar documento' : 'Novo documento'}
          <IconButton onClick={() => setFormOpen(false)} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <DocumentForm isEditing={isEditing} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <DocumentDetailsModal open={!!detailsModalOpen} document={detailsModalOpen} onClose={() => setDetailsModalOpen(null)} />
      <DocumentPreviewModal open={!!previewModalOpen} document={previewModalOpen} onClose={() => setPreviewModalOpen(null)} />
      <MediaDocumentPreviewModal
        open={!!viewModalOpen}
        media={viewModalOpen?.media || null}
        title={viewModalOpen?.name}
        onClose={() => setViewModalOpen(null)}
      />

      <DeleteConfirmDialog
        open={!!deleteModalOpen}
        title={deleteModalOpen?.name}
        onClose={() => setDeleteModalOpen(null)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsManager;
