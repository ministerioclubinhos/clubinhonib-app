import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';

import {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

import { IdeasMediaResponse, IdeasPageResponse } from '../types';
import { copyToClipboard, formatPtBrDate } from '../utils';

interface IdeasPageDetailsModalProps {
  page: IdeasPageResponse | null;
  open: boolean;
  onClose: () => void;
}

/** Grupos de mídia exibidos, na ordem em que aparecem no detalhe. */
const MEDIA_GROUPS: ReadonlyArray<{ mediaType: MediaType; label: string }> = [
  { mediaType: MediaType.DOCUMENT, label: 'Documentos' },
  { mediaType: MediaType.VIDEO, label: 'Vídeos' },
  { mediaType: MediaType.IMAGE, label: 'Imagens' },
  { mediaType: MediaType.AUDIO, label: 'Áudios' },
];

/** Id do vídeo em uma URL do YouTube, quando ela tem o parâmetro `v`. */
const youtubeEmbedUrl = (url: string): string | null => {
  const videoId = url.split('v=')[1]?.split('&')[0];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

function MediaPreview({ media }: { media: IdeasMediaResponse }) {
  if (media.mediaType === MediaType.IMAGE) {
    return (
      <img
        src={media.url}
        alt={media.title}
        style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
        loading="lazy"
      />
    );
  }

  if (media.mediaType === MediaType.VIDEO) {
    const embedUrl =
      media.uploadType === MediaUploadType.LINK &&
      media.platformType === MediaPlatform.YOUTUBE
        ? youtubeEmbedUrl(media.url)
        : null;

    return embedUrl ? (
      <iframe
        src={embedUrl}
        title={media.title}
        style={{ maxWidth: '100%', height: 150, border: 0 }}
        allowFullScreen
      />
    ) : (
      <video controls style={{ maxWidth: '100%', maxHeight: 150 }}>
        <source src={media.url} type="video/mp4" />
        Seu navegador não suporta vídeo.
      </video>
    );
  }

  if (media.mediaType === MediaType.DOCUMENT) {
    return (
      <Button
        variant="outlined"
        aria-label={`Abrir documento ${media.title}`}
        onClick={() => window.open(media.url, '_blank', 'noopener,noreferrer')}
        sx={{ minHeight: 44, textTransform: 'none' }}
      >
        Abrir documento
      </Button>
    );
  }

  if (media.mediaType === MediaType.AUDIO) {
    return (
      <audio controls style={{ width: '100%' }}>
        <source src={media.url} type="audio/mpeg" />
        Seu navegador não suporta áudio.
      </audio>
    );
  }

  return null;
}

/** Detalhes completos de uma página de ideias, seção a seção. */
export default function IdeasPageDetailsModal({
  page,
  open,
  onClose,
}: IdeasPageDetailsModalProps) {
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleCopyUrl = async (url: string) => {
    const copied = await copyToClipboard(url);
    setCopyFeedback(copied ? 'URL copiada!' : 'Não foi possível copiar a URL.');
  };

  const renderMediaGroup = (
    medias: IdeasMediaResponse[],
    mediaType: MediaType,
    label: string,
  ) => {
    const items = medias.filter((media) => media.mediaType === mediaType);
    if (items.length === 0) return null;

    return (
      <Paper
        key={mediaType}
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mt: 3 }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="primary" mb={2}>
          {label}
        </Typography>

        <Grid2 container spacing={3}>
          {items.map((media) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={media.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <MediaPreview media={media} />

                <Typography variant="body1" fontWeight={500}>
                  {media.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {media.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Origem:</strong>{' '}
                  {media.isLocalFile ? 'Arquivo enviado' : 'Link externo'}
                </Typography>
                {media.originalName && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Arquivo:</strong> {media.originalName}
                  </Typography>
                )}
                {media.size ? (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tamanho:</strong> {(media.size / 1024).toFixed(1)} KB
                  </Typography>
                ) : null}

                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt={1}
                  flexWrap="wrap"
                >
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: 'break-word', flex: 1 }}
                  >
                    <strong>URL:</strong>{' '}
                    <a href={media.url} target="_blank" rel="noopener noreferrer">
                      {media.url}
                    </a>
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
            </Grid2>
          ))}
        </Grid2>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="ideas-page-details-title"
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 16, right: 16 }}
        aria-label="Fechar modal"
      >
        <Close />
      </IconButton>

      <DialogTitle
        id="ideas-page-details-title"
        sx={{ textAlign: 'center', fontWeight: 700, pb: 2 }}
      >
        Detalhes da Página de Ideias
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {page && (
          <Stack spacing={4}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <Typography
                variant="h6"
                textAlign="center"
                fontWeight={700}
                color="primary"
                mb={3}
              >
                Informações gerais
              </Typography>

              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1">
                    <strong>Título:</strong> {page.title}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1">
                    <strong>Subtítulo:</strong> {page.subtitle || '—'}
                  </Typography>
                </Grid2>
                <Grid2 size={12}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Descrição:</strong> {page.description}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1">
                    <strong>Criado em:</strong> {formatPtBrDate(page.createdAt)}
                  </Typography>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Typography variant="body1">
                    <strong>Atualizado em:</strong>{' '}
                    {formatPtBrDate(page.updatedAt)}
                  </Typography>
                </Grid2>
                <Grid2 size={12}>
                  <Chip
                    label={page.public ? 'Pública' : 'Privada'}
                    color={page.public ? 'success' : 'default'}
                    aria-label={`Página ${page.public ? 'pública' : 'privada'}`}
                  />
                </Grid2>
              </Grid2>
            </Paper>

            <Divider />

            {page.sections.map((section) => (
              <Paper
                key={section.id}
                variant="outlined"
                sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}
              >
                <Typography
                  variant="h6"
                  textAlign="center"
                  fontWeight={700}
                  color="primary"
                  mb={2}
                >
                  {section.title}
                </Typography>
                <Typography variant="body1" mb={2}>
                  <strong>Descrição:</strong> {section.description}
                </Typography>
                <Chip
                  label={section.public ? 'Seção pública' : 'Seção restrita'}
                  color={section.public ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 1 }}
                  aria-label={`Seção ${section.public ? 'pública' : 'restrita'}`}
                />

                {MEDIA_GROUPS.map((group) =>
                  renderMediaGroup(
                    section.medias,
                    group.mediaType,
                    group.label,
                  ),
                )}
              </Paper>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" aria-label="Fechar modal">
          Fechar
        </Button>
        {page?.route?.path && (
          <Button
            variant="contained"
            onClick={() => window.open(`/${page.route.path}`, '_blank')}
            aria-label="Acessar página em nova aba"
          >
            Acessar página
          </Button>
        )}
      </DialogActions>

      <Snackbar
        open={Boolean(copyFeedback)}
        autoHideDuration={2500}
        onClose={() => setCopyFeedback('')}
        message={copyFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
}
