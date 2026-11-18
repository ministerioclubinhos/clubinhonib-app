import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { MAX_SLIDE_WIDTH } from '../constants';
import { RendererProps } from './types';

export default function PptxRenderer({ bytes, onError }: RendererProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    (async () => {
      try {
        const { init } = await import('pptx-preview');
        if (cancelled) return;
        const width = Math.min(MAX_SLIDE_WIDTH, Math.max(280, host.clientWidth - 24));
        // A altura inicial é só um palpite 16:9: a proporção real vem do arquivo
        // (A4, 4:3...) e é aplicada logo depois da renderização.
        const previewer = init(host, { width, height: Math.round((width * 9) / 16) });
        await previewer.preview(bytes.slice(0));
        if (cancelled) return;
        host.querySelectorAll<HTMLElement>('.pptx-preview-wrapper').forEach((wrapper) => {
          // Sem isso o wrapper corta o slide na altura 16:9 e cria uma rolagem interna.
          wrapper.style.height = 'auto';
          wrapper.style.overflow = 'visible';
        });
      } catch (error: unknown) {
        if (!cancelled) {
          console.error('Falha ao renderizar o PPTX:', error);
          onErrorRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [bytes]);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'grey.200', p: 1.5 }}>
      <div ref={hostRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} />
    </Box>
  );
}
