import { useState, type ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

interface PlayThumbnailImageProps {
  src: string;
  /** O que aparece no lugar quando a capa não carrega. */
  fallback?: ReactNode;
  sx: SxProps<Theme>;
  lazy?: boolean;
}

/** Capa de vídeo que some (com substituto) em vez de mostrar imagem quebrada. */
export default function PlayThumbnailImage({ src, fallback = null, sx, lazy = false }: PlayThumbnailImageProps) {
  // Guardar o endereço que falhou deixa uma capa nova tentar de novo.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) return <>{fallback}</>;

  return (
    <Box
      data-testid="play-thumbnail-image"
      component="img"
      src={src}
      alt=""
      loading={lazy ? 'lazy' : undefined}
      onError={() => setFailedSrc(src)}
      sx={sx}
    />
  );
}
