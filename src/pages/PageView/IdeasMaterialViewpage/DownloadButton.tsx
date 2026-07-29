import { useState, useEffect, useRef } from 'react';
import { Button, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    } catch {
    } finally {
      if (mountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
      onClick={handleDownload}
      disabled={disabled || loading}
      size={size}
      fullWidth={fullWidth}
      sx={{
        borderRadius: { xs: 1.5, sm: 2 },
        textTransform: 'none',
        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
        py: { xs: 0.4, sm: 0.5, md: 0.75 },
        minHeight: { xs: 28, sm: 32, md: 36 },
        '&:hover': {
          bgcolor: 'primary.dark',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      {loading ? 'Baixando...' : 'Baixar'}
    </Button>
  );
}
