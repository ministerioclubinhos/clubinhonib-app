import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close, DescriptionOutlined, OpenInNew } from '@mui/icons-material';

import type { MediaItem } from '@/store/slices/types';

import { MediaViewKind } from './types';
import { resolveMediaView } from './utils';

interface MediaViewerDialogProps {
  media: MediaItem | null;
  onClose: () => void;
}

/**
 * Visualizador único das mídias do editor: imagem, vídeo, áudio, PDF e links
 * (Drive, YouTube...). Tela cheia no celular. Formatos que o navegador não
 * renderiza (como .docx) oferecem abrir/baixar em vez de uma moldura vazia.
 */
export default function MediaViewerDialog({ media, onClose }: MediaViewerDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const view = media ? resolveMediaView(media) : null;
  const title = media?.title?.trim() || media?.originalName || 'Visualizar material';

  return (
    <Dialog
      data-testid="media-viewer-dialog"
      open={Boolean(media)}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1, overflowWrap: 'anywhere' }}
      >
        <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
          {title}
        </Box>
        <IconButton aria-label="Fechar" onClick={onClose} sx={{ width: 44, height: 44 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {view?.kind === MediaViewKind.IMAGE && (
          <Box
            data-testid="media-viewer-image"
            component="img"
            src={view.src}
            alt={title}
            sx={{ maxWidth: '100%', maxHeight: { xs: '80dvh', sm: '75vh' }, objectFit: 'contain' }}
          />
        )}
        {view?.kind === MediaViewKind.VIDEO_FILE && (
          <Box
            data-testid="media-viewer-video"
            component="video"
            src={view.src}
            controls
            playsInline
            sx={{ width: '100%', maxHeight: '75vh', bgcolor: 'common.black' }}
          />
        )}
        {view?.kind === MediaViewKind.AUDIO_FILE && (
          <Box sx={{ width: '100%', p: 3 }}>
            <Box
              data-testid="media-viewer-audio"
              component="audio"
              src={view.src}
              controls
              sx={{ width: '100%' }}
            />
          </Box>
        )}
        {view?.kind === MediaViewKind.EMBED && (
          <Box
            data-testid="media-viewer-embed"
            component="iframe"
            src={view.src}
            title={title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            sx={{
              width: '100%',
              height: { xs: 'calc(100dvh - 128px)', sm: '75vh' },
              border: 0,
              bgcolor: 'common.white',
            }}
          />
        )}
        {view?.kind === MediaViewKind.DOWNLOAD && (
          <Box data-testid="media-viewer-download" sx={{ py: 6, px: 3, textAlign: 'center' }}>
            <DescriptionOutlined color="primary" sx={{ fontSize: 56, mb: 1 }} />
            <Typography gutterBottom>
              Este formato (Word) não abre dentro do app. Abra ou baixe o arquivo para conferir.
            </Typography>
            <Button
              component="a"
              href={view.src}
              target="_blank"
              rel="noopener noreferrer"
              download={media?.originalName ?? media?.file?.name}
              startIcon={<OpenInNew />}
              variant="contained"
              sx={{ minHeight: 44, mt: 1 }}
            >
              Abrir arquivo
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <Button type="button" onClick={onClose} sx={{ minHeight: 44 }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
