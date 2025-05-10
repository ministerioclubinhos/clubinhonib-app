import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import {
  clearDocumentData,
  clearMedia,
  setDocumentData,
  setMedia,
} from 'store/slices/documents/documentSlice';
import { AppDispatch } from 'store/slices';
import api from '@/config/axiosConfig';
import DocumentForm from './DocumentForm';
import DocumentCard from './DocumentCard';
import DocumentDetailsModal from './DocumentDetailsModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import DocumentViewModal from './DocumentViewModal';
import DocumentDeleteConfirmModal from './DocumentDeleteConfirmModal';

const DocumentList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState<any | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<any | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<any | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar documentos.',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const filtered = documents.filter((doc) => doc.name.toLowerCase().includes(term));
      setFilteredDocuments(filtered);
      setIsFiltering(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, documents]);

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
    fetchDocuments();
    setSnackbar({
      open: true,
      message: isEditing ? 'Documento atualizado com sucesso!' : 'Documento criado com sucesso!',
      severity: 'success',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalOpen) return;
    try {
      await api.delete(`/documents/${deleteModalOpen.id}`);
      setSnackbar({
        open: true,
        message: 'Documento excluído com sucesso!',
        severity: 'success',
      });
      fetchDocuments();
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir documento.',
        severity: 'error',
      });
    } finally {
      setDeleteModalOpen(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 4 },
        py: { xs: 0, md: 5 },
        mt: { xs: 0, md: 4 },
        mb: { xs: 4, md: 2 },
        width: '95%',
        mx: 'auto',
      }}
    >
      <Typography
        variant="h4"
        mb={4}
        fontWeight="bold"
        textAlign="center"
        sx={{
          fontSize: { xs: '1.75rem', md: '2.25rem' },
        }}
      >
        Gerenciar Documentos
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            fullWidth
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Documento
          </Button>
        </Stack>
      </Paper>

      {isFiltering ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <DocumentCard
                document={doc}
                onEdit={handleEdit}
                onDelete={setDeleteModalOpen}
                onViewDetails={setDetailsModalOpen}
                onPreviewFile={setViewModalOpen}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 2,
          }}
        >
          {isEditing ? 'Editar Documento' : 'Novo Documento'}
          <IconButton onClick={() => setFormOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DocumentForm isEditing={isEditing} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <DocumentDetailsModal
        open={!!detailsModalOpen}
        document={detailsModalOpen}
        onClose={() => setDetailsModalOpen(null)}
      />
      <DocumentPreviewModal
        open={!!previewModalOpen}
        document={previewModalOpen}
        onClose={() => setPreviewModalOpen(null)}
      />
      <DocumentViewModal
        open={!!viewModalOpen}
        document={viewModalOpen}
        onClose={() => setViewModalOpen(null)}
      />
      <DocumentDeleteConfirmModal
        open={!!deleteModalOpen}
        document={deleteModalOpen}
        onClose={() => setDeleteModalOpen(null)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentList;
