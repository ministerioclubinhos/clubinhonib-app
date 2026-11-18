import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { RendererProps } from './types';

export default function DocxRenderer({ bytes, onError }: RendererProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLDivElement>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    const body = bodyRef.current;
    const styles = styleRef.current;
    if (!body || !styles) return;
    let cancelled = false;

    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        if (cancelled) return;
        await renderAsync(new Blob([bytes]), body, styles, {
          className: 'docx-view',
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
        });
      } catch (error: unknown) {
        if (!cancelled) {
          console.error('Falha ao renderizar o DOCX:', error);
          onErrorRef.current();
        }
      }
    })();

    return () => {
      cancelled = true;
      body.replaceChildren();
      styles.replaceChildren();
    };
  }, [bytes]);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'grey.200' }}>
      <div ref={styleRef} />
      {/* O estilo do docx-preview é escopado em .docx-view; o fundo cinza vem do wrapper dele. */}
      <div ref={bodyRef} />
    </Box>
  );
}
