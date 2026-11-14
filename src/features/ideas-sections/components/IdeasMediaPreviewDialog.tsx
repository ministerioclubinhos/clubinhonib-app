import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { parseYoutubeVideoId } from '../share-utils';
import { IdeasPreviewKind } from '../types';
import type { IdeasPreviewMedia } from '../types';
import { previewKindFor } from '../utils';

interface IdeasMediaPreviewDialogProps {
  media: IdeasPreviewMedia | null;
  onClose: () => void;
}

/**
 * Visualiza imagem, vídeo e PDF da ideia sem tirar o admin da tela.
 *
 * Formatos que o navegador não renderiza (como .docx) não ganham uma moldura
 * vazia: o modal oferece o download no lugar.
 */
export default function IdeasMediaPreviewDialog({ media, onClose }: IdeasMediaPreviewDialogProps) {
  const kind = media ? previewKindFor(media) : null;
  const title = media?.title?.trim() || media?.originalName || 'Visualizar material';
  const youtubeId =
    media && kind === IdeasPreviewKind.YOUTUBE ? parseYoutubeVideoId(media.url) : null;

  return (
    <Dialog
      data-testid="ideas-media-preview-dialog"
      open={Boolean(media)}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ overflowWrap: 'anywhere' }}>{title}</DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'grey.100', p: 0 }}>
        {media && kind === IdeasPreviewKind.IMAGE && (
          <Box
            data-testid="ideas-media-preview-image"
            component="img"
            src={media.url}
            alt={title}
            sx={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
          />
        )}
        {media && kind === IdeasPreviewKind.VIDEO && (
          <Box
            data-testid="ideas-media-preview-video"
            component="video"
            src={media.url}
            controls
            playsInline
            sx={{ width: '100%', maxHeight: '75vh', bgcolor: 'common.black' }}
          />
        )}
        {media && kind === IdeasPreviewKind.YOUTUBE && youtubeId && (
          <Box
            data-testid="ideas-media-preview-youtube"
            component="iframe"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            title={title}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            sx={{ width: '100%', height: '70vh', border: 0 }}
          />
        )}
        {media && kind === IdeasPreviewKind.PDF && (
          <Box
            data-testid="ideas-media-preview-pdf"
            component="iframe"
            src={media.url}
            title={`PDF: ${title}`}
            sx={{ width: '100%', height: '75vh', border: 0 }}
          />
        )}
        {media && kind === IdeasPreviewKind.OTHER && (
          <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
            <Typography gutterBottom>Este formato não pode ser visualizado aqui.</Typography>
            <Button
              data-testid="ideas-media-preview-download"
              component="a"
              href={media.url}
              download
              rel="noreferrer"
              sx={{ minHeight: 44 }}
            >
              Baixar arquivo
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button type="button" onClick={onClose} sx={{ minHeight: 44 }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
