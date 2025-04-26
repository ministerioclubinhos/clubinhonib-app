import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';
import { IdeasPageData, IdeasSection } from 'store/slices/ideas/ideasSlice';

interface Props {
  page: IdeasPageData | null;
  open: boolean;
  onClose: () => void;
}

// Type guard to check if page has a valid route and path
const hasRoutePath = (
  page: IdeasPageData | null
): page is IdeasPageData & { route: { path: string } } => {
  return !!(page && page.route && typeof page.route.path === 'string');
};

export default function IdeasPageDetailsModal({ page, open, onClose }: Props) {
  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleString('pt-BR') : 'Não disponível';

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
        return <Typography variant="body2">[Documento - Clique na URL para acessar]</Typography>;
      case 'audio':
        return (
          <audio controls>
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
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mt: 2, bgcolor: '#fcfcfc' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary" mb={2}>
          {type[0].toUpperCase() + type.slice(1)}s
        </Typography>
        <Grid container spacing={2}>
          {items.map((media) => (
            <Grid item xs={12} sm={6} md={4} key={media.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #ddd',
                  bgcolor: '#fff',
                  height: '100%',
                }}
              >
                {renderMediaPreview(media)}
                <Typography mt={1}>
                  <strong>Título:</strong> {media.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Descrição:</strong> {media.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Upload:</strong> {media.uploadType}
                </Typography>
                <Typography variant="body2">
                  <strong>Local:</strong> {media.isLocalFile ? 'Sim' : 'Não'}
                </Typography>
                {media.originalName && (
                  <Typography variant="body2">
                    <strong>Arquivo:</strong> {media.originalName}
                  </Typography>
                )}
                {media.size && (
                  <Typography variant="body2">
                    <strong>Tamanho:</strong> {(media.size / 1024).toFixed(1)} KB
                  </Typography>
                )}
                <Box display="flex" alignItems="center" gap={1} mt={1} flexWrap="wrap">
                  <Typography variant="body2" sx={{ wordBreak: 'break-word', flex: 1 }}>
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
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" aria-labelledby="dialog-title">
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 8, right: 8 }}
        aria-label="Fechar modal"
      >
        <Close />
      </IconButton>

      <DialogTitle
        id="dialog-title"
        sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}
      >
        Detalhes da Página de Ideias
      </DialogTitle>

      <DialogContent>
        {page && (
          <Stack spacing={4}>
            {page.route?.image && (
              <Box textAlign="center">
                <img
                  src={page.route.image}
                  alt={`Imagem da página ${page.title}`}
                  style={{ maxHeight: 200, borderRadius: 12, marginBottom: 16 }}
                  loading="lazy"
                />
              </Box>
            )}

            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="primary" mb={3}>
                Informações Gerais
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Título:</strong> {page.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Subtítulo:</strong> {page.subtitle}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Descrição:</strong> {page.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Criado em:</strong> {formatDate(page.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography>
                    <strong>Atualizado em:</strong> {formatDate(page.updatedAt)}
                  </Typography>
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

            {Array.isArray(page.sections) &&
              page.sections.map((section) => (
                <Paper key={section.id} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography
                    variant="h6"
                    textAlign="center"
                    fontWeight="bold"
                    color="primary"
                    mb={2}
                  >
                    {section.title}
                  </Typography>
                  <Typography mb={1}>
                    <strong>Descrição:</strong> {section.description}
                  </Typography>
                  <Chip
                    label={section.public ? 'Seção Pública' : 'Seção Privada'}
                    color={section.public ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 2 }}
                    aria-label={`Seção ${section.public ? 'pública' : 'privada'}`}
                  />
                  {['document', 'video', 'image', 'audio'].map((type) =>
                    renderMediaGroup(section, type)
                  )}
                </Paper>
              ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
        <Button onClick={onClose} variant="outlined" aria-label="Fechar modal">
          Fechar
        </Button>
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
