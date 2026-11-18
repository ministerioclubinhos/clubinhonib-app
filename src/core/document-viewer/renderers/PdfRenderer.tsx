import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Document, Page, pdfjs } from 'react-pdf';
import { MAX_PAGE_WIDTH } from '../constants';
import { RendererProps } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfRenderer({ objectUrl, onError }: RendererProps) {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(MAX_PAGE_WIDTH);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.min(MAX_PAGE_WIDTH, Math.max(240, Math.floor(entry.contentRect.width) - 16));
      // Tolerância: evita regravar o estado por oscilações de poucos pixels.
      setWidth((current) => (Math.abs(current - next) <= 2 ? current : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        ref={wrapperRef}
        // scrollbarGutter reserva a calha da barra: sem isso a barra aparece/some, muda a
        // largura medida e a página redimensiona em laço.
        sx={{ flex: 1, minHeight: 0, overflow: 'auto', scrollbarGutter: 'stable', display: 'flex', justifyContent: 'center', p: 1 }}
      >
        <Document
          file={objectUrl}
          onLoadSuccess={({ numPages }) => setPages(numPages)}
          onLoadError={onError}
          loading={<CircularProgress sx={{ m: 6 }} />}
          error={null}
        >
          <Page
            pageNumber={page}
            width={width}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            onRenderError={onError}
            loading={<CircularProgress sx={{ m: 6 }} />}
          />
        </Document>
      </Box>
      {pages > 1 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 0.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <IconButton aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 96, textAlign: 'center' }}>
            Página {page} de {pages}
          </Typography>
          <IconButton aria-label="Próxima página" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
