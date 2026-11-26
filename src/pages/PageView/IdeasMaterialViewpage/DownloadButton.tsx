import { useState, useEffect, useRef } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface DownloadButtonProps {
  url: string;
  filename?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export default function DownloadButton({ 
  url, 
  filename, 
  disabled = false,
  size = 'small',
  fullWidth = false 
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const handleDownload = async () => {
    if (disabled || loading) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    window.open(url, '_blank', 'noopener,noreferrer');

    setLoading(true);
    try {
      const response = await fetch(url, { signal: controller.signal });
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (downloadError) {
      // A aba já foi aberta com o arquivo; o download direto é um extra que
      // falha em URL de outro domínio sem CORS.
      if (!controller.signal.aborted) {
        console.warn('Falha ao baixar o documento diretamente:', downloadError);
      }
    } finally {
      if (mountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <Button data-testid="page-view-ideas-material-viewpage-download-button"
      variant="contained"
      color="primary"
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
      onClick={handleDownload}
      disabled={disabled || loading}
      size={size}
      fullWidth={fullWidth}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        // 44 px é o alvo mínimo de toque das telas do site; o botão vinha com
        // 28 px de altura e letra de 0,7 rem no celular.
        minHeight: 44,
        px: 2,
        '&:hover': { bgcolor: 'primary.dark' },
      }}
    >
      {loading ? 'Baixando...' : 'Baixar'}
    </Button>
  );
}
