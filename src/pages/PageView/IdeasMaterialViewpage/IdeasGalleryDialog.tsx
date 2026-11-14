import {
  Box,
  Dialog,
  DialogContent,
  Grid2,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { MediaType, type MediaItem } from '@/store/slices/types';

import IdeasDocumentViewer from './IdeasDocumentViewer';
import IdeasImageGalleryView from './IdeasImageGalleryView';
import IdeasVideoPlayerView from './IdeasVideoPlayerView';
import { TOUCH_TARGET, type IdeasMediaKind } from './constants';

interface IdeasGalleryDialogProps {
  open: boolean;
  /** A seção de onde a galeria foi aberta, mostrada como contexto. */
  sectionTitle: string;
  kind: IdeasMediaKind | null;
  items: MediaItem[];
  onClose: () => void;
}

/**
 * O visualizador do tipo de mídia pedido.
 *
 * É uma função de renderização, e não um componente: quem carrega o seletor de
 * teste é cada visualizador, e uma casca a mais só acrescentaria um nó vazio.
 */
function renderMediaViewer(item: MediaItem, mediaType: MediaType) {
  if (mediaType === MediaType.VIDEO || mediaType === MediaType.AUDIO) {
    return <IdeasVideoPlayerView video={item} />;
  }

  if (mediaType === MediaType.DOCUMENT) {
    return <IdeasDocumentViewer document={item} />;
  }

  return <IdeasImageGalleryView image={item} />;
}

/**
 * A galeria de um tipo de mídia de uma seção.
 *
 * É um diálogo só, montado pela página, no lugar de um por tipo por seção —
 * todos `keepMounted`, o que deixava nove diálogos vivos numa página com três
 * seções. Ele ocupa a tela inteira no celular, onde é onde a maioria abre.
 */
export default function IdeasGalleryDialog({
  open,
  sectionTitle,
  kind,
  items,
  onClose,
}: IdeasGalleryDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog data-testid="page-view-ideas-material-viewpage-ideas-gallery-dialog"
      open={open && Boolean(kind)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      aria-labelledby="ideas-gallery-title"
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        {kind && <Box sx={{ color: `${kind.color}.main`, display: 'flex' }}>{kind.icon}</Box>}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="ideas-gallery-title" variant="h6" fontWeight={800} noWrap>
            {kind ? `${kind.label} · ${items.length}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {sectionTitle}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Fechar"
          sx={{ width: TOUCH_TARGET, height: TOUCH_TARGET }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'background.default' }}>
        {items.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Nenhum material aqui ainda.
            </Typography>
          </Stack>
        ) : (
          <Grid2 container spacing={{ xs: 1.5, sm: 2 }}>
            {items.map((item, index) => (
              // Uma coluna no celular e duas a partir de md — mas um item
              // sozinho ocupa a largura toda, em vez de deixar meia tela vazia.
              // A versão anterior chegava a quatro colunas, e cada vídeo virava
              // um selo ilegível.
              <Grid2 key={item.id ?? index} size={{ xs: 12, md: items.length === 1 ? 12 : 6 }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  {kind && renderMediaViewer(item, kind.mediaType)}
                </Box>
              </Grid2>
            ))}
          </Grid2>
        )}
      </DialogContent>
    </Dialog>
  );
}
