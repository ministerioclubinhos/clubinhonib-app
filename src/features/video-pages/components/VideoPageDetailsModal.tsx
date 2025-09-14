import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Button, IconButton, Divider, Paper, Grid
} from '@mui/material';
import { ContentCopy, Close } from '@mui/icons-material';
import { Fragment } from 'react/jsx-runtime';
import { VideoPageData } from 'store/slices/video/videoSlice';
import { MediaItem, MediaUploadType } from 'store/slices/types';
import { copyToClipboard, formatDate } from '../utils';

interface VideoPageDetailsModalProps {
  page: VideoPageData | null;
  open: boolean;
  onClose: () => void;
}

export default function VideoPageDetailsModal({ page, open, onClose }: VideoPageDetailsModalProps) {
  const navigate = useNavigate();

  const handleCopyUrl = async (url: string) => {
    await copyToClipboard(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: { width: '100%', m: '10px auto', p: '10px', borderRadius: 3, bgcolor: '#fafafa' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem', color: '#333', p: 2 }}>
          Detalhes da Página de Vídeos
        </DialogTitle>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12 }}
          title="Fechar"
          aria-label="Fechar"
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2, py: 1 }}>
        {page && (
          <Stack spacing={4} sx={{ mx: 'auto', maxWidth: '100%' }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" textAlign="center" mb={3}>
                Informações Gerais
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333' }}>
                    <strong>Título:</strong> {page.title || 'Sem Título'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333', whiteSpace: 'pre-wrap' }}>
                    <strong>Descrição:</strong> {page.description || 'Sem Descrição'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333' }}>
                    <strong>Visibilidade:</strong> {page.public ? 'Pública' : 'Privada'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333' }}>
                    <strong>Criado em:</strong> {formatDate(page.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ color: '#333' }}>
                    <strong>Atualizado em:</strong> {formatDate(page.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {page.videos.length > 0 && (
              <Fragment>
                <Divider sx={{ my: 2 }} />
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" textAlign="center" mb={3}>
                    Vídeos
                  </Typography>

                  <Grid container spacing={3}>
                    {page.videos.map((video: MediaItem) => (
                      <Grid item xs={12} md={6} key={video.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            bgcolor: '#f9f9f9',
                            height: '100%',
                          }}
                        >
                          <Typography variant="body1" sx={{ color: '#333' }}>
                            <strong>Título:</strong> {video.title || 'Sem Título'}
                          </Typography>

                          <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                            <strong>Descrição:</strong> {video.description || 'Sem Descrição'}
                          </Typography>

                          <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                            <strong>Tipo:</strong>{' '}
                            {video.uploadType === MediaUploadType.UPLOAD ? 'Upload' : 'Link'}
                          </Typography>

                          {video.platformType && (
                            <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                              <strong>Plataforma:</strong> {video.platformType}
                            </Typography>
                          )}

                          {video.url && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ color: '#555' }}>
                                <strong>URL:</strong> {video.url}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCopyUrl(video.url!)}
                                title="Copiar URL"
                                aria-label="Copiar URL"
                                sx={{ color: 'primary.main' }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Box>
                          )}

                          {video.isLocalFile && video.originalName && (
                            <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                              <strong>Nome Original:</strong> {video.originalName}
                            </Typography>
                          )}

                          {video.size && (
                            <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                              <strong>Tamanho:</strong> {(video.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Fragment>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', p: '8px' }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 120 }}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={() => page && navigate(`/${page.route?.path}`)}
          disabled={!page || !page.route}
          sx={{ minWidth: 150, ml: 2 }}
        >
          Acessar Página
        </Button>
      </DialogActions>
    </Dialog>
  );
}
