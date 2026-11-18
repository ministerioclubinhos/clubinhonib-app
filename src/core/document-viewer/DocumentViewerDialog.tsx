import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Button,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { useEffect, useRef, useState } from 'react';
import { MediaItem } from 'store/slices/types';
import DocumentViewer from './DocumentViewer';
import { getDocumentViewTarget } from './utils';
import { downloadDocumentFile, isUploadedMedia } from './downloadDocument';

interface Props {
  open: boolean;
  onClose: () => void;
  media: MediaItem | null;
  title?: string;
}

export default function DocumentViewerDialog({ open, onClose, media, title }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const target = media ? getDocumentViewTarget(media) : null;
  const isUpload = isUploadedMedia(media);
  const [downloading, setDownloading] = useState(false);
  // Celular não tem espaço para o iframe; sites que proíbem moldura também não funcionam nele.
  const opensInNewTab = Boolean(target) && (isMobile || target?.mode === 'newTab');
  const [popupBlocked, setPopupBlocked] = useState(false);

  useEffect(() => {
    setPopupBlocked(false);
    if (!open || !media || !target || !opensInNewTab) return;

    const opened = window.open(target.url, '_blank', 'noopener,noreferrer');

    // Sem gesto do usuário (o documento é buscado antes) o navegador pode bloquear
    // a aba: nesse caso o modal fica com o botão "Abrir em nova aba".
    if (!opened && !isMobile) {
      setPopupBlocked(true);
      return;
    }

    // O download de conveniência só vale para arquivo enviado: um link externo
    // não pode ser lido por fetch (CORS) e nem deve ser baixado.
    if (isMobile && isUpload) {
      downloadDocumentFile(media).catch((error: unknown) => {
        console.error('Falha ao baixar o documento:', error);
      });
    }

    onCloseRef.current();
  }, [open, media, target?.url, opensInNewTab, isMobile, isUpload]);

  if (!media || (opensInNewTab && open && !popupBlocked)) return null;

  const embedUrl = target?.mode === 'embed' ? target.url : '';
  const viewerTarget = target?.mode === 'viewer' ? target : null;
  const externalUrl = target?.url ?? '';
  const displayTitle = title || media.title || 'Visualizar documento';

  return (
    <Dialog data-testid="utils-media-document-preview-modal"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: '95%',
          maxHeight: '95vh',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: '#81d742',
          color: 'white',
          fontWeight: 700,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionOutlinedIcon />
          {displayTitle}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }} aria-label="Fechar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'grey.100', minHeight: 480 }}>
        {popupBlocked || (target?.mode === 'newTab') ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: 'text.secondary',
              px: 3,
              textAlign: 'center',
              gap: 1.5,
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 56, opacity: 0.6 }} />
            <Typography variant="h6" fontWeight={600}>
              Este documento abre na plataforma de origem
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 420 }}>
              Esse site não permite exibir o arquivo aqui dentro. Abra em uma nova aba para ver o documento.
            </Typography>
            <Button
              component="a"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<OpenInNewIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}
            >
              Abrir em nova aba
            </Button>
          </Box>
        ) : viewerTarget ? (
          <Box sx={{ height: '78vh' }}>
            <DocumentViewer target={viewerTarget} />
          </Box>
        ) : embedUrl ? (
          <Box
            component="iframe"
            src={embedUrl}
            title={displayTitle}
            sx={{
              width: '100%',
              height: '78vh',
              border: 'none',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: 'text.secondary',
              px: 3,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nenhum documento disponível
            </Typography>
            <Typography variant="body2">
              Não há URL ou arquivo vinculado para visualização.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
        {isUpload && media && (
          <Button
            data-testid="document-viewer-download"
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadDocumentFile(media);
              } catch (error: unknown) {
                console.error('Falha ao baixar o documento:', error);
                window.open(media.url, '_blank', 'noopener,noreferrer');
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
            startIcon={<DownloadIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {downloading ? 'Baixando...' : 'Baixar'}
          </Button>
        )}
        {(embedUrl || viewerTarget) && (
          <Button
            component="a"
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Abrir em nova aba
          </Button>
        )}
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
