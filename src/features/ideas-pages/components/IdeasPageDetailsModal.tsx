import React from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Button, Divider, Grid, Paper, Stack, Chip
} from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';
import { IdeasPageData, IdeasSection } from 'store/slices/ideas/ideasSlice';
import { formatPtBrDate } from '../utils';

interface Props {
  page: IdeasPageData | null;
  open: boolean;
  onClose: () => void;
}

const hasRoutePath = (
  page: IdeasPageData | null
): page is IdeasPageData & { route: { path: string } } =>
  !!(page && page.route && typeof page.route.path === 'string');

export default function IdeasPageDetailsModal({ page, open, onClose }: Props) {
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copiada com sucesso!');
    });
  };

  const renderMediaPreview = (media: any) => {
    switch (media.mediaType) {
      case 'image':
        return (
          <img
            src={media.url}
            alt={media.title}
            style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
            loading="lazy"
          />
        );
      case 'video':
        return media.uploadType === 'link' && media.platformType === 'youtube' ? (
          <iframe
            src={`https://www.youtube.com/embed/${media.url.split('v=')[1]?.split('&')[0]}`}
            title={media.title}
            style={{ maxWidth: '100%', height: 150 }}
            allowFullScreen
          />
        ) : (
          <video controls style={{ maxWidth: '100%', maxHeight: 150 }}>
            <source src={media.url} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>
        );
      case 'document':
        return (
          <Button
            variant="outlined"
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Baixar documento ${media.title}`}
          >
            Baixar Documento
          </Button>
        );
      case 'audio':
        return (
          <audio controls style={{ width: '100%' }}>
            <source src={media.url} type="audio/mpeg" />
            Seu navegador não suporta áudio.
          </audio>
        );
      default:
        return null;
    }
  };

  const renderMediaGroup = (section: IdeasSection, type: string) => {
    if (!Array.isArray(section.medias)) return null;
    const items = section.medias.filter((m) => m.mediaType === type);
    if (!items.length) return null;

    return (
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mt: 3, bgcolor: '#fcfcfc' }}>
        <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
          {type[0].toUpperCase() + type.slice(1)}s
        </Typography>
        <Grid container spacing={3}>
          {items.map((media) => (
            <Grid item xs={12} sm={6} md={4} key={media.id}>
              <Box
                sx={{
                  p: 2, borderRadius: 2, border: '1px solid #ddd', bgcolor: '#fff',
                  height: '100%', display: 'flex', flexDirection: 'column', gap: 1,
                }}
              >
                {renderMediaPreview(media)}
                <Typography variant="body1" fontWeight="medium">{media.title}</Typography>
                <Typography variant="body2" color="text.secondary">{media.description}</Typography>
                <Typography variant="body2" color="text.secondary"><strong>Upload:</strong> {media.uploadType}</Typography>
                <Typography variant="body2" color="text.secondary"><strong>Local:</strong> {media.isLocalFile ? 'Sim' : 'Não'}</Typography>
                {media.originalName && (
                  <Typography variant="body2" color="text.secondary"><strong>Arquivo:</strong> {media.originalName}</Typography>
                )}
                {media.size && (
                  <Typography variant="body2" color="text.secondary"><strong>Tamanho:</strong> {(media.size / 1024).toFixed(1)} KB</Typography>
                )}
                <Box display="flex" alignItems="center" gap={1} mt={1} flexWrap="wrap">
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1 }}>
                    <strong>URL:</strong>{' '}
                    <a href={media.url} target="_blank" rel="noopener noreferrer">{media.url}</a>
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyUrl(media.url)}
                    aria-label={`Copiar URL de ${media.title}`}
                    sx={{ color: 'primary.main' }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="dialog-title">
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }} aria-label="Fechar modal">
        <Close />
      </IconButton>

      <DialogTitle id="dialog-title" sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.75rem', pb: 2 }}>
        Detalhes da Página de Ideias
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {page && (
          <Stack spacing={4}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" textAlign="center" fontWeight="bold" color="primary" mb={3}>
                Informações Gerais
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Título:</strong> {page.title}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Subtítulo:</strong> {page.subtitle}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Descrição:</strong> {page.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Criado em:</strong> {formatPtBrDate(page.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Atualizado em:</strong> {formatPtBrDate(page.updatedAt)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    label={page.public ? 'Pública' : 'Privada'}
                    color={page.public ? 'success' : 'default'}
                    aria-label={`Página ${page.public ? 'pública' : 'privada'}`}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Divider />

            {Array.isArray(page.sections) && page.sections.map((section) => (
              <Paper key={section.id} elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" textAlign="center" fontWeight="bold" color="primary" mb={2}>
                  {section.title}
                </Typography>
                <Typography variant="body1" mb={2}><strong>Descrição:</strong> {section.description}</Typography>
                <Chip
                  label={section.public ? 'Seção Pública' : 'Seção Privada'}
                  color={section.public ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 3 }}
                  aria-label={`Seção ${section.public ? 'pública' : 'privada'}`}
                />
                {['document', 'video', 'image', 'audio'].map((type) => renderMediaGroup(section, type))}
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" aria-label="Fechar modal">Fechar</Button>
        {hasRoutePath(page) && (
          <Button
            variant="contained"
            onClick={() => window.open(`/${page.route.path}`, '_blank')}
            aria-label="Acessar página em nova aba"
          >
            Acessar Página
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
