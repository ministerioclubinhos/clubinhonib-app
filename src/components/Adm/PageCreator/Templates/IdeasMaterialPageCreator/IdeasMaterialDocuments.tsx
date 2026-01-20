import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,

  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { MediaItem, MediaType, MediaUploadType } from 'store/slices/types';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';

interface DocumentsProps {
  documents: MediaItem[];
  setDocuments: (docs: MediaItem[]) => void;
  ideaTitle?: string;
}

export function IdeasMaterialDocuments({ documents, setDocuments, ideaTitle }: DocumentsProps) {
  const [tempDoc, setTempDoc] = useState<MediaItem>({
    title: '',
    description: '',
    mediaType: MediaType.DOCUMENT,
    uploadType: MediaUploadType.UPLOAD,
    url: '',
    platformType: undefined,
  });
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState({ title: false, description: false, url: false });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (editingIndex === null) {
      const count = documents.length + 1;
      const autoTitle = ideaTitle
        ? `Documento ${count} da ideia "${ideaTitle}"`
        : `Documento ${count} da ideia`;
      const autoDesc = ideaTitle
        ? `Documento ${count} para auxiliar na ideia "${ideaTitle}"`
        : `Documento ${count} para auxiliar na ideia`;

      setTempDoc((prev) => ({
        ...prev,
        title: autoTitle,
        description: autoDesc,
      }));
    }
  }, [ideaTitle, documents.length, editingIndex]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const objectURL = URL.createObjectURL(file);
    setTempDoc((prev) => ({ ...prev, url: objectURL, file }));
  };

  const resetForm = () => {
    setTempDoc({
      title: '',
      description: '',
      mediaType: MediaType.DOCUMENT,
      uploadType: MediaUploadType.UPLOAD,
      url: '',
      platformType: undefined,
    });
    setFileName('');
    setEditingIndex(null);
    setErrors({ title: false, description: false, url: false });
  };

  const handleAddOrUpdate = () => {
    const isValid = tempDoc.uploadType === MediaUploadType.UPLOAD; // Only upload supported for docs now
    const hasError = !tempDoc.title || !tempDoc.description || !tempDoc.url; // URL is set by handleUpload

    setErrors({
      title: !tempDoc.title,
      description: !tempDoc.description,
      url: !tempDoc.url,
    });

    if (hasError) return;

    const updated =
      editingIndex !== null
        ? documents.map((doc, i) => (i === editingIndex ? tempDoc : doc))
        : [...documents, tempDoc];

    setDocuments(updated);
    resetForm();
  };

  const handleEdit = (index: number) => {
    setTempDoc(documents[index]);
    setFileName(documents[index].file?.name || '');
    setEditingIndex(index);
  };

  const handleRemoveClick = (index: number) => {
    setItemToDelete(index);
    setOpenDeleteDialog(true);
  };

  const confirmRemove = () => {
    if (itemToDelete !== null) {
      setDocuments(documents.filter((_, i) => i !== itemToDelete));
      setItemToDelete(null);
    }
    setOpenDeleteDialog(false);
  };

  const handlePreview = (document: MediaItem) => {
    setPreviewDocument(document);
    setOpenPreviewModal(true);
  };

  const canPreview = (document: MediaItem): boolean => {
    return document.uploadType === MediaUploadType.UPLOAD || !!document.isLocalFile;
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert
            severity="info"
            variant="outlined"
            sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' }, py: 0.5 }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 4 } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Título Automático
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2, mt: 0.5 }}>
                  {tempDoc.title}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Descrição Automática
                </Typography>
                <Typography variant="body2" fontWeight="medium" sx={{ lineHeight: 1.2, mt: 0.5 }}>
                  {tempDoc.description}
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
            {fileName ? 'Trocar Documento' : 'Upload de Documento (PDF, DOC)'}
            <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleUpload} />
          </Button>
          {fileName && (
            <Typography variant="body2" mt={1} textAlign="center">
              Arquivo selecionado: <strong>{fileName}</strong>
            </Typography>
          )}
          {errors.url && (
            <Typography variant="caption" color="error" display="block" textAlign="center">
              Selecione um arquivo para continuar.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" fullWidth onClick={handleAddOrUpdate} sx={{ mt: 2 }}>
            {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar Documento'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {documents.map((doc, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                transform: 'translateY(-2px)',
              },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{
                  p: 1.5,
                  bgcolor: 'primary.light',
                  borderRadius: '12px',
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '48px',
                  height: '48px',
                }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>📄</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight="bold" sx={{ mb: 1, fontSize: '1.1rem' }}>
                    {doc.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {doc.description}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                {canPreview(doc) && (
                  <Tooltip title="Visualizar">
                    <IconButton onClick={() => handlePreview(doc)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Editar">
                  <IconButton onClick={() => handleEdit(index)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton color="error" onClick={() => handleRemoveClick(index)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmRemove} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <MediaDocumentPreviewModal
        open={openPreviewModal}
        onClose={() => {
          setOpenPreviewModal(false);
          setPreviewDocument(null);
        }}
        media={previewDocument}
        title={previewDocument?.title}
      />
    </Box>
  );
}
