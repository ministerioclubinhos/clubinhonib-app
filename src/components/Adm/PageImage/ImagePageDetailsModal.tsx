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
import { Close, ContentCopy } from '@mui/icons-material';
import { ImagePageData } from 'store/slices/image/imageSlice';

interface ImagePageDetailsModalProps {
  page: ImagePageData | null;
  open: boolean;
  onClose: () => void;
}

export default function ImagePageDetailsModal({ page, open, onClose }: ImagePageDetailsModalProps) {
  const navigate = useNavigate();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'Não disponível';
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: '100%',
          margin: '10px auto',
          padding: '5px',
          borderRadius: 3,
          bgcolor: '#fafafa',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: '1.5rem',
          color: '#333',
          padding: '5px 16px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        Detalhes da Página de Imagens
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, color: '#777' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '5px', overflowX: 'auto' }}>
        {page && (
          <Stack spacing={3} sx={{ mt: 2, mx: 'auto', maxWidth: '100%' }}>
            <Paper elevation={1} sx={{ p: '5px', borderRadius: 2, bgcolor: '#fff' }}>
              <Typography variant="h6" fontWeight="bold" color="primary" textAlign="center" mb={2}>
                Informações Gerais
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'left',
                  width: '100%',
                  mt: 4,
                }}
              >
                <Grid
                  container
                  spacing={2}
                  sx={{ maxWidth: 800, width: '100%', px: { xs: 2, md: 0 } }}
                >
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Título:</strong> {page.title || 'Sem Título'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="body1"
                      sx={{ color: '#333', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      <strong>Descrição:</strong> {page.description || 'Sem Descrição'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Visibilidade:</strong> {page.public ? 'Pública' : 'Privada'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Criado em:</strong> {formatDate(page.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" sx={{ color: '#333', wordBreak: 'break-word' }}>
                      <strong>Atualizado em:</strong> {formatDate(page.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {page.sections.length > 0 && (
              <Box sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto' }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary"
                  textAlign="center"
                  mb={2}
                >
                  Seções
                </Typography>
                <Stack spacing={4}>
                  <Grid container spacing={3}>
                    {page.sections.map((section) => (
                      <Grid item xs={12} md={6} key={section.id}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: '#fff',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="medium"
                            color="#333"
                            textAlign="center"
                            mb={2}
                          >
                            {section.caption || 'Sem Título'}
                          </Typography>

                          <Stack spacing={1.5}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: '#333',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              <strong>Descrição:</strong> {section.description || 'Sem Descrição'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                              <strong>Visibilidade:</strong>{' '}
                              {section.public ? 'Pública' : 'Privada'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                              <strong>Criado em:</strong> {formatDate(section.createdAt)}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333' }}>
                              <strong>Atualizado em:</strong> {formatDate(section.updatedAt)}
                            </Typography>
                          </Stack>

                          {section.mediaItems.length > 0 && (
                            <Box mt={3}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                color="primary"
                                textAlign="center"
                                mb={2}
                              >
                                Itens de Mídia
                              </Typography>
                              <Stack spacing={2}>
                                {section.mediaItems.map((item) => (
                                  <Box
                                    key={item.id}
                                    sx={{
                                      p: 2,
                                      border: '1px solid #e0e0e0',
                                      borderRadius: 2,
                                      bgcolor: '#f9f9f9',
                                    }}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{ color: '#333', wordBreak: 'break-word' }}
                                    >
                                      <strong>Título:</strong>{' '}
                                      {item.title || item.originalName || 'Sem Título'}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: '#555', mt: 0.5, wordBreak: 'break-word' }}
                                    >
                                      <strong>Descrição:</strong>{' '}
                                      {item.description || 'Sem Descrição'}
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
                                      <Typography
                                        variant="body2"
                                        sx={{ color: '#555', wordBreak: 'break-word' }}
                                      >
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
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', padding: '5px' }}>
        <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={() => page && navigate(`/${page.route?.path}`)}
          disabled={!page || !page.route}
          sx={{ minWidth: 100, ml: 2 }}
        >
          Acessar Página
        </Button>
      </DialogActions>
    </Dialog>
  );
}
