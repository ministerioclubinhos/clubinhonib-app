import { lazy, Suspense, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { DocumentLoadError, loadDocumentBytes } from './loadDocumentBytes';
import { DocumentFormat, DocumentViewTarget } from './types';

const PdfRenderer = lazy(() => import('./renderers/PdfRenderer'));
const DocxRenderer = lazy(() => import('./renderers/DocxRenderer'));
const PptxRenderer = lazy(() => import('./renderers/PptxRenderer'));

type ViewerTarget = Extract<DocumentViewTarget, { mode: 'viewer' }>;

interface Props {
  target: ViewerTarget;
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; bytes: ArrayBuffer; objectUrl: string }
  | { status: 'failed'; message: string };

const centered = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 400,
  height: '100%',
  px: 3,
  textAlign: 'center',
  gap: 1.5,
  color: 'text.secondary',
} as const;

/** Renderiza PDF/DOCX/PPTX com biblioteca própria; se falhar, oferece abrir/baixar. */
export default function DocumentViewer({ target }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    setState({ status: 'loading' });
    loadDocumentBytes(target.url, controller.signal)
      .then((bytes) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([bytes]));
        setState({ status: 'ready', bytes, objectUrl });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof DocumentLoadError
            ? error.message
            : 'Não foi possível carregar o documento.';
        console.error('Falha ao carregar o documento:', error);
        setState({ status: 'failed', message });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [target.url]);

  const fail = () => setState({ status: 'failed', message: 'Não foi possível exibir este documento aqui.' });

  if (state.status === 'loading') {
    return (
      <Box sx={centered}>
        <CircularProgress />
        <Typography variant="body2">Carregando documento…</Typography>
      </Box>
    );
  }

  if (state.status === 'failed') {
    return (
      <Box sx={centered} role="alert">
        <Typography variant="h6" fontWeight={600}>{state.message}</Typography>
        <Typography variant="body2">Você ainda pode abrir o arquivo em uma nova aba ou baixá-lo.</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button component="a" href={target.url} target="_blank" rel="noopener noreferrer" variant="contained" startIcon={<OpenInNewIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Abrir em nova aba
          </Button>
          <Button component="a" href={target.url} download={target.fileName} startIcon={<DownloadIcon />} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Baixar
          </Button>
        </Box>
      </Box>
    );
  }

  const Renderer =
    target.format === DocumentFormat.PDF
      ? PdfRenderer
      : target.format === DocumentFormat.DOCX
        ? DocxRenderer
        : PptxRenderer;

  return (
    <Suspense fallback={<Box sx={centered}><CircularProgress /></Box>}>
      <Box sx={{ height: '100%' }} data-testid={`document-viewer-${target.format}`}>
        <Renderer bytes={state.bytes} objectUrl={state.objectUrl} onError={fail} />
      </Box>
    </Suspense>
  );
}
