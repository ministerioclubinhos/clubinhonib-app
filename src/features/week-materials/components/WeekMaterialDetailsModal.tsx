import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  IconButton,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { ContentCopy, Close } from '@mui/icons-material';
import { WeekMaterialPageData } from 'store/slices/week-material/weekMaterialSlice';
import { formatDate } from '../../week-materials/utils';
import DeleteConfirmDialog from '@/components/common/modal/DeleteConfirmDialog';

interface WeekMaterialDetailsModalProps {
  material: WeekMaterialPageData | null;
  open: boolean;
  onClose: () => void;
  deletable?: boolean;
  onDelete?: () => Promise<void>;
}

export default function WeekMaterialDetailsModal({
  material,
  open,
  onClose,
  deletable = false,
  onDelete,
}: WeekMaterialDetailsModalProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyUrl = (url: string) => navigator.clipboard.writeText(url);

  const handleConfirmDelete = async () => {
    if (!onDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete();
      setConfirmOpen(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isDeleting ? undefined : onClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            width: '100%',
            m: '10px auto',
            p: 2,
            borderRadius: 3,
            bgcolor: '#fafafa',
            position: 'relative',
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: '#555' }}
          disabled={isDeleting}
        >
          <Close />
        </IconButton>

        <DialogTitle
          sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#333', p: 2 }}
        >
          Detalhes dos Materiais Semanais
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1 }}>
          {material && (
            <Stack spacing={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  textAlign="center"
                  mb={3}
                >
                  Informações Gerais
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Título:</strong> {material.title || 'Sem Título'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Subtítulo:</strong> {material.subtitle || 'Sem Subtítulo'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      <strong>Descrição:</strong> {material.description || 'Sem Descrição'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Criado em:</strong> {formatDate(material.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Atualizado em:</strong> {formatDate(material.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Divider sx={{ my: 2 }} />

              {[
                { label: 'Vídeos', items: material.videos },
                { label: 'Documentos', items: material.documents },
                { label: 'Imagens', items: material.images },
                { label: 'Áudios', items: material.audios },
              ].map((section) =>
                section.items.length > 0 ? (
                  <Paper
                    key={section.label}
                    elevation={2}
                    sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary"
                      textAlign="center"
                      mb={3}
                    >
                      {section.label}
                    </Typography>

                    <Grid container spacing={3}>
                      {section.items.map((item) => (
                        <Grid item xs={12} md={6} key={item.id}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              bgcolor: '#f9f9f9',
                              height: '100%',
                            }}
                          >
                            <Typography variant="body1">
                              <strong>Título:</strong> {item.title || 'Sem Título'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Descrição:</strong> {item.description || 'Sem Descrição'}
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 1,
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                <strong>URL:</strong> {item.url}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyUrl(item.url)}
                                title="Copiar URL"
                                sx={{ color: '#1976d2' }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ) : null
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 1 }}>
          {deletable && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmOpen(true)}
              disabled={!material || isDeleting}
              sx={{ minWidth: 128 }}
            >
              Excluir
            </Button>
          )}
          <Button variant="outlined" onClick={onClose} disabled={isDeleting} sx={{ minWidth: 120 }}>
            Fechar
          </Button>
          <Button
            variant="contained"
            onClick={() => material && navigate(`/${material.route.path}`)}
            disabled={!material || isDeleting}
            sx={{ minWidth: 150 }}
          >
            Acessar Página
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmDialog
        open={confirmOpen}
        title={material?.title}
        onClose={() => !isDeleting && setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
