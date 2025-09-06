import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Paper, Grid, Stack, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, IconButton, TextField,
  CircularProgress, Tooltip, useMediaQuery, useTheme, Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { clearDocumentData, clearMedia, setDocumentData, setMedia } from 'store/slices/documents/documentSlice';
import { AppDispatch } from 'store/slices';
import { useNavigate } from 'react-router-dom';

import DocumentForm from './components/DocumentForm';
import DocumentCard from './components/DocumentCard';
import DocumentDetailsModal from './components/DocumentDetailsModal';
import DocumentPreviewModal from './components/DocumentPreviewModal';
import DocumentViewModal from './components/DocumentViewModal';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

import { DocumentItem } from './types';
import { deleteDocument, listDocuments } from './api';
import BackHeader from '@/components/common/header/BackHeader';

const DocumentsManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);

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

  const fetchDocuments = async () => {
    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao carregar documentos.', severity: 'error' });
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const filteredDocuments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return documents.filter((d) => d.name.toLowerCase().includes(term));
  }, [documents, searchTerm]);

  useEffect(() => {
    setIsFiltering(true);
    const t = setTimeout(() => setIsFiltering(false), 200);
    return () => clearTimeout(t);
  }, [filteredDocuments]);

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
      await deleteDocument(deleteModalOpen.id);
      setSnackbar({ open: true, message: 'Documento excluído com sucesso!', severity: 'success' });
      fetchDocuments();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao excluir documento.', severity: 'error' });
    } finally {
      setDeleteModalOpen(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 0, md: 4 }, mt: { xs: 0, md: 4 }, mb: { xs: 4, md: 2 }, width: '95%', mx: 'auto' }}>
      <BackHeader title="Gerenciar Documentos" />

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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Documento
          </Button>
        </Stack>
      </Paper>

      {isXs && (
        <Tooltip title="Novo Documento">
          <Fab
            color="primary"
            aria-label="Novo Documento"
            onClick={handleCreate}
            sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: 1200 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {isFiltering ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
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

      {/* Form Modal */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          {isEditing ? 'Editar Documento' : 'Novo Documento'}
          <IconButton onClick={() => setFormOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <DocumentForm isEditing={isEditing} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      <DocumentDetailsModal open={!!detailsModalOpen} document={detailsModalOpen} onClose={() => setDetailsModalOpen(null)} />
      <DocumentPreviewModal open={!!previewModalOpen} document={previewModalOpen} onClose={() => setPreviewModalOpen(null)} />
      <DocumentViewModal open={!!viewModalOpen} document={viewModalOpen} onClose={() => setViewModalOpen(null)} />

      <DeleteConfirmDialog
        open={!!deleteModalOpen}
        title={deleteModalOpen?.name}
        onClose={() => setDeleteModalOpen(null)}
        onConfirm={handleConfirmDelete}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsManager;
